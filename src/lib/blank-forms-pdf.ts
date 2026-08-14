// Blank (unfilled) authorization forms the client signs IN ADVANCE.
// These are NOT sent to DetencionDefensa or the firm — they ride in the phone
// bundle and are released to the client's PRIMARY CONTACT when the app fires.
//
// Sources: Florida Power of Attorney Act (Fla. Stat. ch. 709, "FUPOAA"),
// Fla. Stat. 709.2202 (superpowers requiring separate initials), and generic
// public authorization templates. Pure pdf-lib so it runs in the Worker.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type Lang = "en" | "es" | "ht";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;
const CONTENT_W = PAGE_W - MARGIN * 2;

export interface BlankForm {
  /** document_type stored in client_documents (blank copy). */
  type: string;
  filename: string;
  title: string;
  bytes: Uint8Array;
  /** Where a drawn signature should be stamped when the client e-signs. */
  anchor: { pageIndex: number; x: number; y: number };
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  y: number;
  pageIndex: number;
}

async function newDoc(title: string): Promise<Ctx> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setProducer("DetencionDefensa.com");
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return { doc, page, font, bold, italic, y: PAGE_H - MARGIN, pageIndex: 0 };
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const w of para.split(/\s+/)) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW && line) {
        out.push(line);
        line = w;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.pageIndex += 1;
    ctx.y = PAGE_H - MARGIN;
  }
}

function para(
  ctx: Ctx,
  text: string,
  opts: { bold?: boolean; italic?: boolean; size?: number; gap?: number } = {},
) {
  const size = opts.size ?? 10.5;
  const font = opts.bold ? ctx.bold : opts.italic ? ctx.italic : ctx.font;
  const lines = wrap(text, font, size, CONTENT_W);
  ensure(ctx, lines.length * (size + 3) + (opts.gap ?? 6));
  for (const line of lines) {
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - size, size, font });
    ctx.y -= size + 3;
  }
  ctx.y -= opts.gap ?? 6;
}

/** A labelled blank fill-in line, e.g. "Full legal name: ______". */
function field(ctx: Ctx, label: string, widthRatio = 1) {
  const size = 10.5;
  ensure(ctx, 26);
  ctx.page.drawText(label, { x: MARGIN, y: ctx.y - size, size, font: ctx.font });
  const labelW = ctx.font.widthOfTextAtSize(label, size) + 6;
  ctx.page.drawLine({
    start: { x: MARGIN + labelW, y: ctx.y - size - 2 },
    end: { x: MARGIN + (CONTENT_W - 0) * widthRatio, y: ctx.y - size - 2 },
    thickness: 0.6,
    color: rgb(0.35, 0.35, 0.35),
  });
  ctx.y -= size + 14;
}

function title(ctx: Ctx, main: string, sub: string, banner: string) {
  ensure(ctx, 60);
  ctx.page.drawText(main, { x: MARGIN, y: ctx.y - 16, size: 15, font: ctx.bold });
  ctx.y -= 22;
  ctx.page.drawText(sub, { x: MARGIN, y: ctx.y - 11, size: 10, font: ctx.italic, color: rgb(0.35, 0.3, 0.25) });
  ctx.y -= 18;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 1,
    color: rgb(0.72, 0.33, 0.12),
  });
  ctx.y -= 16;
  ctx.page.drawText(banner, {
    x: MARGIN,
    y: ctx.y - 9,
    size: 9,
    font: ctx.italic,
    color: rgb(0.4, 0.4, 0.4),
  });
  ctx.y -= 22;
}

interface Chrome {
  signature: string;
  principal: string;
  printName: string;
  date: string;
  witness: string;
  notary: string;
  notaryBody: string;
  notarySig: string;
  notarySeal: string;
  disclaimer: string;
}

