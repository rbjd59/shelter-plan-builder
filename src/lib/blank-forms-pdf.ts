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

async function schoolPickup(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("School Pickup Authorization (blank)");
  title(
    ctx,
    pick({ en: "SCHOOL PICKUP & EDUCATIONAL AUTHORIZATION", es: "AUTORIZACIÓN ESCOLAR Y DE RECOGIDA", ht: "OTORIZASYON POU CHACHE TIMOUN LEKÒL" }, lang),
    pick({ en: "To be presented to the school, daycare, or after-school program", es: "Para presentar a la escuela, guardería o programa extraescolar", ht: "Pou prezante bay lekòl, gadri, oswa pwogram apre lekòl" }, lang),
    BANNER[lang],
  );
  field(ctx, pick({ en: "Parent / legal guardian (full name):", es: "Padre/madre o tutor legal (nombre completo):", ht: "Paran / gadyen legal (non konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Phone / email:", es: "Teléfono / correo:", ht: "Telefòn / imèl:" }, lang), 0.9);
  field(ctx, pick({ en: "School / daycare name:", es: "Nombre de la escuela / guardería:", ht: "Non lekòl / gadri:" }, lang), 0.9);
  para(ctx, pick({ en: "CHILDREN COVERED", es: "NIÑOS INCLUIDOS", ht: "TIMOUN KI KONSÈNE" }, lang), { bold: true });
  for (let i = 1; i <= 4; i++) {
    field(ctx, `${i}. ${pick({ en: "Child name / date of birth / grade:", es: "Nombre del niño / fecha de nacimiento / grado:", ht: "Non timoun / dat nesans / klas:" }, lang)}`, 0.98);
  }
  para(ctx, pick({ en: "AUTHORIZED ADULTS", es: "ADULTOS AUTORIZADOS", ht: "ADILT OTORIZE" }, lang), { bold: true });
  for (let i = 1; i <= 3; i++) {
    field(ctx, `${i}. ${pick({ en: "Name / relationship / phone / ID number:", es: "Nombre / parentesco / teléfono / número de identificación:", ht: "Non / relasyon / telefòn / nimewo ID:" }, lang)}`, 0.98);
  }
  para(
    ctx,
    pick(
      {
        en: "I authorize the adults named above to pick up my children from school or childcare, to be contacted in an emergency, to receive and discuss school records and health information, to consent to emergency medical treatment if I cannot be reached, and to speak with teachers and administrators on my behalf. This authorization stays in effect until I revoke it in writing.",
        es: "Autorizo a los adultos nombrados arriba a recoger a mis hijos de la escuela o guardería, a ser contactados en caso de emergencia, a recibir y discutir expedientes escolares e información de salud, a consentir tratamiento médico de emergencia si no se me puede localizar, y a hablar con maestros y administradores en mi nombre. Esta autorización sigue vigente hasta que la revoque por escrito.",
        ht: "Mwen otorize adilt ki nonmen anwo yo pou chache timoun mwen yo nan lekòl oswa gadri, pou yo kontakte yo nan yon ijans, pou resevwa ak diskite dosye lekòl ak enfòmasyon sante, pou bay konsantman pou tretman medikal ijans si yo pa ka jwenn mwen, epi pou pale ak pwofesè ak administratè pou mwen. Otorizasyon sa a rete an vigè jiskaske mwen revoke l alekri.",
      },
      lang,
    ),
    { size: 9.5 },
  );
  const anchor = signatureBlock(ctx, c);
  return { bytes: await ctx.doc.save(), anchor };
}

