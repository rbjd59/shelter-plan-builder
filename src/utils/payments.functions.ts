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
 * Create the Embedded Checkout session for the DefensaSiempre emergency app.
 *
 * The app is a $10/month subscription. Attorney-created and reviewed documents
 * are provided at no additional charge.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      language: string;
      returnUrl: string;
      environment: StripeEnv;
      customerEmail?: string;
      userId?: string;
      discountPct?: number;
      submissionId?: string;
    }) => {
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      if (typeof data.returnUrl !== "string" || !data.returnUrl.startsWith("http"))
        throw new Error("Invalid returnUrl");
      if (data.discountPct != null && (data.discountPct < 0 || data.discountPct > 100))
        throw new Error("Invalid discountPct");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);

    const discountPct = data.discountPct && data.discountPct > 0 ? Math.round(data.discountPct) : 0;
    const LOOKUP_KEY = "emergency_app_10_monthly";

    // Find the recurring price; create it if missing so the app self-heals.
    let priceId: string;
    const priceList = await stripe.prices.list({ lookup_keys: [LOOKUP_KEY], limit: 1 });
    if (priceList.data.length) {
      priceId = priceList.data[0].id;
    } else {
      const product = await stripe.products.create({
        name: "DefensaSiempre Emergency App",
        description: "Monthly subscription for the DefensaSiempre emergency app.",
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 1000,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: LOOKUP_KEY,
      });
      priceId = price.id;
    }

    const customerId =
      data.customerEmail || data.userId
        ? await resolveOrCreateCustomer(stripe, {
            email: data.customerEmail,
            userId: data.userId,
          })
        : undefined;

    // Reduced-cost applicants get an idempotent percent-off coupon.
    let discounts: Array<{ coupon: string }> | undefined;
    if (discountPct > 0) {
      const couponId = `dd_reduced_${discountPct}`;
      try {
        await stripe.coupons.retrieve(couponId);
      } catch {
        await stripe.coupons.create({
          id: couponId,
          percent_off: discountPct,
          duration: "once",
          name: `DetencionDefensa reduced-cost ${discountPct}%`,
        });
      }
      discounts = [{ coupon: couponId }];
    }

    const sessionParams = {
      mode: "subscription" as const,
      ui_mode: "embedded_page" as const,
      return_url: data.returnUrl,
      line_items: [{ price: priceId, quantity: 1 }],
      ...(discounts && { discounts }),
      subscription_data: {
        description: "DefensaSiempre Emergency App subscription",
        metadata: {
          language: data.language,
          discount_pct: String(discountPct),
          ...(data.submissionId && { qualify_submission_id: data.submissionId }),
        },
      },
      ...(customerId && { customer: customerId }),
      metadata: {
        language: data.language,
        discount_pct: String(discountPct),
        ...(data.submissionId && { qualify_submission_id: data.submissionId }),
        ...(data.userId && { userId: data.userId }),
      },
    } satisfies Stripe.Checkout.SessionCreateParams;

    const session = await stripe.checkout.sessions.create(sessionParams);
    return session.client_secret;
  });

/**
 * Look up which add-ons were paid for on a completed checkout session.
 * Used by /agreement to persist purchase flags to localStorage so the
 * intake page can gate readiness-only sections.
 */
export const getSessionAddons = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!data.sessionId || typeof data.sessionId !== "string") throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const paid = session.payment_status === "paid";
    return {
      paid,
      readinessPaid: paid && session.metadata?.includes_readiness === "true",
      petRescuePaid: paid && session.metadata?.includes_pet_rescue === "true",
    };
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

    let intakeUrls: Awaited<ReturnType<typeof enqueueIntakeNotification>> = null;
    try {
      const language = (session.metadata?.language as string) || "en";
      const a = data.answers as Record<string, unknown>;
      const contactEmail =
        (typeof a.contact_email === "string" && a.contact_email) ||
        (session.customer_details && session.customer_details.email) ||
        (session.customer_email as string | null) ||
        null;

      intakeUrls = await enqueueIntakeNotification({
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
    let activationCode: string | null = null;
    try {
      const language = (session.metadata?.language as string) || "en";
      const provisioned = await provisionAppClient({
        intakeSessionId: data.sessionId,
        language,
        answers: data.answers as Record<string, unknown>,
      });
      activationCode =
        (provisioned as { code?: string | null } | null | undefined)?.code ?? null;
    } catch (e) {
      console.error("App client provisioning failed:", e);
    }

    // Client welcome email (trilingual). Only the client gets this — company,
    // attorney, and emergency contacts live on the back end and are notified
    // only when an SOS alert fires.
    try {
      const language = (session.metadata?.language as string) || "en";
      await enqueueActivationEmails({
        sessionId: data.sessionId,
        answers: data.answers as Record<string, unknown>,
        activationCode,
        language,
        documentUrls: typeof intakeUrls === "object" && intakeUrls
          ? {
              habeasUrl: intakeUrls.habeasUrl,
              memorandumUrl: intakeUrls.memorandumUrl,
              referralUrl: intakeUrls.referralUrl,
              js44Url: intakeUrls.js44Url,
              brochureUrl: intakeUrls.brochureUrl,
            }
          : null,
      });
    } catch (e) {
      console.error("Activation welcome email enqueue failed:", e);
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
      intakeSessionId?: string;
    }) => {
      if (!data.answers || typeof data.answers !== "object") throw new Error("Invalid answers");
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const sessionId = data.intakeSessionId || `demo-${crypto.randomUUID()}`;
    const a = data.answers as Record<string, unknown>;
    const contactEmail =
      (typeof a.client_email === "string" && a.client_email) ||
      (typeof a.contact_email === "string" && a.contact_email) || null;

    const { error } = await supabaseAdmin.from("intake_submissions").insert({
      stripe_session_id: sessionId,
      language: data.language,
      email: contactEmail,
      paid: true,
      answers: a as never,
    } as never);
    if (error) throw new Error(error.message);

    let demoIntakeUrls: Awaited<ReturnType<typeof enqueueIntakeNotification>> = null;
    try {
      demoIntakeUrls = await enqueueIntakeNotification({
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

    let activationCode: string | null = null;
    try {
      const provisioned = await provisionAppClient({
        intakeSessionId: sessionId,
        language: data.language,
        answers: a,
      });
      activationCode =
        (provisioned as { code?: string | null } | null | undefined)?.code ??
        data.inviteCode ??
        null;
    } catch (e) {
      console.error("Demo app client provisioning failed:", e);
    }

    try {
      await enqueueActivationEmails({
        sessionId,
        answers: a,
        activationCode: activationCode ?? data.inviteCode ?? null,
        language: data.language,
        documentUrls: demoIntakeUrls
          ? {
              habeasUrl: demoIntakeUrls.habeasUrl,
              memorandumUrl: demoIntakeUrls.memorandumUrl,
              referralUrl: demoIntakeUrls.referralUrl,
              js44Url: demoIntakeUrls.js44Url,
              brochureUrl: demoIntakeUrls.brochureUrl,
            }
          : null,
      });
    } catch (e) {
      console.error("Activation emails enqueue failed:", e);
    }


    return { ok: true, sessionId, activationCode };
  });
