/**
 * Mobile-app client provisioning — server-only.
 *
 * Called after a paid customer completes intake. Generates an 8-char
 * activation code, mirrors the intake answers into app_clients /
 * client_contacts, queues the activation email, and fires the SMS.
 */
import { render } from "@react-email/components";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { activationSmsBody, sendSms } from "@/lib/sms.server";

const SITE_NAME = "DetencionDefensa";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const FROM_DOMAIN = "notify.gohomesooner.com";

// Avoid 0/O/1/I to prevent transcription errors
const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => TOKEN_ALPHABET[b % TOKEN_ALPHABET.length])
    .join("");
}

function generateHex(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface ProvisionParams {
  intakeSessionId: string;
  language: string;
  answers: Record<string, unknown>;
}

export async function provisionAppClient(params: ProvisionParams): Promise<{
  ok: boolean;
  clientId?: string;
  code?: string;
  error?: string;
}> {
  const sb = admin();
  const a = params.answers;

  // Pull contact info from intake answers (best-effort)
  const fullName =
    (typeof a.client_full_name === "string" && a.client_full_name) ||
    (typeof a.full_name === "string" && a.full_name) ||
    (typeof a.contact_name === "string" && a.contact_name) ||
    null;
  const email =
    (typeof a.client_email === "string" && a.client_email) ||
    (typeof a.contact_email === "string" && a.contact_email) ||
    (typeof a.email === "string" && a.email) ||
    null;
  const phone =
    (typeof a.client_mobile === "string" && a.client_mobile) ||
    (typeof a.contact_phone === "string" && a.contact_phone) ||
    (typeof a.phone === "string" && a.phone) ||
    null;

  // New fields from Premio intake spec
  const placeOfBirth = typeof a.place_of_birth === "string" ? a.place_of_birth : null;
  const countryOfOrigin =
    (typeof a.country_of_origin === "string" && a.country_of_origin) ||
    (typeof a.country_of_citizenship === "string" && a.country_of_citizenship) ||
    null;
  const hasAssetProtection = !!a.addon_asset_protection;
  const hasPetRescue = !!a.addon_pet_rescue;

  // Generate token with retry on collision
  let code = generateToken();
  let inserted: { id: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await sb
      .from("app_clients")
      .insert({
        intake_session_id: params.intakeSessionId,
        invite_token: code,
        full_name: fullName,
        email,
        phone_e164: phone,
        language: params.language,
        date_of_birth: typeof a.dob === "string" ? a.dob : null,
        a_number: typeof a.a_number === "string" ? a.a_number : null,
        place_of_birth: placeOfBirth,
        country_of_origin: countryOfOrigin,
        has_asset_protection: hasAssetProtection,
        has_pet_rescue: hasPetRescue,
      } as never)
      .select("id")
      .single();

    if (!error && data) {
      inserted = data as { id: string };
      break;
    }
    // Unique violation on invite_token → re-roll; on intake_session_id → already provisioned
    if (error?.code === "23505" && error.message.includes("invite_token")) {
      code = generateToken();
      continue;
    }
    if (error?.code === "23505" && error.message.includes("intake_session_id")) {
      // Already provisioned — fetch existing
      const { data: existing } = await sb
        .from("app_clients")
        .select("id, invite_token")
        .eq("intake_session_id", params.intakeSessionId)
        .maybeSingle();
      if (existing) {
        return {
          ok: true,
          clientId: (existing as any).id,
          code: (existing as any).invite_token,
        };
      }
    }
    return { ok: false, error: error?.message ?? "insert failed" };
  }

  if (!inserted) return { ok: false, error: "could not allocate activation code" };
  const clientId = inserted.id;

  // Mirror emergency contacts from intake answers (sections 6 + 7 + 8)
  const contactsToInsert: Array<Record<string, any>> = [];
  const addContact = (
    name: unknown,
    phone: unknown,
    email: unknown,
    relationship: string,
    priority: number,
  ) => {
    if (typeof name === "string" && name.trim()) {
      contactsToInsert.push({
        client_id: clientId,
        name: name.trim(),
        phone_e164: typeof phone === "string" ? phone : null,
        email: typeof email === "string" ? email : null,
        relationship,
        priority,
        notify_on_sos: true,
      });
    }
  };
  addContact(a.emergency_contact_name, a.emergency_contact_phone, a.emergency_contact_email, "emergency", 1);
  addContact(
    a.emergency_contact_2_name,
    a.emergency_contact_2_phone,
    a.emergency_contact_2_email,
    typeof a.emergency_contact_2_relation === "string" ? a.emergency_contact_2_relation : "emergency-2",
    2,
  );
  addContact(a.contact_name, a.contact_phone, a.contact_email, "family", 3);

  if (contactsToInsert.length) {
    await sb.from("client_contacts").insert(contactsToInsert);
  }

  // Persist pet rescue row if the add-on was selected
  if (hasPetRescue) {
    await sb.from("client_pet_rescue").upsert(
      {
        client_id: clientId,
        pet_name: typeof a.pet_name === "string" ? a.pet_name : null,
        pet_type: typeof a.pet_type === "string" ? a.pet_type : null,
        pet_location: typeof a.pet_location === "string" ? a.pet_location : null,
        access_instructions: typeof a.pet_access === "string" ? a.pet_access : null,
        who_to_notify: typeof a.pet_notify === "string" ? a.pet_notify : null,
        no_kill_shelter_preferred: a.pet_no_kill_preferred !== false,
        no_kill_shelter_address: typeof a.pet_no_kill_address === "string" ? a.pet_no_kill_address : null,
      } as never,
      { onConflict: "client_id" },
    );
  }

  // Generate the actual PDFs before the bundle is exposed to the phone.
  // The phone expects raw base64 in `content`; placeholder prose causes its
  // PDF viewer to open a blank white screen.
  const toB64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
  const generated = new Map<string, string>();
  try {
    const [{ buildIntakePdfs }, { buildMotionReferralPdf }, { buildJs44Pdf }, { buildMemorandumOfLawPdf }] = await Promise.all([
      import("@/lib/email/intake-pdfs.server"),
      import("@/lib/email/motion-referral.server"),
      import("@/lib/email/js44.server"),
      import("@/lib/email/memorandum-of-law.server"),
    ]);
    const intake = await buildIntakePdfs(a);
    generated.set("ao_242", toB64(intake.habeas));
    generated.set("ao_240", toB64(intake.ifp));
    generated.set("motion_for_counsel", toB64(await buildMotionReferralPdf(a)));
    generated.set("civil_cover_sheet", toB64(await buildJs44Pdf(a)));
    generated.set("memorandum_of_law", toB64(await buildMemorandumOfLawPdf(a)));
  } catch (e) {
    console.error("core app PDF generation failed", e);
  }

  if (hasAssetProtection) {
    try {
      const { generateAllDocs } = await import("@/lib/readiness-pdf");
      const recipient = {
        name: typeof a.contact_name === "string" ? a.contact_name : undefined,
        phone: typeof a.contact_phone === "string" ? a.contact_phone : undefined,
        email: typeof a.contact_email === "string" ? a.contact_email : undefined,
        relationship: typeof a.contact_relation === "string" ? a.contact_relation : undefined,
      };
      const docs = await generateAllDocs(a, params.language === "es" || params.language === "ht" ? params.language : "en", recipient);
      const byFile: Record<string, string> = {
        "1-power-of-attorney.pdf": "power_of_attorney",
        "3-school-pickup.pdf": "school_authorization",
        "9-landlord-authorization.pdf": "property_access_permission",
        "10-vehicle-retrieval.pdf": "vehicle_impound_auth",
        "5-financial-inventory.pdf": "bank_account_access",
      };
      for (const doc of docs) {
        const type = byFile[doc.filename];
        if (type) generated.set(type, toB64(doc.bytes));
      }
    } catch (e) {
      console.error("asset-protection PDF generation failed", e);
    }
  }

  // document_type strings MUST match Premio's router.
  const coreLegalDocs: Array<{ type: string; title: string }> = [
    { type: "ao_242", title: "AO 242 — Petition for Writ of Habeas Corpus" },
    { type: "ao_240", title: "AO 240 — Application to Proceed In Forma Pauperis" },
    { type: "civil_cover_sheet", title: "JS-44 — Civil Cover Sheet" },
    { type: "motion_for_counsel", title: "SDFL Motion for Referral to Volunteer Attorney" },
    { type: "memorandum_of_law", title: "Memorandum of Law" },
  ];
  const assetProtectionDocs: Array<{ type: string; title: string }> = [
    { type: "power_of_attorney", title: "Power of Attorney" },
    { type: "school_authorization", title: "School Pickup Authorization" },
    { type: "vehicle_impound_auth", title: "Vehicle Impound Release Authorization" },
    { type: "bank_account_access", title: "Bank Account Access Authorization" },
    { type: "property_access_permission", title: "Property Access Permission" },
  ];

  const docSet = [
    ...coreLegalDocs,
    ...(hasAssetProtection ? assetProtectionDocs : []),
  ];

  const seedDocs = docSet.map((d) => ({
    client_id: clientId,
    title: d.title,
    content: generated.get(d.type) ?? "",
    document_type: d.type,
    send_on_alert: true,
    from_app: false,
  }));

  await sb.from("client_documents").insert(seedDocs as never);


  // Send activation email
  try {
    await sendActivationEmail({
      to: email,
      code,
      language: params.language,
      fullName: fullName ?? "",
    });
  } catch (e) {
    console.error("activation email failed", e);
  }

  // Send activation SMS
  if (phone) {
    try {
      await sendSms({
        to: phone,
        body: activationSmsBody(code, params.language),
        purpose: "activation",
        metadata: { client_id: clientId },
      });
    } catch (e) {
      console.error("activation SMS failed", e);
    }
  }

  return { ok: true, clientId, code };
}

async function sendActivationEmail(params: {
  to: string | null;
  code: string;
  language: string;
  fullName: string;
}) {
  if (!params.to) return;
  const sb = admin();

  const template = TEMPLATES["app-activation"];
  if (!template) throw new Error("app-activation template not registered");

  const apkUrl = "https://detenciondefensa.com/get-app";
  const testflightUrl = "https://detenciondefensa.com/get-app";

  const templateData = {
    code: params.code,
    language: params.language,
    fullName: params.fullName,
    apkUrl,
    testflightUrl,
  };

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const messageId = crypto.randomUUID();
  const idempotencyKey = `app-activation-${params.code}`;
  const normalizedEmail = params.to.toLowerCase();

  // Unsubscribe token
  const { data: existing } = await sb
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  let unsubscribeToken: string;
  if (existing && !(existing as any).used_at) {
    unsubscribeToken = (existing as any).token;
  } else {
    unsubscribeToken = generateHex(32);
    await sb
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
  }

  await sb.from("email_send_log").insert({
    message_id: messageId,
    template_name: "app-activation",
    recipient_email: params.to,
    status: "pending",
  });

  await sb.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: params.to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "app-activation",
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
}

export async function resendActivation(clientId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const sb = admin();
  const { data, error } = await sb
    .from("app_clients")
    .select("invite_token, email, phone_e164, language, full_name")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !data) return { ok: false, error: error?.message ?? "not found" };
  const c = data as any;

  try {
    await sendActivationEmail({
      to: c.email,
      code: c.invite_token,
      language: c.language,
      fullName: c.full_name ?? "",
    });
  } catch (e) {
    console.error(e);
  }
  if (c.phone_e164) {
    try {
      await sendSms({
        to: c.phone_e164,
        body: activationSmsBody(c.invite_token, c.language),
        purpose: "activation-resend",
        metadata: { client_id: clientId },
      });
    } catch (e) {
      console.error(e);
    }
  }
  return { ok: true };
}
