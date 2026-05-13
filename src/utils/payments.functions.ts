import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";

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
 * Charges $199 today + starts a $30/month subscription whose first $30
 * invoice posts ~60 days out (months 1-2 free, $30/mo from month 3).
 *
 * Implementation: subscription mode + billing_cycle_anchor = now+60d +
 * proration_behavior 'none'. The one-time $199 line item bills today;
 * the recurring $30 starts on the anchor.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      language: string;
      returnUrl: string;
      environment: StripeEnv;
      customerEmail?: string;
      userId?: string;
    }) => {
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      if (typeof data.returnUrl !== "string" || !data.returnUrl.startsWith("http"))
        throw new Error("Invalid returnUrl");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);

    const [oneTime, monthly] = await Promise.all([
      stripe.prices.list({ lookup_keys: ["pretransfer_199"], limit: 1 }),
      stripe.prices.list({ lookup_keys: ["pretransfer_30mo"], limit: 1 }),
    ]);
    if (!oneTime.data.length || !monthly.data.length) throw new Error("Prices not found");

    const customerId =
      data.customerEmail || data.userId
        ? await resolveOrCreateCustomer(stripe, {
            email: data.customerEmail,
            userId: data.userId,
          })
        : undefined;

    const billingCycleAnchor = Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      automatic_tax: { enabled: true },
      line_items: [
        { price: monthly.data[0].id, quantity: 1 },
        { price: oneTime.data[0].id, quantity: 1 },
      ],
      subscription_data: {
        billing_cycle_anchor: billingCycleAnchor,
        metadata: {
          language: data.language,
          ...(data.userId && { userId: data.userId }),
        },
      },
      ...(customerId && { customer: customerId }),
      metadata: {
        language: data.language,
        ...(data.userId && { userId: data.userId }),
      },
    } as Stripe.Checkout.SessionCreateParams);

    return session.client_secret;
  });

export const verifyAndCreateIntake = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!data.sessionId || typeof data.sessionId !== "string")
      throw new Error("Invalid sessionId");
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

    return { ok: true };
  });
