import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";
import { enqueueActivationEmails } from "@/lib/email/activation-emails.server";
import { provisionAppClient } from "@/lib/app-clients.server";

/**
 * Find an existing Stripe Customer by userId metadata, then by email,
 * otherwise create one. Putting userId on the Customer makes later
 * lookups via customers.search reliable across sandbox/live.
 */
async function resolveOrCreateCustomer(
  stripe: Stripe,
  options: { email?: string | null; userId?: string | null },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

/**
 * Create the Embedded Checkout session.
 *
 * Base service is $199 one-time (file preparation). The $10/month
 * Document Mailing Add-On is OPTIONAL and only added when the
 * customer opts in AND acknowledges the add-on terms. No trial —
 * mailing is charged immediately upon subscribe. The add-on can be
 * canceled at any time from the customer portal.
 *
 * Keep this checkout intentionally tax-neutral in test mode. Do not send
 * managed_payments, automatic_tax, billing_cycle_anchor, or proration_behavior
 * here: those options caused Stripe session creation failures in sandbox.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      language: string;
      returnUrl: string;
      environment: StripeEnv;
      customerEmail?: string;
      userId?: string;
      includeMailingAddon?: boolean;
      mailingAddonAcknowledged?: boolean;
    }) => {
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      if (typeof data.returnUrl !== "string" || !data.returnUrl.startsWith("http"))
        throw new Error("Invalid returnUrl");
      if (data.includeMailingAddon && !data.mailingAddonAcknowledged) {
        throw new Error("Mailing add-on requires acknowledgment of the Terms of Add-On Service.");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);

    const includeAddon = !!data.includeMailingAddon;

    const priceQueries: Promise<Stripe.ApiList<Stripe.Price>>[] = [
      stripe.prices.list({ lookup_keys: ["pretransfer_199"], limit: 1 }),
    ];
    if (includeAddon) {
      priceQueries.push(stripe.prices.list({ lookup_keys: ["pretransfer_10mo"], limit: 1 }));
    }
    const results = await Promise.all(priceQueries);
    const oneTime = results[0];
    const monthly = includeAddon ? results[1] : null;
    if (!oneTime.data.length) throw new Error("Base price not found");
    if (includeAddon && (!monthly || !monthly.data.length)) throw new Error("Add-on price not found");

    const customerId =
      data.customerEmail || data.userId
        ? await resolveOrCreateCustomer(stripe, {
            email: data.customerEmail,
            userId: data.userId,
          })
        : undefined;

    const lineItems: Array<{ price: string; quantity: number }> = [
      { price: oneTime.data[0].id, quantity: 1 },
    ];
    if (includeAddon && monthly) {
      lineItems.push({ price: monthly.data[0].id, quantity: 1 });
    }

    const sessionParams = {
      // Subscription mode ONLY when the mailing add-on is included.
      // Without it, this is a one-time $199 payment.
      mode: includeAddon ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      line_items: lineItems,
      ...(includeAddon && {
        subscription_data: {
          metadata: {
            language: data.language,
            mailing_addon: "true",
            mailing_addon_acknowledged: "true",
            ...(data.userId && { userId: data.userId }),
          },
        },
      }),
      ...(customerId && { customer: customerId }),
      metadata: {
        language: data.language,
        mailing_addon: includeAddon ? "true" : "false",
        ...(includeAddon && { mailing_addon_acknowledged: "true" }),
        ...(data.userId && { userId: data.userId }),
      },
    } satisfies Stripe.Checkout.SessionCreateParams;

    const session = await stripe.checkout.sessions.create(sessionParams);

    return session.client_secret;
  });

export const verifyAndCreateIntake = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!data.sessionId || typeof data.sessionId !== "string") throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);

    // Real gate: $199 must have been collected today.
    const paid = session.payment_status === "paid";
    if (!paid) return { paid: false as const };

    const language = (session.metadata?.language as string) || "en";
    const email =
      (session.customer_details && session.customer_details.email) ||
      (session.customer_email as string | null) ||
      null;

    const { error } = await supabaseAdmin.from("intake_submissions").upsert(
      {
        stripe_session_id: data.sessionId,
        language,
        email,
        paid: true,
      } as never,
      { onConflict: "stripe_session_id" },
    );
    if (error) throw new Error(error.message);

    return { paid: true as const, language, email };
  });

export const submitIntakeAnswers = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { sessionId: string; answers: Record<string, unknown>; environment: StripeEnv }) => {
      if (!data.sessionId) throw new Error("Invalid sessionId");
      if (!data.answers || typeof data.answers !== "object") throw new Error("Invalid answers");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.payment_status !== "paid") throw new Error("Payment not completed");

    const { error } = await supabaseAdmin
      .from("intake_submissions")
      .update({
        answers: data.answers as never,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("stripe_session_id", data.sessionId);
    if (error) throw new Error(error.message);

    try {
      const language = (session.metadata?.language as string) || "en";
      const a = data.answers as Record<string, unknown>;
      const contactEmail =
        (typeof a.contact_email === "string" && a.contact_email) ||
        (session.customer_details && session.customer_details.email) ||
        (session.customer_email as string | null) ||
        null;

      await enqueueIntakeNotification({
        sessionId: data.sessionId,
        answers: a,
        language,
        contactEmail,
      });
    } catch (e) {
      console.error("Intake notification email enqueue failed:", e);
    }

    // Provision the mobile-app client: 8-char activation code, contacts mirror,
    // activation email + SMS. Non-blocking — never fail intake on this.
    try {
      const language = (session.metadata?.language as string) || "en";
      await provisionAppClient({
        intakeSessionId: data.sessionId,
        language,
        answers: data.answers as Record<string, unknown>,
      });
    } catch (e) {
      console.error("App client provisioning failed:", e);
    }

    return { ok: true };
  });

/**
 * DEMO submit: skip Stripe, persist intake under a synthetic session id, and
 * fire the intake notification + welcome emails to BOTH the family contact
 * (section 7) and the at-risk person's emergency contact (section 6) with
 * an "Asset Protection Activated" demo banner. Insider/investor preview only.
 */
export const submitDemoIntake = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      answers: Record<string, unknown>;
      language: string;
      inviteCode?: string | null;
    }) => {
      if (!data.answers || typeof data.answers !== "object") throw new Error("Invalid answers");
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const sessionId = `demo-${crypto.randomUUID()}`;
    const a = data.answers as Record<string, unknown>;
    const contactEmail =
      (typeof a.contact_email === "string" && a.contact_email) || null;

    const { error } = await supabaseAdmin.from("intake_submissions").insert({
      stripe_session_id: sessionId,
      language: data.language,
      email: contactEmail,
      paid: true,
      answers: a as never,
    } as never);
    if (error) throw new Error(error.message);

    try {
      await enqueueIntakeNotification({
        sessionId,
        answers: a,
        language: data.language,
        contactEmail,
        demoMode: true,
        inviteCode: data.inviteCode ?? null,
      });
    } catch (e) {
      console.error("Demo intake notification failed:", e);
    }

    try {
      await provisionAppClient({
        intakeSessionId: sessionId,
        language: data.language,
        answers: a,
      });
    } catch (e) {
      console.error("Demo app client provisioning failed:", e);
    }

    return { ok: true, sessionId };
  });
