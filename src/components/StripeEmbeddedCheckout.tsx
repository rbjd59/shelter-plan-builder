import { useEffect, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/utils/payments.functions";

interface Props {
  language: string;
  customerEmail?: string;
  returnUrl: string;
}

export function StripeEmbeddedCheckoutBox({ language, customerEmail, returnUrl }: Props) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setStripePromise(getStripe());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const fetchClientSecret = async (): Promise<string> => {
    const secret = await createCheckoutSession({
      data: { language, customerEmail, returnUrl, environment: getStripeEnvironment() },
    });
    if (!secret) throw new Error("Failed to create checkout session");
    return secret;
  };

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          background: "#fff5f5",
          border: "1px solid #c0392b",
          borderRadius: 6,
          color: "#7a1c1c",
        }}
      >
        Payments are not configured yet. Please try again in a moment.
      </div>
    );
  }
  if (!stripePromise) return <div style={{ padding: 16, color: "#666" }}>Loading payment form…</div>;

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