const CHROME: Record<Lang, Chrome> = {
  en: {
    signature: "SIGNATURE OF PRINCIPAL",
    principal: "Signature",
    printName: "Print full legal name",
    date: "Date",
    witness: "Witness signature",
    notary: "NOTARY ACKNOWLEDGMENT",
    notaryBody:
      "State of ______________  County of ______________. On ______________, before me, the undersigned notary public (or, if performed by audio-video communication technology, a remote online notary), personally appeared the person who signed above, proved to me on the basis of satisfactory evidence to be the individual described, and acknowledged that they executed this document freely and for the purposes stated.",
    notarySig: "Notary public signature",
    notarySeal: "Notary seal / commission expires",
    disclaimer:
      "DetencionDefensa.com, Inc. is a Delaware corporation. It is not a law firm and does not provide legal advice. This is a blank template based on public statutory models. Requirements vary by state; two witnesses and a notary are required for a Florida power of attorney (Fla. Stat. 709.2105). Have this reviewed by a licensed attorney in your state.",
  },
  es: {
    signature: "FIRMA DEL OTORGANTE",
    principal: "Firma",
    printName: "Nombre legal completo en letra de imprenta",
    date: "Fecha",
    witness: "Firma del testigo",
    notary: "RECONOCIMIENTO NOTARIAL",
    notaryBody:
      "Estado de ______________  Condado de ______________. El ______________, ante mí, notario público (o notario remoto en línea mediante tecnología de audio y video), compareció personalmente la persona que firmó arriba, quien acreditó con pruebas satisfactorias ser la persona descrita, y reconoció haber firmado este documento libremente y para los fines indicados.",
    notarySig: "Firma del notario público",
    notarySeal: "Sello notarial / vencimiento de la comisión",
    disclaimer:
      "DetencionDefensa.com, Inc. es una corporación de Delaware. No es un bufete de abogados y no brinda asesoría legal. Esta es una plantilla en blanco basada en modelos legales públicos. Los requisitos varían por estado; un poder notarial de Florida requiere dos testigos y un notario (Fla. Stat. 709.2105). Haga que un abogado con licencia en su estado lo revise.",
  },
  ht: {
    signature: "SIYATI MOUN KI BAY POUVWA A",
    principal: "Siyati",
    printName: "Ekri non legal konplè",
    date: "Dat",
    witness: "Siyati temwen",
    notary: "REKONÈSANS NOTÈ",
    notaryBody:
      "Eta ______________  Konte ______________. Nan dat ______________, devan mwen, notè piblik la (oswa yon notè an liy atravè teknoloji odyo-videyo), moun ki siyen anwo a parèt pèsonèlman, li pwouve ak prèv satisfezan se li menm, epi li rekonèt li te siyen dokiman sa a lib e pou rezon ki endike yo.",
    notarySig: "Siyati notè piblik",
    notarySeal: "So notè / dat komisyon an ekspire",
    disclaimer:
      "DetencionDefensa.com, Inc. se yon konpayi Delaware. Li pa yon kabinè avoka e li pa bay konsèy legal. Sa a se yon modèl vid ki baze sou modèl legal piblik. Egzijans yo varye pa eta; yon pouvwa avoka Florid mande de temwen ak yon notè (Fla. Stat. 709.2105). Fè yon avoka ki gen lisans nan eta w revize l.",
  },
};

/** Signature + witness + notary block. Returns the signature-line anchor. */
function signatureBlock(ctx: Ctx, c: Chrome, opts: { witnesses?: boolean } = {}) {
  ensure(ctx, 96);
  ctx.y -= 8;
  para(ctx, c.signature, { bold: true, size: 11, gap: 10 });
  ctx.y -= 26; // headroom so a stamped signature never collides with the heading

  const size = 10.5;
  const anchorY = ctx.y - size - 2;
  ctx.page.drawText("X", { x: MARGIN, y: ctx.y - size, size, font: ctx.font });
  ctx.page.drawLine({
    start: { x: MARGIN + 14, y: anchorY },
    end: { x: MARGIN + 300, y: anchorY },
    thickness: 0.8,
    color: rgb(0.2, 0.2, 0.2),
  });
  const anchor = { pageIndex: ctx.pageIndex, x: MARGIN + 18, y: anchorY + 3 };
  ctx.y -= size + 16;

  field(ctx, `${c.printName}:`, 0.9);
  field(ctx, `${c.date}:`, 0.5);

  if (opts.witnesses) {
    field(ctx, `${c.witness} 1:`, 0.9);
    field(ctx, `${c.witness} 2:`, 0.9);
  }

  para(ctx, c.notary, { bold: true, size: 11, gap: 6 });
  para(ctx, c.notaryBody, { size: 9 });
  field(ctx, `${c.notarySig}:`, 0.9);
  field(ctx, `${c.notarySeal}:`, 0.9);
  para(ctx, c.disclaimer, { italic: true, size: 8 });
  return anchor;
}