async function vehicleImpound(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("Vehicle Impound Release Authorization (blank)");
  title(
    ctx,
    pick({ en: "VEHICLE IMPOUND RELEASE AUTHORIZATION", es: "AUTORIZACIÓN PARA LIBERAR VEHÍCULO DEL DEPÓSITO", ht: "OTORIZASYON POU LIBERE MACHIN NAN DEPO" }, lang),
    pick({ en: "To be presented to a police, municipal, or private tow / impound lot", es: "Para presentar a un depósito policial, municipal o privado de grúas", ht: "Pou prezante bay yon depo lapolis, minisipal, oswa prive" }, lang),
    BANNER[lang],
  );
  field(ctx, pick({ en: "Registered owner (full name):", es: "Propietario registrado (nombre completo):", ht: "Pwopriyetè anrejistre (non konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Driver license / ID number:", es: "Licencia / número de identificación:", ht: "Lisans / nimewo ID:" }, lang), 0.9);
  field(ctx, pick({ en: "Authorized person (full name):", es: "Persona autorizada (nombre completo):", ht: "Moun otorize (non konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Authorized person ID / phone:", es: "Identificación / teléfono de la persona autorizada:", ht: "ID / telefòn moun otorize a:" }, lang), 0.9);
  field(ctx, pick({ en: "Vehicle year / make / model / color:", es: "Año / marca / modelo / color del vehículo:", ht: "Ane / mak / modèl / koulè machin nan:" }, lang), 0.95);
  field(ctx, pick({ en: "VIN:", es: "VIN:", ht: "VIN:" }, lang), 0.75);
  field(ctx, pick({ en: "License plate / state:", es: "Placa / estado:", ht: "Plak / eta:" }, lang), 0.75);
  field(ctx, pick({ en: "Impound lot / agency (if known):", es: "Depósito / agencia (si se conoce):", ht: "Depo / ajans (si w konnen):" }, lang), 0.95);
  para(
    ctx,
    pick(
      {
        en: "I am the registered owner or lawful possessor of the vehicle described above. I authorize the person named above to request and take release of the vehicle from any tow, storage, or impound facility, to pay towing and storage charges on my behalf, to sign release and receipt documents, to remove all personal property from the vehicle, and to arrange transport or storage of the vehicle. A copy of this authorization has the same effect as the original.",
        es: "Soy el propietario registrado o poseedor legal del vehículo descrito arriba. Autorizo a la persona nombrada arriba a solicitar y retirar el vehículo de cualquier grúa, almacén o depósito, a pagar los cargos de remolque y almacenamiento en mi nombre, a firmar documentos de entrega y recibo, a retirar todos los bienes personales del vehículo y a organizar el transporte o almacenamiento del vehículo. Una copia de esta autorización tiene el mismo efecto que el original.",
        ht: "Mwen se pwopriyetè anrejistre oswa moun ki gen machin nan legalman. Mwen otorize moun ki nonmen anwo a pou mande epi retire machin nan nan nenpòt sèvis remoke, depo, oswa enpoundman, pou peye frè remoke ak depo pou mwen, pou siyen dokiman liberasyon ak resi, pou retire tout byen pèsonèl nan machin nan, epi pou òganize transpò oswa depo machin nan. Yon kopi otorizasyon sa a gen menm efè ak orijinal la.",
      },
      lang,
    ),
    { size: 9.5 },
  );
  const anchor = signatureBlock(ctx, c);
  return { bytes: await ctx.doc.save(), anchor };
}

