import { createFileRoute } from "@tanstack/react-router";
import { EMPTY_TWIML, processInboundSms, staffPhone } from "@/lib/live-chat-sms";

const twiml = (status = 200) => new Response(EMPTY_TWIML, { status, headers: { "Content-Type": "text/xml" } });

export const Route = createFileRoute("/api/public/twilio/inbound-sms")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        if (!form) return twiml(400);
        const params: Record<string, string> = {};
        form.forEach((v, k) => { if (typeof v === "string") params[k] = v; });
        const url = new URL(request.url);
        url.protocol = "https:";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { inboundDb } = await import("@/lib/live-chat-sms.server");
        const out = await processInboundSms({
          url: process.env.TWILIO_INBOUND_SMS_URL || url.toString(),
          params,
          signature: request.headers.get("x-twilio-signature"),
          authToken: process.env.TWILIO_AUTH_TOKEN,
          staffPhone: staffPhone(process.env.LIVE_CHAT_STAFF_PHONE),
          db: inboundDb(supabaseAdmin),
        });
        if (out.status !== 200) console.warn("[inbound-sms] refused", out.result);
        return twiml(out.status);
      },
    },
  },
});
