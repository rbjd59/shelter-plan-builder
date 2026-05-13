import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";

/**
 * Create a Stripe Embedded Checkout session that bills:
 *   - $199 one-time (priceId: pretransfer_199)  → added as a one-time invoice item
 *   - $10/month subscription (priceId: pretransfer_10mo) → as the recurring line
 * Returns the session client_secret.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      language: string;
      returnUrl: string;
      environment: StripeEnv;
      customerEmail?: string;
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

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      line_items: [{ price: monthly.data[0].id, quantity: 1 }],
      subscription_data: {
        metadata: {
          language: data.language,
        },
        // Months 1-2 free, $30/mo starts month 3, ongoing until cancel.
        trial_period_days: 60,
        // Bill the $199 one-time fee immediately on the first (trial-start) invoice.
        add_invoice_items: [{ price: oneTime.data[0].id, quantity: 1 }],
      } as any,
      ...(data.customerEmail && { customer_email: data.customerEmail }),
      metadata: { language: data.language },
    });

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

    // For subscription mode, `payment_status` may be `no_payment_required` until
    // the first invoice is paid. Treat `paid` OR an active subscription as success.
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      !!session.subscription;

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
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      !!session.subscription;
    if (!paid) throw new Error("Payment not completed");

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