async function bankAccess(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("Bank Account Access Authorization (blank)");
  title(
    ctx,
    pick({ en: "BANK ACCOUNT ACCESS AUTHORIZATION", es: "AUTORIZACIÓN DE ACCESO A CUENTA BANCARIA", ht: "OTORIZASYON POU AKSÈ KONT LABANK" }, lang),
    pick({ en: "To be presented to the financial institution", es: "Para presentar a la institución financiera", ht: "Pou prezante bay enstitisyon finansye a" }, lang),
    BANNER[lang],
  );
  field(ctx, pick({ en: "Account holder (full name):", es: "Titular de la cuenta (nombre completo):", ht: "Moun ki gen kont lan (non konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Address / phone:", es: "Dirección / teléfono:", ht: "Adrès / telefòn:" }, lang), 0.95);
  field(ctx, pick({ en: "Financial institution:", es: "Institución financiera:", ht: "Enstitisyon finansye:" }, lang), 0.9);
  field(ctx, pick({ en: "Account type / last 4 digits:", es: "Tipo de cuenta / últimos 4 dígitos:", ht: "Kalite kont / 4 dènye chif:" }, lang), 0.9);
  field(ctx, pick({ en: "Second account (optional):", es: "Segunda cuenta (opcional):", ht: "Dezyèm kont (opsyonèl):" }, lang), 0.9);
  field(ctx, pick({ en: "Authorized person (full name / relationship):", es: "Persona autorizada (nombre / parentesco):", ht: "Moun otorize (non / relasyon):" }, lang), 0.95);
  field(ctx, pick({ en: "Authorized person ID / phone:", es: "Identificación / teléfono de la persona autorizada:", ht: "ID / telefòn moun otorize a:" }, lang), 0.9);
  para(
    ctx,
    pick(
      {
        en: "I authorize the institution named above to allow the authorized person to: obtain balance and transaction information, receive statements, deposit funds, withdraw funds and pay my recurring household bills, and discuss the account with bank staff. Limits I set (dollar amount, purpose, or expiration):",
        es: "Autorizo a la institución nombrada arriba a permitir que la persona autorizada: obtenga información de saldos y transacciones, reciba estados de cuenta, deposite fondos, retire fondos y pague mis facturas recurrentes del hogar, y hable con el personal del banco sobre la cuenta. Límites que establezco (monto, propósito o vencimiento):",
        ht: "Mwen otorize enstitisyon ki nonmen anwo a pou pèmèt moun otorize a: jwenn enfòmasyon sou balans ak tranzaksyon, resevwa relve, depoze lajan, retire lajan epi peye fakti kay mwen regilye yo, epi pale ak anplwaye bank lan sou kont lan. Limit mwen mete (montan, rezon, oswa dat ekspirasyon):",
      },
      lang,
    ),
    { size: 9.5 },
  );
  field(ctx, "", 1);
  field(ctx, "", 1);
  para(
    ctx,
    pick(
      {
        en: "This authorization does NOT transfer ownership of the account and does not make the authorized person a joint owner or beneficiary. It remains in effect until revoked by me in writing or until the expiration date above. NEVER write account passwords or PINs on this form.",
        es: "Esta autorización NO transfiere la propiedad de la cuenta ni convierte a la persona autorizada en cotitular o beneficiaria. Permanece vigente hasta que yo la revoque por escrito o hasta la fecha de vencimiento indicada. NUNCA escriba contraseñas ni PIN en este formulario.",
        ht: "Otorizasyon sa a PA transfere pwopriyete kont lan e li pa fè moun otorize a vin ko-pwopriyetè oswa benefisyè. Li rete an vigè jiskaske mwen revoke l alekri oswa jiska dat ekspirasyon an. PA JANM ekri modpas oswa PIN sou fòm sa a.",
      },
      lang,
    ),
    { size: 9 },
  );
  const anchor = signatureBlock(ctx, c);
  return { bytes: await ctx.doc.save(), anchor };
}

