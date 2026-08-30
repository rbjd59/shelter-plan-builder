/**
 * Locate desk → attorney forms.
 *
 * Once the company locates the client and records the facility, mailing
 * address, warden, arrest date, A-number and booking ID, every legal form in
 * the client's folder is rebuilt with those real values so no placeholders are
 * left. The attorney board then shows "Forms completed — ready for review and
 * mailing".
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const toB64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");

export interface RegenerateResult {
  ok: boolean;
  regenerated: string[];
  failed: string[];
  ready: boolean;
}

/** Merges everything known about the client into one answers object. */
export async function buildAnswersForClient(clientId: string): Promise<Record<string, unknown>> {
  const [{ data: client }, { data: det }] = await Promise.all([
    supabaseAdmin
      .from("app_clients")
      .select(
        "id, invite_token, intake_session_id, full_name, email, phone_e164, language, a_number, date_of_birth, place_of_birth, country_of_origin",
      )
      .eq("id", clientId)
      .maybeSingle(),
    supabaseAdmin
      .from("client_detention_info")
      .select(
        "facility_name, facility_address, warden_name, arrest_date, a_number, federal_id, notes, located_at",
      )
      .eq("client_id", clientId)
      .maybeSingle(),
  ]);

  const c = (client ?? {}) as Record<string, string | null>;
  const d = (det ?? {}) as Record<string, string | null>;

  let answers: Record<string, unknown> = {};
  const sid = c["intake_session_id"];
  if (sid) {
    const { data: sub } = await supabaseAdmin
      .from("intake_submissions")
      .select("answers")
      .eq("stripe_session_id", sid)
      .maybeSingle();
    const a = (sub as { answers?: Record<string, unknown> } | null)?.answers;
    if (a && typeof a === "object") answers = { ...a };
  }

  const set = (key: string, value: string | null | undefined) => {
    const v = (value ?? "").trim();
    if (v) answers[key] = v;
  };

  // Client identity always wins over stale intake text.
  set("full_name", c["full_name"]);
  set("client_full_name", c["full_name"]);
  set("mail_inmate_name", c["full_name"]);
  set("client_email", c["email"]);
  set("date_of_birth", c["date_of_birth"]);
  set("place_of_birth", c["place_of_birth"]);
  set("country_of_origin", c["country_of_origin"]);
  set("language", c["language"]);

  // Locate desk data — the fields the forms were missing.
  const aNumber = d["a_number"] || c["a_number"];
  set("a_number", aNumber);
  set("mail_inmate_number", aNumber);
  set("facility_name", d["facility_name"]);
  set("mail_current_location", d["facility_name"]);
  set("facility_address", d["facility_address"]);
  set("mail_facility_address", d["facility_address"]);
  set("warden_name", d["warden_name"]);
  set("respondent_name", d["warden_name"]);
  set("arrest_date", d["arrest_date"]);
  set("date_of_custody", d["arrest_date"]);
  set("detention_start_date", d["arrest_date"]);
  set("federal_id", d["federal_id"]);
  set("locate_notes", d["notes"]);

  return answers;
}

/** True once the desk has recorded enough to remove every placeholder. */
export async function locateIsComplete(clientId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("client_detention_info")
    .select("facility_name, facility_address, warden_name, arrest_date")
    .eq("client_id", clientId)
    .maybeSingle();
  const d = (data ?? {}) as Record<string, string | null>;
  return Boolean(
    (d["facility_name"] ?? "").trim() &&
      (d["facility_address"] ?? "").trim() &&
      (d["warden_name"] ?? "").trim(),
  );
}

const CORE_FORMS = [
  { type: "ao_242", title: "AO 242 — Petition for Writ of Habeas Corpus" },
  { type: "ao_240", title: "AO 240 — Application to Proceed In Forma Pauperis" },
  { type: "civil_cover_sheet", title: "JS-44 — Civil Cover Sheet" },
  { type: "motion_for_counsel", title: "SDFL Motion for Referral to Volunteer Attorney" },
  { type: "memorandum_of_law", title: "Memorandum of Law" },
  { type: "mailing_label", title: "Mailing Label — Detention Facility" },
] as const;

/**
 * Rebuilds every legal form for the client using the located facility data and
 * writes them back into client_documents.
 */
export async function regenerateClientForms(clientId: string): Promise<RegenerateResult> {
  const answers = await buildAnswersForClient(clientId);
  const ready = await locateIsComplete(clientId);

  const [{ buildIntakePdfs }, { buildMotionReferralPdf }, { buildJs44Pdf }, { buildMemorandumOfLawPdf }, { buildMailingLabelPdf }] =
    await Promise.all([
      import("@/lib/email/intake-pdfs.server"),
      import("@/lib/email/motion-referral.server"),
      import("@/lib/email/js44.server"),
      import("@/lib/email/memorandum-of-law.server"),
      import("@/lib/mailing-label-pdf.server"),
    ]);

  const built = new Map<string, string>();
  const failed: string[] = [];

  const attempt = async (type: string, fn: () => Promise<Uint8Array>) => {
    try {
      built.set(type, toB64(await fn()));
    } catch (e) {
      console.error(`[forms-regenerate] ${type} failed`, e);
      failed.push(type);
    }
  };

  try {
    const intake = await buildIntakePdfs(answers);
    built.set("ao_242", toB64(intake.habeas));
    built.set("ao_240", toB64(intake.ifp));
  } catch (e) {
    console.error("[forms-regenerate] ao_242/ao_240 failed", e);
    failed.push("ao_242", "ao_240");
  }
  await attempt("motion_for_counsel", () => buildMotionReferralPdf(answers));
  await attempt("civil_cover_sheet", () => buildJs44Pdf(answers));
  await attempt("memorandum_of_law", () => buildMemorandumOfLawPdf(answers));
  await attempt("mailing_label", () =>
    buildMailingLabelPdf({
      inmateName: String(answers["mail_inmate_name"] ?? answers["full_name"] ?? ""),
      aNumber: answers["a_number"] ? String(answers["a_number"]) : null,
      facilityName: String(answers["facility_name"] ?? ""),
      facilityAddress: String(answers["facility_address"] ?? ""),
      caseId: String(answers["activation_code"] ?? ""),
    }),
  );

  const { data: existing } = await supabaseAdmin
    .from("client_documents")
    .select("id, document_type")
    .eq("client_id", clientId)
    .eq("from_app", false);
  const byType = new Map<string, string>();
  for (const row of (existing ?? []) as Array<{ id: string; document_type: string }>) {
    if (!byType.has(row.document_type)) byType.set(row.document_type, row.id);
  }

  const regenerated: string[] = [];
  for (const form of CORE_FORMS) {
    const content = built.get(form.type);
    if (!content) continue;
    const patch = {
      title: form.title,
      content,
      review_status: ready ? "ready_for_review" : "draft_pending_review",
      loaded_at: new Date().toISOString(),
    };
    const id = byType.get(form.type);
    if (id) {
      const { error } = await supabaseAdmin
        .from("client_documents")
        .update(patch as never)
        .eq("id", id);
      if (error) failed.push(form.type);
      else regenerated.push(form.type);
    } else {
      const { error } = await supabaseAdmin.from("client_documents").insert({
        client_id: clientId,
        document_type: form.type,
        send_on_alert: true,
        from_app: false,
        ...patch,
      } as never);
      if (error) failed.push(form.type);
      else regenerated.push(form.type);
    }
  }

  return { ok: failed.length === 0, regenerated, failed, ready };
}
