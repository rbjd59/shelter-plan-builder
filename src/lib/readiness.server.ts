// Server-only helpers for the Sentinel Readiness Packet ($100 add-on).
// AES-GCM encryption for vault PDFs, signed-URL delivery on emergency trigger.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendManagedEmail } from "@/lib/email/managed-send.server";

const VAULT_BUCKET = "readiness-vault";
const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not configured`);
  return v;
}

// Derive a per-packet AES-256 key from a server secret + packet id.
// Using SUPABASE_SERVICE_ROLE_KEY as the root secret avoids a new env var.
async function derivePacketKey(packetId: string): Promise<CryptoKey> {
  const root = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const ikm = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(root),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("sentinel-readiness-vault-v1"),
      info: new TextEncoder().encode(packetId),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptForVault(packetId: string, plaintext: Uint8Array): Promise<Uint8Array> {
  const key = await derivePacketKey(packetId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext as BufferSource),
  );
  // [iv(12)][ciphertext]
  const out = new Uint8Array(iv.length + ciphertext.length);
  out.set(iv, 0);
  out.set(ciphertext, iv.length);
  return out;
}

export async function decryptFromVault(packetId: string, blob: Uint8Array): Promise<Uint8Array> {
  const key = await derivePacketKey(packetId);
  const iv = blob.slice(0, 12);
  const ciphertext = blob.slice(12);
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, ciphertext as BufferSource),
  );
}

export async function notifyStaffPacketReady(packetId: string, language: string): Promise<void> {
  const messageId = crypto.randomUUID();
  const subject = `New Sentinel Readiness Packet — pending translation (${language})`;
  const text = `A new Readiness Packet was paid + submitted.

Packet ID: ${packetId}
Language: ${language}

Action: open the staff console (or the database row) to download client answers,
type up the documents in EN + ${language}, generate PDFs, and upload to the
'readiness-vault' bucket under ${packetId}/. Then update the packet row:
  status = 'ready_to_sign'
  signing_token = <new uuid>
  signing_token_expires_at = now() + interval '14 days'`;

  await sendManagedEmail({
    to: "intake@detenciondefensa.com",
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html: `<pre style="font:13px/1.5 monospace">${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre>`,
    text,
    label: "readiness-pending-translation",
    idempotency_key: `readiness-staff-${packetId}`,
    message_id: messageId,
  });
}

export async function notifyClientPacketReadyToSign(opts: {
  packetId: string;
  email: string;
  signingToken: string;
  language: string;
}): Promise<void> {
  const link = `https://detenciondefensa.com/readiness/sign?token=${opts.signingToken}`;
  const messageId = crypto.randomUUID();
  const subjectByLang: Record<string, string> = {
    en: "Your Sentinel Readiness documents are ready to sign",
    es: "Sus documentos Sentinel Readiness están listos para firmar",
    ht: "Dokiman Sentinel Readiness ou yo pare pou siyen",
  };
  const bodyByLang: Record<string, string> = {
    en: `Your translated documents are ready. Download them, print, sign, and have them notarized. Then upload the signed copies back to your secure vault.

Open: ${link}

This link expires in 14 days.`,
    es: `Sus documentos traducidos están listos. Descárguelos, imprímalos, fírmelos y notarícelos. Luego suba las copias firmadas a su bóveda segura.

Abrir: ${link}

Este enlace caduca en 14 días.`,
    ht: `Dokiman tradui ou yo pare. Telechaje yo, enprime yo, siyen yo, epi notaryze yo. Apre, mete kopi siyen yo nan kòfrefò sekirite ou.

Ouvri: ${link}

Lyen sa a ekspire nan 14 jou.`,
  };
  const subject = subjectByLang[opts.language] ?? subjectByLang.en;
  const text = bodyByLang[opts.language] ?? bodyByLang.en;

  await sendManagedEmail({
    to: opts.email,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html: `<div style="font:15px/1.6 Arial,sans-serif;color:#0e1a2b;max-width:560px;padding:24px"><h1 style="font:600 22px Georgia,serif;color:#b8551f">Sentinel Readiness</h1><p>${text.replace(/\n/g, "<br>")}</p><p style="margin-top:24px"><a href="${link}" style="background:#b8551f;color:#fff;padding:14px 22px;text-decoration:none;border-radius:4px;font-weight:600">Open vault</a></p></div>`,
    text,
    label: "readiness-ready-to-sign",
    idempotency_key: `readiness-sign-${opts.packetId}`,
    message_id: messageId,
  });
}

