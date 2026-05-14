// Temporary: full end-to-end intake test (intake email + family welcome).
import { createServerFn } from "@tanstack/react-start";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const runFullIntakeTest = createServerFn({ method: "POST" })
  .inputValidator((input: { email?: string }) => input ?? {})
  .handler(async ({ data }) => {
    const sessionId = `test-full-${Date.now()}`;
    const familyEmail = data.email || "rbjd@dr.com";
    // Keys MUST match src/routes/intake.tsx exactly so PDFs render filled in
    // and the answers table in the intake email is meaningful.
    const answers = {
      // 1. Petitioner (AO 242)
      full_name: "Juan Test Pérez",
      other_names_used: "Juan Perez",
      a_number: "A123-456-789",
      dob: "1985-04-12",
      country_of_citizenship: "Honduras",
      court_district: "Florida Southern",
      // facility_* + warden_* are intentionally blank (filled by inmate after transfer)
      // 3. Detainer
      ice_form_known: false,
      prior_immigration_proceedings:
        "Petitioner entered the United States in 2015. No prior removal proceedings.",
      // 4. Grounds (free text built from checkbox labels)
      ground_one:
        "Detention is unconstitutionally prolonged under Zadvydas v. Davis. No significant likelihood of removal in the reasonably foreseeable future.",
      ground_two: "Bond hearing has been denied without individualized review.",
      relief_requested:
        "Release petitioner from custody, or in the alternative, order an individualized bond hearing before an immigration judge.",
      // 5. IFP (AO 240)
      ifp_employer: "Unemployed (detained)",
      ifp_monthly_pay: "0",
      ifp_other_income: "None",
      ifp_cash_on_hand: "120",
      ifp_property: "None",
      ifp_dependents: "Two minor children supported by spouse",
      ifp_monthly_expenses: "0",
      ifp_debts: "None",
      // 6. Emergency contact + mailing
      emergency_contact_name: "Maria Test",
      emergency_contact_email: familyEmail,
      mail_inmate_name: "Juan Test Pérez",
      mail_current_location: "Krome Detention Center",
      mail_inmate_number: "A123-456-789",
      mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",
      // 7. Family contact (you)
      contact_name: "Maria Test",
      contact_relation: "spouse",
      contact_phone: "+1 305-555-0199",
      contact_email: familyEmail,
      contact_address: "1234 NW 1st St\nMiami, FL 33125",
    };

    await supabaseAdmin
      .from("intake_submissions")
      .insert({
        stripe_session_id: sessionId,
        email: familyEmail,
        language: "es",
        answers: answers as never,
        paid: true,
      } as never);

    await enqueueIntakeNotification({
      sessionId,
      answers,
      language: "es",
      contactEmail: familyEmail,
    });

    // Wait briefly for the cron dispatcher to drain the queue (runs every 5s).
    await new Promise((r) => setTimeout(r, 12_000));

    const { data: logs } = await supabaseAdmin
      .from("email_send_log")
      .select("template_name, recipient_email, status, message_id, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    return { ok: true, sessionId, familyEmail, recentLogs: logs };
  });