const BANNER: Record<Lang, string> = {
  en: "BLANK FORM — complete and sign before it is needed.",
  es: "FORMULARIO EN BLANCO — complételo y fírmelo antes de necesitarlo.",
  ht: "FÒM VID — ranpli epi siyen li anvan ou bezwen l.",
};

type Copy = Record<Lang, string>;
const pick = (c: Copy, lang: Lang) => c[lang] || c.en;

// ============================ FORMS ============================

async function floridaPOA(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("Florida Durable Power of Attorney (blank)");
  title(
    ctx,
    pick(
      {
        en: "FLORIDA DURABLE POWER OF ATTORNEY",
        es: "PODER NOTARIAL DURADERO DE FLORIDA",
        ht: "POUVWA AVOKA DIRAB FLORID",
      },
      lang,
    ),
    "Fla. Stat. ch. 709 (Florida Power of Attorney Act) — blank template",
    BANNER[lang],
  );
  para(
    ctx,
    pick(
      {
        en: "NOTICE TO PRINCIPAL: This is an important legal document. It grants the agent broad authority to act for you and to handle your property. It is effective immediately when signed and is NOT terminated by your later incapacity. You may revoke it in writing at any time.",
        es: "AVISO AL OTORGANTE: Este es un documento legal importante. Otorga al apoderado amplia autoridad para actuar por usted y manejar sus bienes. Entra en vigor de inmediato al firmarse y NO termina por su incapacidad posterior. Puede revocarlo por escrito en cualquier momento.",
        ht: "AVI POU MOUN KI BAY POUVWA A: Sa a se yon dokiman legal enpòtan. Li bay reprezantan an gwo otorite pou aji pou ou epi jere byen ou. Li antre an vigè imedyatman lè w siyen epi li PA fini si w vin enkapasite. Ou ka revoke l alekri nenpòt lè.",
      },
      lang,
    ),
    { size: 9.5 },
  );
  field(ctx, pick({ en: "I, principal (full legal name):", es: "Yo, otorgante (nombre legal completo):", ht: "Mwen menm, moun ki bay pouvwa a (non legal konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Address:", es: "Dirección:", ht: "Adrès:" }, lang), 0.95);
  field(ctx, pick({ en: "Date of birth:", es: "Fecha de nacimiento:", ht: "Dat nesans:" }, lang), 0.6);
  field(ctx, pick({ en: "appoint as my agent (attorney-in-fact):", es: "designo como mi apoderado:", ht: "nonmen kòm reprezantan mwen:" }, lang), 0.95);
  field(ctx, pick({ en: "Agent address / phone:", es: "Dirección / teléfono del apoderado:", ht: "Adrès / telefòn reprezantan an:" }, lang), 0.95);
  field(ctx, pick({ en: "Successor agent (optional):", es: "Apoderado suplente (opcional):", ht: "Reprezantan ranplasan (opsyonèl):" }, lang), 0.95);
  para(
    ctx,
    pick(
      {
        en: "POWERS GRANTED — initial each power you wish to grant:",
        es: "PODERES OTORGADOS — ponga sus iniciales junto a cada poder que desee otorgar:",
        ht: "POUVWA YO BAY — mete inisyal ou bò kote chak pouvwa ou vle bay:",
      },
      lang,
    ),
    { bold: true, size: 10.5 },
  );
  const powers: Copy[] = [
    { en: "Banking and financial transactions; deposit, withdraw, and manage accounts.", es: "Transacciones bancarias y financieras; depositar, retirar y manejar cuentas.", ht: "Tranzaksyon bankè ak finansye; depoze, retire, jere kont." },
    { en: "Real property: manage, lease, pay mortgage, taxes, insurance.", es: "Bienes inmuebles: administrar, arrendar, pagar hipoteca, impuestos, seguro.", ht: "Byen imobilye: jere, lwe, peye ipotèk, taks, asirans." },
    { en: "Personal property and vehicles, including retrieval from impound.", es: "Bienes muebles y vehículos, incluida su recuperación del depósito.", ht: "Byen pèsonèl ak machin, ansanm ak rekipere yo nan depo." },
    { en: "Insurance, benefits, and government claims.", es: "Seguros, beneficios y reclamos gubernamentales.", ht: "Asirans, benefis, ak reklamasyon gouvènman." },
    { en: "Care, support, and school matters of my minor children.", es: "Cuidado, manutención y asuntos escolares de mis hijos menores.", ht: "Swen, sipò, ak zafè lekòl timoun minè mwen yo." },
    { en: "Retain legal counsel and act in legal proceedings on my behalf.", es: "Contratar abogados y actuar en procedimientos legales en mi nombre.", ht: "Anboche avoka epi aji nan pwosedi legal pou mwen." },
  ];
  for (const p of powers) {
    ensure(ctx, 22);
    ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y - 12 }, end: { x: MARGIN + 34, y: ctx.y - 12 }, thickness: 0.6, color: rgb(0.35, 0.35, 0.35) });
    const lines = wrap(pick(p, lang), ctx.font, 10, CONTENT_W - 44);
    let yy = ctx.y - 10;
    for (const l of lines) {
      ctx.page.drawText(l, { x: MARGIN + 44, y: yy, size: 10, font: ctx.font });
      yy -= 13;
    }
    ctx.y = yy - 6;
  }
  para(
    ctx,
    pick(
      {
        en: "SEPARATE SIGNATURE REQUIRED (Fla. Stat. 709.2202) — the agent may NOT create, amend, or revoke a trust, make a gift, change beneficiary designations, or create rights of survivorship unless the principal signs or initials next to that specific authority: __________",
        es: "FIRMA POR SEPARADO REQUERIDA (Fla. Stat. 709.2202) — el apoderado NO puede crear, modificar ni revocar un fideicomiso, hacer donaciones, cambiar beneficiarios ni crear derechos de supervivencia salvo que el otorgante firme o ponga iniciales junto a esa autoridad: __________",
        ht: "SIYATI SEPARE OBLIGATWA (Fla. Stat. 709.2202) — reprezantan an PA kapab kreye, modifye oswa anile yon trust, fè kado, chanje benefisyè, oswa kreye dwa siviv sof si moun nan siyen oswa mete inisyal bò kote otorite espesifik sa a: __________",
      },
      lang,
    ),
    { size: 9 },
  );
  const anchor = signatureBlock(ctx, c, { witnesses: true });
  return { bytes: await ctx.doc.save(), anchor };
}