/**
 * Called from the emergency activation handler. Finds vaulted packets for
 * this intake_session_id and emails the designated recipient signed-URL
 * download links for each vaulted PDF (24-hour expiry).
 */
export async function triggerVaultRelease(opts: {
  intakeSessionId: string;
  emergencyActivationId: string;
}): Promise<{ delivered: number }> {
  const { data: packets } = await supabaseAdmin
    .from("readiness_packets" as never)
    .select("id,language,designated_recipient,vault_storage_paths,status")
    .eq("intake_session_id", opts.intakeSessionId)
    .eq("status", "vaulted");

  const rows = (packets ?? []) as Array<{
    id: string;
    language: string;
    designated_recipient: { name?: string; email?: string; phone?: string; relationship?: string } | null;
    vault_storage_paths: string[] | null;
  }>;
  if (!rows.length) return { delivered: 0 };

  let delivered = 0;
  for (const p of rows) {
    const recipientEmail = p.designated_recipient?.email;
    if (!recipientEmail || !p.vault_storage_paths?.length) continue;

    // Generate 24h signed URLs for every vaulted document.
    const links: Array<{ name: string; url: string }> = [];
    for (const path of p.vault_storage_paths) {
      const { data, error } = await supabaseAdmin.storage
        .from(VAULT_BUCKET)
        .createSignedUrl(path, 60 * 60 * 24);
      if (error || !data) continue;
      links.push({ name: path.split("/").pop() ?? path, url: data.signedUrl });
    }
    if (!links.length) continue;

    const messageId = crypto.randomUUID();
    const subject = `URGENT — Sentinel Readiness packet for ${p.designated_recipient?.name ?? "your family member"}`;
    const linksHtml = links
      .map((l) => `<li><a href="${l.url}">${l.name}</a></li>`)
      .join("");
    const linksText = links.map((l) => `- ${l.name}: ${l.url}`).join("\n");
    const text = `An emergency was activated by the family. The signed Readiness Packet has been released to you.

These documents include power of attorney, guardianship, medical authorization, school pickup, and contact information needed to act on the family's behalf right now.

Documents (links expire in 24 hours):
${linksText}

If this is a false alarm, no further action is required.`;
    const html = `<div style="font:15px/1.6 Arial,sans-serif;color:#111;max-width:600px;padding:24px">
      <h1 style="color:#b8551f;font:700 22px Georgia,serif;margin:0 0 12px">Sentinel — Vault Released</h1>
      <p>An emergency was activated by the family. The signed Readiness Packet has been released to you.</p>
      <p>These documents include power of attorney, guardianship, medical authorization, school pickup, and contact information needed to act on the family's behalf <strong>right now</strong>.</p>
      <ul>${linksHtml}</ul>
      <p style="color:#666;font-size:12px">Links expire in 24 hours. If this is a false alarm, no further action is required.</p>
    </div>`;

    await sendManagedEmail({
      to: recipientEmail,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      label: "readiness-vault-released",
      idempotency_key: `vault-release-${p.id}-${opts.emergencyActivationId}`,
      message_id: messageId,
    });

    await supabaseAdmin.from("readiness_deliveries" as never).insert({
      packet_id: p.id,
      emergency_activation_id: opts.emergencyActivationId,
      delivered_to_email: recipientEmail,
      message_id: messageId,
    } as never);
    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({ status: "delivered", delivered_at: new Date().toISOString() } as never)
      .eq("id", p.id);
    delivered++;
  }
  return { delivered };
}