async function propertyAccess(lang: Lang) {
  const c = CHROME[lang];
  const ctx = await newDoc("Property Access Permission (blank)");
  title(
    ctx,
    pick({ en: "PROPERTY ACCESS PERMISSION", es: "PERMISO DE ACCESO A LA PROPIEDAD", ht: "PÈMISYON POU AKSÈ NAN PWOPRIYETE" }, lang),
    pick({ en: "To be presented to a landlord, property manager, storage facility, or law enforcement", es: "Para presentar al arrendador, administrador, bodega o autoridades", ht: "Pou prezante bay pwopriyetè, jesyonè, depo, oswa lapolis" }, lang),
    BANNER[lang],
  );
  field(ctx, pick({ en: "Resident / owner (full name):", es: "Residente / propietario (nombre completo):", ht: "Rezidan / pwopriyetè (non konplè):" }, lang), 0.95);
  field(ctx, pick({ en: "Property address / unit:", es: "Dirección de la propiedad / unidad:", ht: "Adrès pwopriyete / inite:" }, lang), 0.95);
  field(ctx, pick({ en: "Landlord / property manager / storage facility:", es: "Arrendador / administrador / bodega:", ht: "Pwopriyetè / jesyonè / depo:" }, lang), 0.95);
  field(ctx, pick({ en: "Authorized person (full name / relationship):", es: "Persona autorizada (nombre / parentesco):", ht: "Moun otorize (non / relasyon):" }, lang), 0.95);
  field(ctx, pick({ en: "Authorized person ID / phone:", es: "Identificación / teléfono:", ht: "ID / telefòn:" }, lang), 0.9);
  para(
    ctx,
    pick(
      {
        en: "I give the person named above permission to enter the property described above, to receive keys and access codes, to collect mail and notices, to remove and store my personal belongings, to pay rent and utilities from funds I make available, to communicate with the landlord or property manager about my lease and account, and to arrange lawful termination or continuation of the lease. Special instructions:",
        es: "Doy permiso a la persona nombrada arriba para entrar a la propiedad descrita, recibir llaves y códigos de acceso, recoger correo y avisos, retirar y guardar mis pertenencias, pagar renta y servicios con fondos que yo proporcione, comunicarse con el arrendador o administrador sobre mi contrato y cuenta, y gestionar legalmente la terminación o continuación del contrato. Instrucciones especiales:",
        ht: "Mwen bay moun ki nonmen anwo a pèmisyon pou antre nan pwopriyete a, resevwa kle ak kòd aksè, ranmase lapòs ak avi, retire epi estoke byen pèsonèl mwen, peye lwaye ak sèvis ak lajan mwen bay, kominike ak pwopriyetè oswa jesyonè a sou kontra ak kont mwen, epi regle legalman fen oswa kontinyasyon kontra a. Enstriksyon espesyal:",
      },
      lang,
    ),
    { size: 9.5 },
  );
  field(ctx, "", 1);
  field(ctx, "", 1);
  field(ctx, pick({ en: "This permission expires on:", es: "Este permiso vence el:", ht: "Pèmisyon sa a ekspire nan dat:" }, lang), 0.6);
  const anchor = signatureBlock(ctx, c);
  return { bytes: await ctx.doc.save(), anchor };
}

export const BLANK_FORM_TITLES: Record<string, Record<Lang, string>> = {
  blank_power_of_attorney: {
    en: "BLANK — Florida Durable Power of Attorney",
    es: "EN BLANCO — Poder Notarial Duradero de Florida",
    ht: "VID — Pouvwa Avoka Dirab Florid",
  },
  blank_school_pickup: {
    en: "BLANK — School Pickup Authorization",
    es: "EN BLANCO — Autorización de Recogida Escolar",
    ht: "VID — Otorizasyon pou Chache Timoun Lekòl",
  },
  blank_vehicle_impound_release: {
    en: "BLANK — Vehicle Impound Release Authorization",
    es: "EN BLANCO — Autorización para Liberar Vehículo del Depósito",
    ht: "VID — Otorizasyon pou Libere Machin nan Depo",
  },
  blank_bank_account_access: {
    en: "BLANK — Bank Account Access Authorization",
    es: "EN BLANCO — Autorización de Acceso a Cuenta Bancaria",
    ht: "VID — Otorizasyon pou Aksè Kont Labank",
  },
  blank_property_access: {
    en: "BLANK — Property Access Permission",
    es: "EN BLANCO — Permiso de Acceso a la Propiedad",
    ht: "VID — Pèmisyon pou Aksè nan Pwopriyete",
  },
};

export async function generateBlankForms(lang: Lang): Promise<BlankForm[]> {
  const specs: Array<[string, string, () => Promise<{ bytes: Uint8Array; anchor: BlankForm["anchor"] }>]> = [
    ["blank_power_of_attorney", "blank-1-florida-power-of-attorney.pdf", () => floridaPOA(lang)],
    ["blank_school_pickup", "blank-2-school-pickup-authorization.pdf", () => schoolPickup(lang)],
    ["blank_vehicle_impound_release", "blank-3-vehicle-impound-release.pdf", () => vehicleImpound(lang)],
    ["blank_bank_account_access", "blank-4-bank-account-access.pdf", () => bankAccess(lang)],
    ["blank_property_access", "blank-5-property-access-permission.pdf", () => propertyAccess(lang)],
  ];
  const out: BlankForm[] = [];
  for (const [type, filename, build] of specs) {
    const { bytes, anchor } = await build();
    out.push({ type, filename, title: BLANK_FORM_TITLES[type][lang], bytes, anchor });
  }
  return out;
}