// ==================== OFFICIAL GOVERNMENT FORMS ====================
// These are the real, unmodified PDFs published by the State of Florida.
// We do NOT redraw them. We embed the official file verbatim and append a
// single signature/notary page at the end so the e-sign flow has an anchor
// without writing on the official pages.

import hsmv82053B64 from "@/assets/forms/FL-HSMV-82053-power-of-attorney.pdf.b64";
import form970cB64 from "@/assets/forms/FL-12.970c-consent-temporary-custody.pdf.b64";
import form970dB64 from "@/assets/forms/FL-12.970d-consent-concurrent-custody.pdf.b64";

function b64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const OFFICIAL_NOTE: Record<Lang, string> = {
  en: "The pages before this one are the official form as published by the State of Florida, reproduced without alteration. Complete the official pages; use the block below only if a witness or notary signature is requested.",
  es: "Las páginas anteriores son el formulario oficial publicado por el Estado de Florida, reproducido sin alteraciones. Complete las páginas oficiales; use el bloque siguiente solo si se requiere firma de testigo o notario.",
  ht: "Paj anvan yo se fòm ofisyèl Eta Florid la pibliye, san okenn chanjman. Ranpli paj ofisyèl yo; sèvi ak blòk anba a sèlman si yo mande yon siyati temwen oswa notè.",
};

