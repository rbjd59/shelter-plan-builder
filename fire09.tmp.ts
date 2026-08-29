import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";
import { enqueueActivationEmails } from "@/lib/email/activation-emails.server";
import { provisionAppClient } from "@/lib/app-clients.server";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const label = "Test 09 EN";
const language = "en" as const;
const answers: Record<string, unknown> = {
  full_name: `Client ${label}`, client_full_name: `Client ${label}`,
  client_email: "rbjd@dr.com", client_mobile: "+13053377713", language,
  a_number: "A123456789", dob: "1985-04-12",
  place_of_birth: "San Salvador, El Salvador", country_of_citizenship: "El Salvador",
  detained_location: "Krome Detention Center, Miami, FL",
  detention_facility: "Krome Detention Center",
  date_of_detention: new Date().toISOString().slice(0,10),
  grounds_not_convicted: true, grounds_not_danger: true, grounds_not_flight_risk: true,
  grounds_due_process: true, relief_release: true, relief_bond_hearing: true,
  relief_declare_unlawful: true, relief_any_other_relief: true,
  mail_to_name: `Familia ${label}`, mail_to_address: "1234 SW 8th St",
  mail_to_city: "Miami", mail_to_state: "FL", mail_to_zip: "33130",
  emergency_contact_name: "Bernie Vasquez", emergency_contact_email: "bernievazquez@gmail.com",
  emergency_contact_phone: "+13054011048", emergency_contact_relation: "Family contact",
  contact_name: "Bernie Vasquez", contact_email: "bernievazquez@gmail.com", contact_phone: "+13054011048",
  emergency_contact_2_name: "Rick Behar", emergency_contact_2_email: "rbjd@dr.com",
  emergency_contact_2_phone: "+16452355445", emergency_contact_2_relation: "Family contact",
  atty_criminal_history: "No criminal record.",
  atty_family_ties: "Wife (LPR) and two US-citizen children in Miami, FL.",
  demo_label: label,
};
const sessionId = `demo-${crypto.randomUUID()}`;
const { error } = await sb.from("intake_submissions").insert({
  stripe_session_id: sessionId, language, email: answers.client_email as string, paid: true, answers: answers as never,
} as never);
if (error) throw new Error(error.message);
let intakeUrls: any = null;
try { intakeUrls = await enqueueIntakeNotification({ sessionId, answers, language, contactEmail: answers.client_email as string, demoMode: true, inviteCode: null }); }
catch (e) { console.error("intake notif failed", e); }
const prov = await provisionAppClient({ intakeSessionId: sessionId, language, answers });
console.log("provision:", prov);
try {
  await enqueueActivationEmails({ sessionId, answers, activationCode: prov.code ?? null, language,
    documentUrls: intakeUrls ? { habeasUrl: intakeUrls.habeasUrl, ifpUrl: intakeUrls.ifpUrl, memorandumUrl: intakeUrls.memorandumUrl, referralUrl: intakeUrls.referralUrl, js44Url: intakeUrls.js44Url, brochureUrl: intakeUrls.brochureUrl, assetProtectionUrls: intakeUrls.assetProtectionUrls } : null });
} catch (e) { console.error("activation emails failed", e); }
console.log("SESSION", sessionId, "CODE", prov.code);