export const VAULT_BUCKET_NAME = VAULT_BUCKET;

/**
 * Send the Readiness Packet to the designated family member NOW (not after
 * emergency). Used by the "Send to family now" button on /readiness/review.
 * Generates 7-day signed URLs (longer than the 24h emergency release).
 */
export async function sendPacketToRecipient(opts: {
  packetId: string;
  recipientEmail: string;
  recipientName: string;
  language: string;
  vaultPaths: string[];
  mode: "send_now";
}): Promise<string> {
  const links: Array<{ name: string; url: string }> = [];
  for (const path of opts.vaultPaths) {
    const { data, error } = await supabaseAdmin.storage
      .from(VAULT_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (error || !data) continue;
    const name = (path.split("/").pop() ?? path).replace(/\.enc$/, "");
    links.push({ name, url: data.signedUrl });
  }
  if (!links.length) throw new Error("No downloadable documents");

  const messageId = crypto.randomUUID();
  const subjectByLang: Record<string, string> = {
    en: `Sentinel Readiness packet shared with you by ${opts.recipientName}`,
    es: `Paquete Sentinel Readiness compartido con usted`,
    ht: `Pake Sentinel Readiness pataje avèk ou`,
  };
  const introByLang: Record<string, string> = {
    en: `A family member has prepared a Sentinel Readiness packet and chose to share it with you now. These documents (power of attorney, guardianship, medical/HIPAA, school pickup, financial inventory, contact tree, and document locator) are what you would need to act on their behalf if they are ever detained or unable to care for their family. Please print, hold them somewhere safe, and keep this email.`,
    es: `Un miembro de la familia ha preparado un paquete Sentinel Readiness y ha decidido compartirlo con usted ahora. Estos documentos (poder notarial, tutela, médico/HIPAA, recogida escolar, inventario financiero, árbol de contactos y mapa de documentos) son los que usted necesitaría para actuar en su nombre si alguna vez son detenidos o no pueden cuidar de su familia. Por favor imprímalos, guárdelos en un lugar seguro y conserve este correo.`,
    ht: `Yon manm fanmi te prepare yon pake Sentinel Readiness epi li chwazi pataje l avèk ou kounye a. Dokiman sa yo (pouvwa notè, gad timoun, medikal/HIPAA, chache lekòl, envantè finansye, kontak ijans, ak kat dokiman) se sa ou ta bezwen pou aji nan non yo si yo ta detni yo oswa yo pa ka pran swen fanmi yo. Tanpri enprime yo, kenbe yo nan yon kote ki an sekirite, epi konsève imèl sa a.`,
  };
  const subject = subjectByLang[opts.language] ?? subjectByLang.en;
  const intro = introByLang[opts.language] ?? introByLang.en;
  const linksHtml = links.map((l) => `<li><a href="${l.url}">${l.name}</a></li>`).join("");
  const linksText = links.map((l) => `- ${l.name}: ${l.url}`).join("\n");
  const text = `${intro}\n\nDocuments (links expire in 7 days — print them now):\n${linksText}`;
  const html = `<div style="font:15px/1.6 Arial,sans-serif;color:#0e1a2b;max-width:600px;padding:24px">
    <h1 style="color:#b8551f;font:700 22px Georgia,serif;margin:0 0 12px">Sentinel Readiness</h1>
    <p>${intro}</p>
    <ul>${linksHtml}</ul>
    <p style="color:#666;font-size:12px">Links expire in 7 days. Print and store these documents in a safe place.</p>
  </div>`;

  await sendManagedEmail({
    to: opts.recipientEmail,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text,
    label: "readiness-send-now",
    idempotency_key: `readiness-send-now-${opts.packetId}-${messageId}`,
    message_id: messageId,
  });

  await supabaseAdmin.from("readiness_deliveries" as never).insert({
    packet_id: opts.packetId,
    delivered_to_email: opts.recipientEmail,
    message_id: messageId,
  } as never);

  return messageId;
}