/** Embed an official PDF verbatim and append a signature page. */
async function officialForm(b64: string, lang: Lang, docTitle: string) {
  const c = CHROME[lang];
  const doc = await PDFDocument.load(b64ToBytes(b64));
  doc.setTitle(docTitle);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const ctx: Ctx = {
    doc,
    page,
    font,
    bold,
    italic,
    y: PAGE_H - MARGIN,
    pageIndex: doc.getPageCount() - 1,
  };
  para(ctx, docTitle, { bold: true, size: 12 });
  para(ctx, OFFICIAL_NOTE[lang], { italic: true, size: 9 });
  const anchor = signatureBlock(ctx, c);
  return { bytes: await doc.save(), anchor };
}

/**
 * Fla. Stat. 709.2119(2) — the statutory affidavit a bank or lender may
 * require from an agent acting under a power of attorney. Reproduced from the
 * statutory text (Florida publishes no fillable PDF of it).
 */
async function poaAffidavit(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("Affidavit under Fla. Stat. 709.2119(2)");
  title(
    ctx,
    "AFFIDAVIT UNDER SECTION 709.2119(2), FLORIDA STATUTES",
    pick(
      {
        en: "Statutory affidavit of an agent acting under a power of attorney — the form a bank or lender may require",
        es: "Declaración jurada estatutaria del apoderado bajo un poder notarial — el formulario que un banco o prestamista puede exigir",
        ht: "Deklarasyon sou sèman legal reprezantan an anba yon pouvwa avoka — fòm yon bank oswa prete kapab mande",
      },
      lang,
    ),
    BANNER[lang],
  );
  para(
    ctx,
    "State of ______________   County of ______________",
    { size: 10.5 },
  );
  para(
    ctx,
    "Before me, the undersigned authority, personally appeared ____________________ (\u201cAffiant\u201d) by the means specified herein, who swore or affirmed that:",
    { size: 10 },
  );
  const items = [
    "1. Affiant is the agent named in the Power of Attorney executed by ____________________ (\u201cPrincipal\u201d) on ______________.",
    "2. This Power of Attorney is currently exercisable by Affiant. The principal is domiciled in ____________________ (insert name of state, territory, or foreign country).",
    "3. To the best of Affiant\u2019s knowledge after diligent search and inquiry:",
    "     a. The Principal is not deceased;",
    "     b. Affiant\u2019s authority has not been suspended by initiation of proceedings to determine incapacity or to appoint a guardian or a guardian advocate;",
    "     c. Affiant\u2019s authority has not been terminated by the filing of an action for dissolution or annulment of Affiant\u2019s marriage to the principal, or their legal separation; and",
    "     d. There has been no revocation, or partial or complete termination, of the power of attorney or of Affiant\u2019s authority.",
    "4. Affiant is acting within the scope of authority granted in the power of attorney.",
    "5. Affiant is the successor to ____________________ (insert name of predecessor agent), who has resigned, died, become incapacitated, is no longer qualified to serve, has declined to serve as agent, or is otherwise unable to act, if applicable.",
    "6. Affiant agrees not to exercise any powers granted by the Power of Attorney if Affiant attains knowledge that the power of attorney has been revoked, has been partially or completely terminated or suspended, or is no longer valid because of the death or adjudication of incapacity of the Principal.",
  ];
  for (const it of items) para(ctx, it, { size: 10, gap: 4 });
  para(
    ctx,
    pick(
      {
        en: "Attach a copy of the signed and notarized Power of Attorney when presenting this affidavit to a bank, credit union, or lender.",
        es: "Adjunte una copia del poder notarial firmado y notarizado al presentar esta declaración a un banco, cooperativa de crédito o prestamista.",
        ht: "Tache yon kopi pouvwa avoka a ki siyen epi notarye lè w prezante deklarasyon sa a bay yon bank oswa prete.",
      },
      lang,
    ),
    { italic: true, size: 9 },
  );
  const anchor = signatureBlock(ctx, c);
  return { bytes: await ctx.doc.save(), anchor };
}

