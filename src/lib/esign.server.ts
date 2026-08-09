// Server-only helpers for the blank-form e-signature flow (/firmar).
// The client opens the page with their activation code, picks the PRIMARY
// CONTACT who will receive these documents when the app fires, draws a
// signature, and we stamp it into each blank authorization form.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateBlankForms, BLANK_FORM_TITLES, type Lang } from "@/lib/blank-forms-pdf";

function normLang(v: string | null | undefined): Lang {
  return v === "en" || v === "ht" ? v : "es";
}

const toB64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");

async function findClient(code: string) {
  const { data, error } = await supabaseAdmin
    .from("app_clients")
    .select("id, full_name, language, invite_token")
    .eq("invite_token", code.trim().toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; full_name: string | null; language: string | null; invite_token: string };
}

export interface SigningPacket {
  ok: true;
  clientName: string;
  language: Lang;
  contacts: Array<{ id: string; name: string; relationship: string | null; phone: string | null; email: string | null; isPrimary: boolean }>;
  forms: Array<{ type: string; title: string; signed: boolean; signedAt: string | null }>;
}

export async function loadSigningPacket(code: string): Promise<SigningPacket | { ok: false; error: string }> {
  const client = await findClient(code);
  if (!client) return { ok: false, error: "not_found" };
  const lang = normLang(client.language);

  const [{ data: contacts }, { data: docs }] = await Promise.all([
    supabaseAdmin
      .from("client_contacts")
      .select("id, name, relationship, phone_e164, email, priority")
      .eq("client_id", client.id)
      .order("priority", { ascending: true }),
    supabaseAdmin
      .from("client_documents")
      .select("document_type, created_at")
      .eq("client_id", client.id)
      .like("document_type", "blank_%"),
  ]);

  const signedTypes = new Map<string, string>();
  for (const d of (docs ?? []) as Array<{ document_type: string; created_at: string }>) {
    if (d.document_type.endsWith("_signed")) {
      signedTypes.set(d.document_type.replace(/_signed$/, ""), d.created_at);
    }
  }

  return {
    ok: true,
    clientName: client.full_name ?? "",
    language: lang,
    contacts: ((contacts ?? []) as Array<{ id: string; name: string; relationship: string | null; phone_e164: string | null; email: string | null; priority: number }>).map((c, i) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone_e164,
      email: c.email,
      isPrimary: c.priority === 1 || (i === 0 && c.priority === 1),
    })),
    forms: Object.keys(BLANK_FORM_TITLES).map((type) => ({
      type,
      title: BLANK_FORM_TITLES[type][lang],
      signed: signedTypes.has(type),
      signedAt: signedTypes.get(type) ?? null,
    })),
  };
}

export async function setPrimaryContact(code: string, contactId: string) {
  const client = await findClient(code);
  if (!client) return { ok: false as const, error: "not_found" };
  const { data: contacts } = await supabaseAdmin
    .from("client_contacts")
    .select("id")
    .eq("client_id", client.id);
  const ids = ((contacts ?? []) as Array<{ id: string }>).map((c) => c.id);
  if (!ids.includes(contactId)) return { ok: false as const, error: "bad_contact" };
  let next = 2;
  for (const id of ids) {
    const priority = id === contactId ? 1 : next++;
    await supabaseAdmin
      .from("client_contacts")
      .update({ priority, notify_on_sos: true } as never)
      .eq("id", id);
  }
  return { ok: true as const };
}

/** Ensure the five blank templates exist in the client's bundle. */
export async function ensureBlankForms(clientId: string, lang: Lang) {
  const { data: existing } = await supabaseAdmin
    .from("client_documents")
    .select("document_type")
    .eq("client_id", clientId)
    .like("document_type", "blank_%");
  const have = new Set(((existing ?? []) as Array<{ document_type: string }>).map((d) => d.document_type));
  const forms = await generateBlankForms(lang);
  const rows = forms
    .filter((f) => !have.has(f.type))
    .map((f) => ({
      client_id: clientId,
      title: f.title,
      content: toB64(f.bytes),
      document_type: f.type,
      send_on_alert: true,
      from_app: false,
    }));
  if (rows.length) await supabaseAdmin.from("client_documents").insert(rows as never);
  return forms;
}

export interface SignInput {
  code: string;
  types: string[];
  /** PNG data URL from the signature pad. */
  signatureDataUrl: string;
  typedName: string;
  ip: string | null;
  userAgent: string | null;
}

