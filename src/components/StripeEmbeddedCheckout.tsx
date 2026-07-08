import { useEffect, useState } from "react";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/utils/payments.functions";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  language: string;
  customerEmail?: string;
  returnUrl: string;
  includeReadiness?: boolean;
  includePetRescue?: boolean;
  discountPct?: number;
  submissionId?: string;
}

export function StripeEmbeddedCheckoutBox({ language, customerEmail, returnUrl, includeReadiness, includePetRescue, discountPct, submissionId }: Props) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ userId?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      setStripePromise(getStripe());
    } catch (e) {
      setError((e as Error).message);
    }
    supabase.auth.getUser().then(({ data }) => {
      setUserInfo({ userId: data.user?.id, email: data.user?.email || customerEmail });
    });
  }, [customerEmail]);

  const fetchClientSecret = async (): Promise<string> => {
    const secret = await createCheckoutSession({
      data: {
        language,
        customerEmail: userInfo?.email || customerEmail,
        userId: userInfo?.userId,
        returnUrl,
        environment: getStripeEnvironment(),
        includeReadiness: !!includeReadiness,
        includePetRescue: !!includePetRescue,
        discountPct: discountPct || 0,
        submissionId: submissionId || undefined,
      },
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
  if (!stripePromise || userInfo === null) return <div style={{ padding: 16, color: "#666" }}>Loading payment form…</div>;

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