export const BLANK_FORM_TITLES: Record<string, Record<Lang, string>> = {
  blank_power_of_attorney: {
    en: "BLANK — Florida Durable Power of Attorney (Fla. Stat. ch. 709)",
    es: "EN BLANCO — Poder Notarial Duradero de Florida (Fla. Stat. cap. 709)",
    ht: "VID — Pouvwa Avoka Dirab Florid (Fla. Stat. ch. 709)",
  },
  blank_school_pickup: {
    en: "OFFICIAL — Consent for Concurrent Custody by Extended Family (Fla. Sup. Ct. Form 12.970(d))",
    es: "OFICIAL — Consentimiento para Custodia Concurrente por Familia Extendida (Formulario 12.970(d) de la Corte Suprema de Florida)",
    ht: "OFISYÈL — Konsantman pou Gad Konkiran pa Fanmi Elaji (Fòm 12.970(d) Tribinal Siprèm Florid)",
  },
  blank_vehicle_impound_release: {
    en: "OFFICIAL — Power of Attorney for a Motor Vehicle, Mobile Home or Vessel (FLHSMV Form 82053)",
    es: "OFICIAL — Poder para Vehículo, Casa Móvil o Embarcación (Formulario FLHSMV 82053)",
    ht: "OFISYÈL — Pouvwa Avoka pou Machin, Kay Mobil oswa Batiman (Fòm FLHSMV 82053)",
  },
  blank_bank_account_access: {
    en: "OFFICIAL — Affidavit under Fla. Stat. 709.2119(2) (statutory bank/lender affidavit)",
    es: "OFICIAL — Declaración Jurada bajo Fla. Stat. 709.2119(2) (declaración estatutaria para bancos/prestamistas)",
    ht: "OFISYÈL — Deklarasyon anba Fla. Stat. 709.2119(2) (deklarasyon legal pou bank/prete)",
  },
  blank_property_access: {
    en: "OFFICIAL — Consent for Temporary Custody by Extended Family (Fla. Sup. Ct. Form 12.970(c))",
    es: "OFICIAL — Consentimiento para Custodia Temporal por Familia Extendida (Formulario 12.970(c) de la Corte Suprema de Florida)",
    ht: "OFISYÈL — Konsantman pou Gad Tanporè pa Fanmi Elaji (Fòm 12.970(c) Tribinal Siprèm Florid)",
  },
};

export async function generateBlankForms(lang: Lang): Promise<BlankForm[]> {
  const specs: Array<[string, string, () => Promise<{ bytes: Uint8Array; anchor: BlankForm["anchor"] }>]> = [
    ["blank_power_of_attorney", "blank-1-florida-power-of-attorney.pdf", () => floridaPOA(lang)],
    [
      "blank_school_pickup",
      "official-2-FL-12.970d-consent-concurrent-custody.pdf",
      () => officialForm(form970dB64, lang, "Florida Supreme Court Approved Family Law Form 12.970(d)"),
    ],
    [
      "blank_vehicle_impound_release",
      "official-3-FLHSMV-82053-power-of-attorney-vehicle.pdf",
      () => officialForm(hsmv82053B64, lang, "FLHSMV Form 82053 — Power of Attorney for a Motor Vehicle, Mobile Home, Vessel"),
    ],
    ["blank_bank_account_access", "official-4-affidavit-709.2119.pdf", () => poaAffidavit(lang)],
    [
      "blank_property_access",
      "official-5-FL-12.970c-consent-temporary-custody.pdf",
      () => officialForm(form970cB64, lang, "Florida Supreme Court Approved Family Law Form 12.970(c)"),
    ],
  ];
  const out: BlankForm[] = [];
  for (const [type, filename, build] of specs) {
    const { bytes, anchor } = await build();
    out.push({ type, filename, title: BLANK_FORM_TITLES[type][lang], bytes, anchor });
  }
  return out;
}