export async function signBlankForms(input: SignInput) {
  const client = await findClient(input.code);
  if (!client) return { ok: false as const, error: "not_found" };
  const lang = normLang(client.language);

  const b64 = input.signatureDataUrl.split(",")[1] ?? "";
  const pngBytes = Buffer.from(b64, "base64");
  if (pngBytes.length < 100) return { ok: false as const, error: "bad_signature" };

  const forms = await generateBlankForms(lang);
  const wanted = new Set(input.types);
  const stampedAt = new Date();
  const signed: string[] = [];

  for (const form of forms) {
    if (!wanted.has(form.type)) continue;
    const pdf = await PDFDocument.load(form.bytes);
    const png = await pdf.embedPng(pngBytes);
    const page = pdf.getPage(form.anchor.pageIndex);
    const maxW = 220;
    const scale = Math.min(maxW / png.width, 46 / png.height);
    page.drawImage(png, {
      x: form.anchor.x,
      y: form.anchor.y,
      width: png.width * scale,
      height: png.height * scale,
    });

    // Certificate of electronic signature (ESIGN Act / UETA).
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const cert = pdf.addPage([612, 792]);
    let y = 720;
    cert.drawText("CERTIFICATE OF ELECTRONIC SIGNATURE", { x: 54, y, size: 14, font: bold });
    y -= 12;
    cert.drawLine({ start: { x: 54, y }, end: { x: 558, y }, thickness: 1, color: rgb(0.72, 0.33, 0.12) });
    y -= 28;
    const rows: Array<[string, string]> = [
      ["Document", form.title],
      ["Signer", input.typedName],
      ["Activation code", client.invite_token],
      ["Signed at (UTC)", stampedAt.toISOString()],
      ["IP address", input.ip ?? "not recorded"],
      ["Device", (input.userAgent ?? "not recorded").slice(0, 90)],
      ["Method", "Drawn signature captured in browser, stamped server-side"],
    ];
    for (const [k, v] of rows) {
      cert.drawText(`${k}:`, { x: 54, y, size: 10, font: bold });
      cert.drawText(v, { x: 190, y, size: 10, font });
      y -= 18;
    }
    y -= 14;
    for (const line of [
      "The signer consented to do business electronically and to sign this record with an",
      "electronic signature under the federal ESIGN Act (15 U.S.C. 7001) and applicable state",
      "UETA. An electronic signature has the same legal effect as a handwritten signature.",
      "",
      "NOTE: Electronic signing does NOT satisfy a notarization requirement. Forms that require",
      "a notary (including a Florida power of attorney, which also requires two witnesses) must",
      "still be notarized in person or through a licensed remote online notary.",
      "",
      "DetencionDefensa.com, Inc. is a Delaware corporation. It is not a law firm and does not",
      "provide legal advice.",
    ]) {
      cert.drawText(line, { x: 54, y, size: 9, font });
      y -= 13;
    }

    const bytes = await pdf.save();
    const type = `${form.type}_signed`;
    await supabaseAdmin.from("client_documents").delete().eq("client_id", client.id).eq("document_type", type);
    const { error } = await supabaseAdmin.from("client_documents").insert({
      client_id: client.id,
      title: `SIGNED — ${form.title.replace(/^(BLANK|EN BLANCO|VID) — /, "")}`,
      content: toB64(bytes),
      document_type: type,
      send_on_alert: true,
      from_app: false,
    } as never);
    if (!error) signed.push(form.type);
  }

  await ensureBlankForms(client.id, lang);
  return { ok: true as const, signed };
}

/** Base64 PDF for a single blank or signed form, for download/preview. */
export async function getFormPdf(code: string, documentType: string) {
  const client = await findClient(code);
  if (!client) return null;
  const { data } = await supabaseAdmin
    .from("client_documents")
    .select("content, title")
    .eq("client_id", client.id)
    .eq("document_type", documentType)
    .maybeSingle();
  if (data && (data as { content: string }).content) {
    return data as { content: string; title: string };
  }
  if (documentType.startsWith("blank_") && !documentType.endsWith("_signed")) {
    const forms = await ensureBlankForms(client.id, normLang(client.language));
    const f = forms.find((x) => x.type === documentType);
    if (f) return { content: toB64(f.bytes), title: f.title };
  }
  return null;
}
