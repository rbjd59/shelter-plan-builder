import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_start?: number;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data: Array<{
    current_period_start?: number;
    current_period_end?: number;
    price?: {
      id?: string;
      lookup_key?: string;
      product?: string;
      metadata?: Record<string, string>;
    };
  }> };
};

type StripeSession = {
  id: string;
  customer?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  subscription?: string | null;
  metadata?: Record<string, string> | null;
};

function tsToIso(s?: number | null): string | null {
  return s ? new Date(s * 1000).toISOString() : null;
}

async function upsertFromSubscription(sub: StripeSubscription, env: StripeEnv, extra: Record<string, unknown> = {}) {
  const item = sub.items?.data?.[0];
  const priceId =
    item?.price?.lookup_key ||
    item?.price?.metadata?.lovable_external_id ||
    item?.price?.id ||
    null;
  const productId = item?.price?.product || null;
  const periodStart = item?.current_period_start ?? sub.current_period_start;
  const periodEnd = item?.current_period_end ?? sub.current_period_end;
  const userId = sub.metadata?.userId || null;

  await supabaseAdmin.from("subscriptions").upsert(
    {
      ...(userId && { user_id: userId }),
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer,
      product_id: productId,
      price_id: priceId,
      status: sub.status,
      current_period_start: tsToIso(periodStart),
      current_period_end: tsToIso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      environment: env,
      language: sub.metadata?.language || null,
      ...extra,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleCheckoutCompleted(session: StripeSession, env: StripeEnv) {
  if (!session.subscription) return;
  // Stamp the email + session id on the subscription row when the row exists.
  const email = session.customer_details?.email || session.customer_email || null;
  await supabaseAdmin
    .from("subscriptions")
    .update({
      email,
      stripe_session_id: session.id,
      ...(session.metadata?.userId && { user_id: session.metadata.userId }),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("stripe_subscription_id", session.subscription)
    .eq("environment", env);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
              await upsertFromSubscription(event.data.object as StripeSubscription, env);
              break;
            case "customer.subscription.deleted":
              await upsertFromSubscription(
                { ...(event.data.object as StripeSubscription), status: "canceled" },
                env,
              );
              break;
            case "checkout.session.completed":
              await handleCheckoutCompleted(event.data.object as StripeSession, env);
              break;
            case "invoice.payment_failed":
              console.warn("[stripe-webhook] invoice.payment_failed", (event.data.object as { id: string }).id);
              break;
            default:
              break;
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
