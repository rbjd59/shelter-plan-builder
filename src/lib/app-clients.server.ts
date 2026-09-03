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
import { logDelivery, trackDelivery } from "@/lib/delivery-log.server";
import { normalizeEmailLanguage } from "@/lib/email-language";
import { sendManagedEmail } from "@/lib/email/managed-send.server";


const SITE_NAME = "DetencionDefensa";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const FROM_DOMAIN = "notify.gohomesooner.com";

// Short, memorable activation codes: one letter + four digits (e.g. K4827).
// Letters avoid I/O and digits avoid 0/1 to prevent transcription errors.
const TOKEN_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const TOKEN_DIGITS = "23456789";

function generateToken(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const letter = TOKEN_LETTERS[bytes[0] % TOKEN_LETTERS.length];
  const digits = Array.from(bytes.slice(1))
    .map((b) => TOKEN_DIGITS[b % TOKEN_DIGITS.length])
    .join("");
  return `${letter}${digits}`;
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
  const language = normalizeEmailLanguage(params.language || a.language);

  // Pull contact info from intake answers (best-effort)
  // Client identity ONLY — never fall back to an emergency/family contact,
  // that is how a contact's name/email ended up addressed as the client.
  const fullName =
    (typeof a.client_full_name === "string" && a.client_full_name) ||
    (typeof a.full_name === "string" && a.full_name) ||
    null;
  const email =
    (typeof a.client_email === "string" && a.client_email) ||
    (typeof a.email === "string" && a.email) ||
    null;
  const phone =
    (typeof a.client_mobile === "string" && a.client_mobile) ||
    (typeof a.phone === "string" && a.phone) ||
    null;


  // New fields from Premio intake spec
  const placeOfBirth = typeof a.place_of_birth === "string" ? a.place_of_birth : null;
  const countryOfOrigin =
    (typeof a.country_of_origin === "string" && a.country_of_origin) ||
    (typeof a.country_of_citizenship === "string" && a.country_of_citizenship) ||
    null;
  const hasAssetProtection = true; // Family Docs are always included
  const hasPetRescue = false; // pet rescue removed from the product


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
        language,
        date_of_birth: typeof a.dob === "string" ? a.dob : null,
        a_number: typeof a.a_number === "string" ? a.a_number : null,
        place_of_birth: placeOfBirth,
        country_of_origin: countryOfOrigin,
        has_asset_protection: hasAssetProtection,
        has_pet_rescue: hasPetRescue,
        // Per-client signing key for POST /api/public/app-trigger. Without it
        // verify_app_trigger_signature() returns invalid_token and every SOS
        // fire/cancel from the phone is rejected with 401.
        hmac_secret: generateHex(32),

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
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      step: "board_registration",
      status: "failed",
      errorMessage: error?.message ?? "insert failed",
    });
    return { ok: false, error: error?.message ?? "insert failed" };
  }

  if (!inserted) {
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      step: "board_registration",
      status: "failed",
      errorMessage: "could not allocate activation code",
    });
    return { ok: false, error: "could not allocate activation code" };
  }
  const clientId = inserted.id;
  await logDelivery({
    intakeSessionId: params.intakeSessionId,
    clientId,
    activationCode: code,
    step: "board_registration",
    status: "success",
    target: "admin boards",
    metadata: { full_name: fullName, language },
  });


  // Mirror emergency contacts from intake answers (sections 6 + 7 + 8)
  const contactsToInsert: Array<Record<string, any>> = [];
  const addContact = (
    name: unknown,
    phone: unknown,
    email: unknown,
    relationship: string,
    priority: number,
    role: "family" | "lawyer" | "company" = "family",
  ) => {
    if (typeof name === "string" && name.trim()) {
      contactsToInsert.push({
        client_id: clientId,
        name: name.trim(),
        phone_e164: typeof phone === "string" ? phone : null,
        email: typeof email === "string" ? email : null,
        relationship,
        role,
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
  addContact(
    a.emergency_contact_3_name,
    a.emergency_contact_3_phone,
    a.emergency_contact_3_email,
    typeof a.emergency_contact_3_relation === "string" ? a.emergency_contact_3_relation : "emergency-3",
    3,
  );
  addContact(a.contact_name, a.contact_phone, a.contact_email, "family", 4);

  // Locked legal-team contact so the alert inbox is visible inside the app.
  addContact(
    "DetencionDefensa Legal Alerts",
    null,
    "alerts@detenciondefensa.com",
    "legal-team",
    5,
    "company",
  );

  // De-duplicate: the family contact is often the same person as emergency #1.
  {
    const seen = new Set<string>();
    for (let i = contactsToInsert.length - 1; i >= 0; i--) {
      const c = contactsToInsert[i]!;
      const key = `${String(c.name).toLowerCase()}|${c.phone_e164 ?? ""}`;
      if (seen.has(key)) contactsToInsert.splice(i, 1);
      else seen.add(key);
    }
    contactsToInsert.forEach((c, i) => (c.priority = i + 1));
  }


  if (contactsToInsert.length) {
    const { error: contactErr } = await sb.from("client_contacts").insert(contactsToInsert);
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      clientId,
      activationCode: code,
      step: "contacts_synced",
      status: contactErr ? "failed" : "success",
      errorMessage: contactErr?.message ?? null,
      metadata: { count: contactsToInsert.length, names: contactsToInsert.map((c) => c.name) },
    });
  } else {
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      clientId,
      activationCode: code,
      step: "contacts_synced",
      status: "skipped",
      errorMessage: "no emergency contacts captured on the intake form",
    });
  }


  // Pet rescue removed from the product — nothing to persist.


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

  // Family Docs (power of attorney, school pickup, vehicle impound, bank
  // access, property access) are NOT generated into or bundled with the app.
  // They must be printed, signed and notarized, so they are emailed to the
  // client separately (see the family-forms email in activation-emails.server).

  // document_type strings MUST match Premio's router.
  const coreLegalDocs: Array<{ type: string; title: string }> = [
    { type: "ao_242", title: "AO 242 — Petition for Writ of Habeas Corpus" },
    { type: "ao_240", title: "AO 240 — Application to Proceed In Forma Pauperis" },
    { type: "civil_cover_sheet", title: "JS-44 — Civil Cover Sheet" },
    { type: "motion_for_counsel", title: "SDFL Motion for Referral to Volunteer Attorney" },
    { type: "memorandum_of_law", title: "Memorandum of Law" },
  ];

  const docSet = [...coreLegalDocs];




  const seedDocs = docSet.map((d) => ({
    client_id: clientId,
    title: d.title,
    content: generated.get(d.type) ?? "",
    document_type: d.type,
    send_on_alert: true,
    from_app: false,
  }));

  const docInsert = await sb.from("client_documents").insert(seedDocs as never);
  await logDelivery({
    intakeSessionId: params.intakeSessionId,
    clientId,
    activationCode: code,
    step: "documents_generated",
    status: docInsert.error ? "failed" : "success",
    errorMessage: docInsert.error?.message ?? null,
    target: "phone bundle",
    metadata: {
      documents: docSet.map((d) => d.type),
      empty: docSet.filter((d) => !generated.get(d.type)).map((d) => d.type),
    },
  });

  // Send activation email
  if (email) {
    await trackDelivery(
      {
        intakeSessionId: params.intakeSessionId,
        clientId,
        activationCode: code,
        step: "activation_email",
        target: email,
      },
      () =>
        sendActivationEmail({
          to: email,
          code,
          language,
          fullName: fullName ?? "",
        }),
    );
  } else {
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      clientId,
      activationCode: code,
      step: "activation_email",
      status: "skipped",
      errorMessage: "no client email captured on the intake form",
    });
  }

  // Send activation SMS
  if (phone) {
    await trackDelivery(
      {
        intakeSessionId: params.intakeSessionId,
        clientId,
        activationCode: code,
        step: "activation_sms",
        target: phone,
      },
      () =>
        sendSms({
          to: phone,
           body: activationSmsBody(code, language),
          purpose: "activation",
          metadata: { client_id: clientId },
        }),
    );
  } else {
    await logDelivery({
      intakeSessionId: params.intakeSessionId,
      clientId,
      activationCode: code,
      step: "activation_sms",
      status: "skipped",
      errorMessage: "no client mobile number captured on the intake form",
    });
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

  const templateData = {
    code: params.code,
    language: normalizeEmailLanguage(params.language),
    fullName: params.fullName,
    apkUrl,
  };

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const messageId = crypto.randomUUID();
  // A manual resend must be a new provider request. Reusing only the activation
  // code caused later attempts to be deduplicated by the email provider, so
  // the log could say "sent" without a new inbox copy.
  const idempotencyKey = `app-activation-${params.code}-${messageId}`;

  const result = await sendManagedEmail({
    message_id: messageId,
    to: params.to,
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text,
    label: "app-activation",
    idempotency_key: idempotencyKey,
  });
  if (!result.sent) {
    throw new Error(
      result.reason === "recipient_suppressed"
        ? "Recipient is unsubscribed or previously bounced"
        : result.error,
    );
  }
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

export async function resendActivationEmailOnly(clientId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const sb = admin();
  const { data, error } = await sb
    .from("app_clients")
    .select("invite_token, email, language, full_name")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !data) return { ok: false, error: error?.message ?? "not found" };
  const client = data as {
    invite_token: string;
    email: string | null;
    language: string;
    full_name: string | null;
  };
  if (!client.email) return { ok: false, error: "client has no email" };

  await sendActivationEmail({
    to: client.email,
    code: client.invite_token,
    language: client.language,
    fullName: client.full_name ?? "",
  });
  return { ok: true };
}
