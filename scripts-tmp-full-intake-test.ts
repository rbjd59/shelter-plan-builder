// Standalone end-to-end test runner. Run with bun (respects tsconfig paths).
// Enqueues a real intake notification + family welcome and drains the queue manually.

import { sendLovableEmail } from "@lovable.dev/email-js";
import { createClient } from "@supabase/supabase-js";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";

const FAMILY_EMAIL = process.argv[2] || "rbjd@dr.com";
const sessionId = `test-full-${Date.now()}`;

const answers = {
  full_name: "Juan Test Pérez",
  other_names_used: "Juan Perez",
  a_number: "A123-456-789",
  dob: "1985-04-12",
  country_of_citizenship: "Honduras",
  court_district: "Florida Southern",
  ice_form_known: false,
  prior_immigration_proceedings:
    "Petitioner entered the United States in 2015. No prior removal proceedings.",
  ground_one:
    "Detention is unconstitutionally prolonged under Zadvydas v. Davis. No significant likelihood of removal in the reasonably foreseeable future.",
  ground_two: "Bond hearing has been denied without individualized review.",
  relief_requested:
    "Release petitioner from custody, or in the alternative, order an individualized bond hearing before an immigration judge.",
  ifp_employer: "Unemployed (detained)",
  ifp_monthly_pay: "0",
  ifp_other_income: "None",
  ifp_cash_on_hand: "120",
  ifp_property: "None",
  ifp_dependents: "Two minor children supported by spouse",
  ifp_monthly_expenses: "0",
  ifp_debts: "None",
  emergency_contact_name: "Maria Test",
  emergency_contact_email: FAMILY_EMAIL,
  mail_inmate_name: "Juan Test Pérez",
  mail_current_location: "Krome Detention Center",
  mail_inmate_number: "A123-456-789",
  mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",
  contact_name: "Maria Test",
  contact_relation: "spouse",
  contact_phone: "+1 305-555-0199",
  contact_email: FAMILY_EMAIL,
  contact_address: "1234 NW 1st St\nMiami, FL 33125",
};

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

console.log(`[1/4] Inserting intake_submissions row (session=${sessionId}) …`);
await sb.from("intake_submissions").insert({
  stripe_session_id: sessionId,
  email: FAMILY_EMAIL,
  language: "es",
  answers: answers as never,
  paid: true,
} as never);

console.log(`[2/4] Enqueuing intake notification + family welcome …`);
await enqueueIntakeNotification({
  sessionId,
  answers,
  language: "es",
  contactEmail: FAMILY_EMAIL,
});

console.log(`[3/4] Draining queue manually (sendLovableEmail) …`);
const apiKey = process.env.LOVABLE_API_KEY!;
let drained = 0;
for (let i = 0; i < 10; i++) {
  const { data, error } = await sb.rpc("read_email_batch" as never, {
    queue_name: "transactional_emails",
    batch_size: 10,
    vt: 60,
  } as never);
  if (error) {
    console.error("read_email_batch error", error);
    break;
  }
  const rows = (data as Array<{ msg_id: number; message: any }>) || [];
  if (rows.length === 0) break;
  for (const r of rows) {
    const m = r.message;
    try {
      const result = await sendLovableEmail(
        {
          to: m.to,
          from: m.from,
          sender_domain: m.sender_domain,
          subject: m.subject,
          html: m.html,
          text: m.text,
          purpose: m.purpose,
          label: m.label,
          message_id: m.message_id,
          unsubscribe_token: m.unsubscribe_token,
        } as any,
        { apiKey } as any,
      );
      console.log(`  ✓ sent to ${m.to} (label=${m.label}) →`, JSON.stringify(result).slice(0, 200));
      await sb.from("email_send_log" as never).insert({
        message_id: m.message_id,
        template_name: m.label,
        recipient_email: m.to,
        status: "sent",
      } as never);
      await sb.rpc("delete_email" as never, {
        queue_name: "transactional_emails",
        message_id: r.msg_id,
      } as never);
      drained++;
    } catch (e) {
      console.error(`  ✗ failed to send to ${m.to}:`, e);
      await sb.from("email_send_log" as never).insert({
        message_id: m.message_id,
        template_name: m.label,
        recipient_email: m.to,
        status: "failed",
        error_message: String(e),
      } as never);
      await sb.rpc("delete_email" as never, {
        queue_name: "transactional_emails",
        message_id: r.msg_id,
      } as never);
    }
  }
}

console.log(`[4/4] Done. Drained ${drained} message(s). Session: ${sessionId}`);
