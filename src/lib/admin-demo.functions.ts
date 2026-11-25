import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin-only: fire a fake "Test NN ES" client end-to-end.
 * Inserts an intake submission, generates all legal PDFs (Habeas,
 * Memorandum, Motion Referral, JS-44, Brochure), provisions an app
 * client + activation code, and enqueues activation emails.
 *
 * Runs the same code path as submitDemoIntake so the resulting case
 * appears on both the company and attorney boards with all forms
 * attached for review.
 */
export const fireTestDemoClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { label?: string; language?: "es" | "en" | "ht" }) => ({
      label: data.label ?? "Test 06 HT",
      language: data.language ?? "ht",
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // authorize: admin only
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    const { enqueueIntakeNotification } = await import(
      "@/lib/email/intake-notification.server"
    );
    const { enqueueActivationEmails } = await import(
      "@/lib/email/activation-emails.server"
    );
    const { provisionAppClient } = await import("@/lib/app-clients.server");

    const label = data.label;
    const language = data.language;

    // Preset answers. Fake but complete enough to render every form.
    const answers: Record<string, unknown> = {
      full_name: `Client ${label}`,
      client_email: "rbjd@dr.com",
      client_mobile: "+13053377713",
      language,
      a_number: "A123456789",
      dob: "1985-04-12",
      place_of_birth: "San Salvador, El Salvador",
      country_of_citizenship: "El Salvador",
      detained_location: "Krome Detention Center, Miami, FL",
      detention_facility: "Krome Detention Center",
      date_of_detention: new Date().toISOString().slice(0, 10),
      grounds_not_convicted: true,
      grounds_not_danger: true,
      grounds_not_flight_risk: true,
      grounds_due_process: true,
      relief_release: true,
      relief_bond_hearing: true,
      relief_declare_unlawful: true,
      relief_any_other_relief: true,
      mail_to_name: `Familia ${label}`,
      mail_to_address: "1234 SW 8th St",
      mail_to_city: "Miami",
      mail_to_state: "FL",
      mail_to_zip: "33130",
      emergency_contact_name: "Bernie Vasquez",
      emergency_contact_email: "bernievazquez@gmail.com",
      emergency_contact_phone: "+13054011048",
      emergency_contact_relation: "Family contact",
      contact_name: "Bernie Vasquez",
      contact_email: "bernievazquez@gmail.com",
      contact_phone: "+13054011048",
      emergency_contact_2_name: "Rick Behar",
      emergency_contact_2_email: "rbjd@dr.com",
      emergency_contact_2_phone: "+16452355445",
      emergency_contact_2_relation: "Family contact",
      addon_asset_protection: true,
      atty_immigration_history:
        "Entró a EE.UU. en 2015. Solicitó asilo en 2016. Caso pendiente en Corte de Inmigración de Miami.",
      atty_criminal_history: "Sin antecedentes penales.",
      atty_family_ties: "Esposa (residente legal) y dos hijos ciudadanos en Miami, FL.",
      atty_fear_return:
        "Sí. Persecución por pandillas (MS-13) en su ciudad natal por negarse a colaborar.",
      demo_label: label,
    };

    const sessionId = `demo-${crypto.randomUUID()}`;

    const { error } = await supabaseAdmin.from("intake_submissions").insert({
      stripe_session_id: sessionId,
      language,
      email: answers.client_email as string,
      paid: true,
      answers: answers as never,
    } as never);
    if (error) throw new Error(error.message);

    let intakeUrls: Awaited<ReturnType<typeof enqueueIntakeNotification>> = null;
    try {
      intakeUrls = await enqueueIntakeNotification({
        sessionId,
        answers,
        language,
        contactEmail: answers.client_email as string,
        demoMode: true,
        inviteCode: null,
      });
    } catch (e) {
      console.error("[fireTestDemoClient] intake notification failed", e);
    }

    let activationCode: string | null = null;
    try {
      const provisioned = await provisionAppClient({
        intakeSessionId: sessionId,
        language,
        answers,
      });
      activationCode =
        (provisioned as { code?: string | null } | null | undefined)?.code ?? null;
    } catch (e) {
      console.error("[fireTestDemoClient] provisionAppClient failed", e);
    }

    try {
      await enqueueActivationEmails({
        sessionId,
        answers,
        activationCode,
        language,
        documentUrls: intakeUrls
          ? {
              habeasUrl: intakeUrls.habeasUrl,
              ifpUrl: intakeUrls.ifpUrl,
              memorandumUrl: intakeUrls.memorandumUrl,
              referralUrl: intakeUrls.referralUrl,
              js44Url: intakeUrls.js44Url,
              brochureUrl: intakeUrls.brochureUrl,
              assetProtectionUrls: intakeUrls.assetProtectionUrls,
            }
          : null,
      });
    } catch (e) {
      console.error("[fireTestDemoClient] activation emails failed", e);
    }

    return {
      ok: true,
      sessionId,
      activationCode,
      label,
      language,
    };
  });
