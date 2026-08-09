// Sentinel Readiness Packet — bilingual PDF generators.
// Pure pdf-lib (Worker-safe). Two-column layout: English left, client lang right.
// Source text: public statutory models (UPOAA, HHS HIPAA, generic templates).

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type Lang = "en" | "es" | "ht";
export type Answers = Record<string, unknown>;

interface Recipient {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN = 40;
const COL_GAP = 20;
const COL_W = (PAGE_W - MARGIN * 2 - COL_GAP) / 2;

function s(v: unknown, fallback = "____________________"): string {
  const t = (v ?? "").toString().trim();
  return t || fallback;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  yL: number;
  yR: number;
}

async function newDoc(title: string): Promise<Ctx> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setProducer("Sentinel Readiness");
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  return { doc, page, font, bold, italic, yL: PAGE_H - MARGIN, yR: PAGE_H - MARGIN };
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (Math.min(ctx.yL, ctx.yR) - needed < MARGIN + 30) {
    ctx.page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    ctx.yL = PAGE_H - MARGIN;
    ctx.yR = PAGE_H - MARGIN;
  }
}

function drawCol(
  ctx: Ctx,
  side: "L" | "R",
  text: string,
  opts: { bold?: boolean; italic?: boolean; size?: number; gap?: number } = {},
) {
  const size = opts.size ?? 10;
  const font = opts.bold ? ctx.bold : opts.italic ? ctx.italic : ctx.font;
  const x = side === "L" ? MARGIN : MARGIN + COL_W + COL_GAP;
  const lines = wrap(text, font, size, COL_W);
  ensureSpace(ctx, lines.length * (size + 2) + (opts.gap ?? 4));
  let y = side === "L" ? ctx.yL : ctx.yR;
  for (const line of lines) {
    y -= size + 2;
    ctx.page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
  }
  y -= opts.gap ?? 4;
  if (side === "L") ctx.yL = y;
  else ctx.yR = y;
}

function drawBilingual(
  ctx: Ctx,
  enText: string,
  trText: string,
  opts: { bold?: boolean; italic?: boolean; size?: number; gap?: number } = {},
) {
  // Anchor both columns to the same starting y so they stay aligned.
  const startY = Math.min(ctx.yL, ctx.yR);
  ctx.yL = startY;
  ctx.yR = startY;
  drawCol(ctx, "L", enText, opts);
  drawCol(ctx, "R", trText, opts);
  // Sync to the lower of the two so next block starts below both.
  const sync = Math.min(ctx.yL, ctx.yR);
  ctx.yL = sync;
  ctx.yR = sync;
}

function drawTitle(ctx: Ctx, en: string, tr: string) {
  ensureSpace(ctx, 40);
  const startY = Math.min(ctx.yL, ctx.yR);
  ctx.page.drawText(en, { x: MARGIN, y: startY - 18, size: 14, font: ctx.bold });
  ctx.page.drawText(tr, { x: MARGIN + COL_W + COL_GAP, y: startY - 18, size: 14, font: ctx.bold });
  ctx.page.drawLine({
    start: { x: MARGIN, y: startY - 24 },
    end: { x: PAGE_W - MARGIN, y: startY - 24 },
    thickness: 0.5,
    color: rgb(0.7, 0.4, 0.1),
  });
  ctx.yL = startY - 32;
  ctx.yR = startY - 32;
}

function drawSignatureBlock(ctx: Ctx, t: T) {
  ensureSpace(ctx, 140);
  const startY = Math.min(ctx.yL, ctx.yR) - 20;
  ctx.yL = startY;
  ctx.yR = startY;
  drawBilingual(ctx, "SIGNATURE", t.signature, { bold: true, size: 11 });
  drawBilingual(ctx, "X _______________________________", "X _______________________________");
  drawBilingual(ctx, `Print name: __________________`, `${t.printName}: __________________`);
  drawBilingual(ctx, "Date: ______________", `${t.date}: ______________`);
  drawBilingual(ctx, "State: ______________", `${t.state}: ______________`);

  ensureSpace(ctx, 110);
  const ny = Math.min(ctx.yL, ctx.yR) - 12;
  ctx.yL = ny;
  ctx.yR = ny;
  drawBilingual(ctx, "NOTARY ACKNOWLEDGMENT", t.notary, { bold: true, size: 11 });
  drawBilingual(
    ctx,
    "State of _________ County of _________. On this date _________, before me personally appeared the above-named person who proved to me on the basis of satisfactory evidence to be the individual whose name is signed above, and acknowledged that they executed the same.",
    t.notaryBody,
    { size: 9 },
  );
  drawBilingual(ctx, "Notary signature: _______________________", `${t.notarySig}: _______________________`);
  drawBilingual(ctx, "Notary seal:", t.notarySeal);
}

function drawDisclaimer(ctx: Ctx, t: T) {
  ensureSpace(ctx, 60);
  const sy = Math.min(ctx.yL, ctx.yR) - 18;
  ctx.yL = sy;
  ctx.yR = sy;
  drawBilingual(ctx, t.disclaimerEn, t.disclaimer, { italic: true, size: 8 });
}

// Translation strings per language (chrome only — body text is per-doc).
interface T {
  signature: string;
  printName: string;
  date: string;
  state: string;
  notary: string;
  notaryBody: string;
  notarySig: string;
  notarySeal: string;
  disclaimerEn: string;
  disclaimer: string;
}

const T_EN: T = {
  signature: "SIGNATURE",
  printName: "Print name",
  date: "Date",
  state: "State",
  notary: "NOTARY ACKNOWLEDGMENT",
  notaryBody:
    "State of _________ County of _________. On this date _________, before me personally appeared the above-named person who proved to me on the basis of satisfactory evidence to be the individual whose name is signed above, and acknowledged that they executed the same.",
  notarySig: "Notary signature",
  notarySeal: "Notary seal:",
  disclaimerEn:
    "Sentinel Readiness generates documents from public statutory models. Sentinel is not a law firm. Power of attorney, guardianship, and HIPAA authorizations should be reviewed by a licensed attorney in your state and notarized before they take effect.",
  disclaimer:
    "Sentinel Readiness generates documents from public statutory models. Sentinel is not a law firm. Power of attorney, guardianship, and HIPAA authorizations should be reviewed by a licensed attorney in your state and notarized before they take effect.",
};

const T_ES: T = {
  signature: "FIRMA",
  printName: "Nombre en letra de imprenta",
  date: "Fecha",
  state: "Estado",
  notary: "RECONOCIMIENTO NOTARIAL",
  notaryBody:
    "Estado de _________ Condado de _________. En esta fecha _________, ante mí compareció personalmente la persona arriba nombrada, quien me demostró con base en pruebas satisfactorias ser la persona cuyo nombre aparece firmado arriba, y reconoció haberlo firmado.",
  notarySig: "Firma del notario",
  notarySeal: "Sello notarial:",
  disclaimerEn: T_EN.disclaimerEn,
  disclaimer:
    "Sentinel Readiness genera documentos a partir de modelos legales públicos. Sentinel no es un bufete de abogados. El poder notarial, la tutela y las autorizaciones HIPAA deben ser revisados por un abogado con licencia en su estado y notarizados antes de surtir efecto.",
};

const T_HT: T = {
  signature: "SIYATI",
  printName: "Ekri non",
  date: "Dat",
  state: "Eta",
  notary: "REKONÈSANS NOTÈ",
  notaryBody:
    "Eta _________ Konte _________. Nan dat sa a _________, devan mwen, parèt pèsonèlman moun ki gen non ki anwo a, ki te pwouve mwen pa prèv satisfezan ke se li ki moun ki gen non ki siyen anwo a, epi ki rekonèt ke li te egzekite menm dokiman an.",
  notarySig: "Siyati notè",
  notarySeal: "So notè:",
  disclaimerEn: T_EN.disclaimerEn,
  disclaimer:
    "Sentinel Readiness pwodui dokiman ki soti nan modèl legal piblik. Sentinel se pa yon kabinè avoka. Pouvwa notè, gad timoun, ak otorizasyon HIPAA dwe revize pa yon avoka ki gen lisans nan eta ou epi notaryze anvan yo pran efè.",
};

function getT(lang: Lang): T {
  return lang === "es" ? T_ES : lang === "ht" ? T_HT : T_EN;
}

// ====================== DOCUMENT RENDERERS ======================

// 1. POWER OF ATTORNEY (UPOAA-based general durable POA)
async function renderPOA(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("Durable Power of Attorney");
  const t = getT(lang);
  const principal = s(answers.full_legal_name ?? answers.full_name ?? answers.principal_name);
  const agent = s(recipient.name);
  const agentRel = s(recipient.relationship);

  drawTitle(ctx, "DURABLE POWER OF ATTORNEY", lang === "es" ? "PODER NOTARIAL DURADERO" : lang === "ht" ? "POUVWA NOTÈ DIRAB" : "DURABLE POWER OF ATTORNEY");

  drawBilingual(
    ctx,
    `I, ${principal}, of legal age and sound mind ("Principal"), do hereby appoint ${agent} (${agentRel}) ("Agent") as my attorney-in-fact to act on my behalf.`,
    lang === "es"
      ? `Yo, ${principal}, mayor de edad y en pleno uso de mis facultades ("Poderdante"), por la presente nombro a ${agent} (${agentRel}) ("Apoderado") como mi apoderado para actuar en mi nombre.`
      : lang === "ht"
        ? `Mwen menm, ${principal}, gen laj legal e mwen gen tout fakilte mwen ("Mandè"), pa dokiman sa a, mwen nonmen ${agent} (${agentRel}) ("Manda") kòm reprezantan legal mwen pou aji nan non mwen.`
        : `I, ${principal}, of legal age and sound mind ("Principal"), do hereby appoint ${agent} (${agentRel}) ("Agent") as my attorney-in-fact to act on my behalf.`,
  );

  drawBilingual(
    ctx,
    "POWERS GRANTED. My Agent has authority to: (a) handle real property and personal property transactions; (b) operate banking, financial, and tax matters; (c) collect and pay debts; (d) access my safe-deposit box; (e) handle insurance and retirement benefits; (f) manage business operations; (g) handle claims and litigation on my behalf; (h) make gifts to my family for support; (i) handle government benefits and immigration matters; (j) take all other lawful acts a competent adult could take regarding my property and affairs.",
    lang === "es"
      ? "PODERES OTORGADOS. Mi Apoderado tiene autoridad para: (a) manejar transacciones de bienes raíces y bienes personales; (b) operar asuntos bancarios, financieros y fiscales; (c) cobrar y pagar deudas; (d) acceder a mi caja de seguridad; (e) manejar seguros y beneficios de jubilación; (f) administrar operaciones comerciales; (g) manejar reclamos y litigios en mi nombre; (h) hacer regalos a mi familia para su sustento; (i) manejar beneficios gubernamentales y asuntos de inmigración; (j) realizar todos los demás actos legales que un adulto competente podría tomar respecto a mis bienes y asuntos."
      : lang === "ht"
        ? "POUVWA AKÒDE. Manda mwen gen otorite pou: (a) jere tranzaksyon pwopriyete imobilyè ak pèsonèl; (b) opere zafè labank, finansye, ak taks; (c) kolekte ak peye dèt; (d) gen aksè a kòfrefò mwen; (e) jere asirans ak benefis retrèt; (f) jere operasyon biznis; (g) jere reklamasyon ak litij nan non mwen; (h) bay fanmi mwen kado pou sipò; (i) jere benefis gouvènman ak zafè imigrasyon; (j) pran tout lòt aksyon legal ke yon granmoun konpetan ta ka pran konsènan pwopriyete ak zafè mwen yo."
        : "POWERS GRANTED. (See English column.)",
    { size: 9 },
  );

  drawBilingual(
    ctx,
    "DURABILITY. This power of attorney is DURABLE and shall not be affected by my subsequent incapacity, including detention or unavailability.",
    lang === "es"
      ? "DURABILIDAD. Este poder notarial es DURADERO y no se verá afectado por mi posterior incapacidad, incluida la detención o no disponibilidad."
      : lang === "ht"
        ? "DIRAB. Pouvwa notè sa a se DIRAB e li pa pral afekte pa enkapasite m apre, ki gen ladan detansyon oswa ke m pa disponib."
        : "",
    { bold: true, size: 9 },
  );

  drawBilingual(
    ctx,
    `EFFECTIVE DATE. This power becomes effective immediately upon signing and notarization, and continues until revoked in writing or upon my death.`,
    lang === "es"
      ? `FECHA DE VIGENCIA. Este poder entra en vigor inmediatamente al ser firmado y notariado, y continúa hasta que sea revocado por escrito o hasta mi fallecimiento.`
      : lang === "ht"
        ? `DAT EFEKTIF. Pouvwa sa a antre an vigè imedyatman lè li siyen ak notaryze, epi li kontinye jiskaske li revoke alekri oswa lè m mouri.`
        : "",
    { size: 9 },
  );

  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 2. STANDBY GUARDIANSHIP
async function renderGuardianship(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("Standby Guardianship Designation");
  const t = getT(lang);
  const parent = s(answers.full_legal_name ?? answers.full_name);
  const guardian = s(recipient.name);
  const childrenList = Array.isArray(answers.children) ? (answers.children as Array<{ name?: string; dob?: string }>) : [];
  const childrenStr = childrenList.length
    ? childrenList.map((c) => `${s(c.name)} (DOB ${s(c.dob)})`).join("; ")
    : "(see attached list)";

  drawTitle(
    ctx,
    "STANDBY GUARDIANSHIP DESIGNATION",
    lang === "es" ? "DESIGNACIÓN DE TUTELA EN ESPERA" : lang === "ht" ? "DEZIYASYON GAD AN ATANT" : "STANDBY GUARDIANSHIP DESIGNATION",
  );

  drawBilingual(
    ctx,
    `I, ${parent}, parent and legal custodian of the minor child(ren) listed below, hereby designate ${guardian} as standby guardian to take physical custody and make all parental decisions for my child(ren) in the event I am detained, hospitalized, or otherwise unable to care for them.`,
    lang === "es"
      ? `Yo, ${parent}, padre/madre y custodio legal del/los menor(es) listado(s) a continuación, por la presente designo a ${guardian} como tutor en espera para tomar la custodia física y todas las decisiones parentales por mi(s) hijo(s) en caso de que yo sea detenido(a), hospitalizado(a) o de otra manera incapaz de cuidarlos.`
      : lang === "ht"
        ? `Mwen menm, ${parent}, paran ak gadyen legal pitit minè ki nan lis anba a, mwen deziyen ${guardian} kòm gadyen an atant pou pran gad fizik ak fè tout desizyon paran pou pitit mwen yo si yo ta detni m, mwen lopital, oswa nenpòt lòt fason mwen pa kapab pran swen yo.`
        : "",
  );

  drawBilingual(ctx, `CHILDREN: ${childrenStr}`, `${lang === "es" ? "MENORES" : lang === "ht" ? "TIMOUN" : "CHILDREN"}: ${childrenStr}`, { bold: true, size: 9 });

  drawBilingual(
    ctx,
    "GUARDIAN AUTHORITY: enroll/withdraw from school, consent to medical care, sign permission slips, travel domestically and internationally with the child, apply for benefits, and otherwise exercise full parental authority.",
    lang === "es"
      ? "AUTORIDAD DEL TUTOR: matricular/retirar de la escuela, consentir atención médica, firmar permisos, viajar nacional e internacionalmente con el menor, solicitar beneficios y, en general, ejercer la autoridad parental completa."
      : lang === "ht"
        ? "OTORITE GADYEN AN: enskri/retire nan lekòl, konsanti pou swen medikal, siyen pèmi, vwayaje nan peyi ak entènasyonal avèk timoun nan, aplike pou benefis, epi an jeneral egzèse otorite paran konplè."
        : "",
    { size: 9 },
  );

  drawBilingual(
    ctx,
    "TRIGGERING EVENT: This designation activates upon (i) my detention by any law enforcement or immigration authority; (ii) hospitalization rendering me unable to care for my child; or (iii) my written notice of activation.",
    lang === "es"
      ? "EVENTO ACTIVADOR: Esta designación se activa al (i) ser detenido(a) por cualquier autoridad de seguridad o inmigración; (ii) hospitalización que me impida cuidar a mi hijo; o (iii) aviso escrito mío de activación."
      : lang === "ht"
        ? "EVÈNMAN AKTIVATÈ: Deziyasyon sa a aktive lè (i) yo detni mwen pa nenpòt lapolis oswa otorite imigrasyon; (ii) lopital ki anpeche m pran swen pitit mwen; oswa (iii) avi alekri mwen pou aktivasyon."
        : "",
    { size: 9 },
  );

  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 3. SCHOOL PICKUP AUTHORIZATION
async function renderSchoolPickup(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("School Pickup Authorization");
  const t = getT(lang);
  const parent = s(answers.full_legal_name ?? answers.full_name);
  const auth = s(recipient.name);
  const childrenList = Array.isArray(answers.children) ? (answers.children as Array<{ name?: string; school?: string }>) : [];
  drawTitle(ctx, "SCHOOL PICKUP AUTHORIZATION", lang === "es" ? "AUTORIZACIÓN PARA RECOGER DE LA ESCUELA" : lang === "ht" ? "OTORIZASYON POU CHACHE NAN LEKÒL" : "SCHOOL PICKUP AUTHORIZATION");
  drawBilingual(
    ctx,
    `To the school administration: I, ${parent}, parent/guardian, hereby authorize ${auth} (phone ${s(recipient.phone)}) to pick up my child(ren) from school at any time, with or without prior notice from me, and to receive school records and emergency notifications.`,
    lang === "es"
      ? `A la administración escolar: Yo, ${parent}, padre/madre/tutor, por la presente autorizo a ${auth} (teléfono ${s(recipient.phone)}) a recoger a mi(s) hijo(s) de la escuela en cualquier momento, con o sin previo aviso, y a recibir expedientes escolares y notificaciones de emergencia.`
      : lang === "ht"
        ? `Pou administrasyon lekòl la: Mwen menm, ${parent}, paran/gadyen, mwen otorize ${auth} (telefòn ${s(recipient.phone)}) pou vin chache pitit mwen yo lekòl nenpòt lè, avèk oswa san avi mwen, epi pou resevwa dosye lekòl ak notifikasyon ijans.`
        : "",
  );
  if (childrenList.length) {
    drawBilingual(
      ctx,
      `Children & schools: ${childrenList.map((c) => `${s(c.name)} — ${s(c.school)}`).join("; ")}`,
      `${lang === "es" ? "Menores y escuelas" : lang === "ht" ? "Timoun ak lekòl" : "Children & schools"}: ${childrenList.map((c) => `${s(c.name)} — ${s(c.school)}`).join("; ")}`,
      { size: 9 },
    );
  }
  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 4. HIPAA AUTHORIZATION (HHS model)
async function renderHIPAA(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("HIPAA Authorization");
  const t = getT(lang);
  const patient = s(answers.full_legal_name ?? answers.full_name);
  const rep = s(recipient.name);
  drawTitle(ctx, "HIPAA AUTHORIZATION FOR RELEASE OF MEDICAL INFORMATION", lang === "es" ? "AUTORIZACIÓN HIPAA PARA DIVULGACIÓN DE INFORMACIÓN MÉDICA" : lang === "ht" ? "OTORIZASYON HIPAA POU LIBÈRE ENFÒMASYON MEDIKAL" : "HIPAA AUTHORIZATION");
  drawBilingual(
    ctx,
    `Patient: ${patient}. I authorize all healthcare providers to release any and all of my protected health information (medical records, treatment notes, billing, prescriptions, mental health, substance abuse, HIV/AIDS) to ${rep} (${s(recipient.relationship)}, phone ${s(recipient.phone)}, email ${s(recipient.email)}).`,
    lang === "es"
      ? `Paciente: ${patient}. Autorizo a todos los proveedores de atención médica a divulgar toda mi información de salud protegida (expedientes médicos, notas de tratamiento, facturación, recetas, salud mental, abuso de sustancias, VIH/SIDA) a ${rep} (${s(recipient.relationship)}, teléfono ${s(recipient.phone)}, correo ${s(recipient.email)}).`
      : lang === "ht"
        ? `Pasyan: ${patient}. Mwen otorize tout founisè swen sante yo pou yo divilge tout enfòmasyon sante pwoteje mwen (dosye medikal, nòt tretman, fakti, preskripsyon, sante mantal, abi sibstans, VIH/SIDA) bay ${rep} (${s(recipient.relationship)}, telefòn ${s(recipient.phone)}, imèl ${s(recipient.email)}).`
        : "",
  );
  drawBilingual(
    ctx,
    "PURPOSE: family coordination of care during detention or unavailability. EXPIRATION: this authorization expires 2 years from signing date or upon written revocation. RIGHT TO REVOKE: I may revoke this authorization at any time in writing.",
    lang === "es"
      ? "PROPÓSITO: coordinación familiar de atención durante detención o no disponibilidad. CADUCIDAD: esta autorización caduca 2 años desde la firma o al revocarse por escrito. DERECHO A REVOCAR: puedo revocar esta autorización en cualquier momento por escrito."
      : lang === "ht"
        ? "BI: koòdinasyon swen fanmi pandan detansyon oswa lè m pa disponib. EKSPIRASYON: otorizasyon sa a ekspire 2 ane apre dat siyati oswa lè li revoke alekri. DWA POU REVOKE: mwen ka revoke otorizasyon sa a nenpòt lè alekri."
        : "",
    { size: 9 },
  );
  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 5. FINANCIAL INVENTORY
async function renderFinancialInventory(answers: Answers, lang: Lang): Promise<Uint8Array> {
  const ctx = await newDoc("Financial Inventory");
  const t = getT(lang);
  drawTitle(ctx, "FINANCIAL INVENTORY", lang === "es" ? "INVENTARIO FINANCIERO" : lang === "ht" ? "ENVANTÈ FINANSYE" : "FINANCIAL INVENTORY");
  const accounts = Array.isArray(answers.bank_accounts) ? (answers.bank_accounts as Array<Record<string, unknown>>) : [];
  drawBilingual(
    ctx,
    "Bank accounts, debit/credit cards, recurring bills, and assets the family will need to access immediately.",
    lang === "es"
      ? "Cuentas bancarias, tarjetas de débito/crédito, facturas recurrentes y activos a los que la familia necesitará acceder de inmediato."
      : lang === "ht"
        ? "Kont labank, kat debi/kredi, fakti regilye, ak byen ke fanmi an pral bezwen aksè imedyatman."
        : "",
    { italic: true, size: 9 },
  );
  if (!accounts.length) {
    drawBilingual(ctx, "(no accounts listed)", lang === "es" ? "(no hay cuentas listadas)" : lang === "ht" ? "(pa gen kont ki nan lis)" : "(none)", { italic: true });
  } else {
    accounts.forEach((a, i) => {
      const line = `${i + 1}. ${s(a.bank)} — ${s(a.type)} — ****${s(a.last4, "____")} — ${s(a.notes, "")}`;
      drawBilingual(ctx, line, line, { size: 9 });
    });
  }
  drawBilingual(ctx, `Monthly recurring bills: ${s(answers.recurring_bills, "(none listed)")}`, `${lang === "es" ? "Facturas mensuales recurrentes" : lang === "ht" ? "Fakti chak mwa" : "Monthly bills"}: ${s(answers.recurring_bills, "(none listed)")}`, { size: 9 });
  drawBilingual(ctx, `Vehicles & property: ${s(answers.vehicles_property, "(none listed)")}`, `${lang === "es" ? "Vehículos y propiedad" : lang === "ht" ? "Veyikil ak pwopriyete" : "Vehicles & property"}: ${s(answers.vehicles_property, "(none listed)")}`, { size: 9 });
  drawBilingual(ctx, `Lease / mortgage: ${s(answers.lease_mortgage, "(none listed)")}`, `${lang === "es" ? "Arrendamiento / hipoteca" : lang === "ht" ? "Lwaye / ipotèk" : "Lease / mortgage"}: ${s(answers.lease_mortgage, "(none listed)")}`, { size: 9 });
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 6. EMERGENCY CONTACT TREE
async function renderContactTree(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("Emergency Contact Tree");
  const t = getT(lang);
  drawTitle(ctx, "EMERGENCY CONTACT TREE", lang === "es" ? "ÁRBOL DE CONTACTOS DE EMERGENCIA" : lang === "ht" ? "PYE BWA KONTAK IJANS" : "EMERGENCY CONTACT TREE");
  drawBilingual(ctx, `PRIMARY (designated): ${s(recipient.name)} — ${s(recipient.phone)} — ${s(recipient.email)}`, `${lang === "es" ? "PRINCIPAL (designado)" : lang === "ht" ? "PRENSIPAL (deziyen)" : "PRIMARY"}: ${s(recipient.name)} — ${s(recipient.phone)}`, { bold: true });
  const contacts = Array.isArray(answers.emergency_contacts) ? (answers.emergency_contacts as Array<Record<string, unknown>>) : [];
  contacts.forEach((c, i) => {
    const line = `${i + 2}. ${s(c.name)} (${s(c.relationship)}) — ${s(c.phone)} — ${s(c.email, "")}`;
    drawBilingual(ctx, line, line, { size: 10 });
  });
  drawBilingual(ctx, `Attorney: ${s(answers.attorney_contact, "(none)")}`, `${lang === "es" ? "Abogado" : lang === "ht" ? "Avoka" : "Attorney"}: ${s(answers.attorney_contact, "(none)")}`, { size: 9 });
  drawBilingual(ctx, `Consulate: ${s(answers.consulate_contact, "(none)")}`, `${lang === "es" ? "Consulado" : lang === "ht" ? "Konsila" : "Consulate"}: ${s(answers.consulate_contact, "(none)")}`, { size: 9 });
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 7. CHILDREN'S INFO SHEET
async function renderChildrenInfo(answers: Answers, lang: Lang): Promise<Uint8Array> {
  const ctx = await newDoc("Children's Information");
  const t = getT(lang);
  drawTitle(ctx, "CHILDREN'S INFORMATION", lang === "es" ? "INFORMACIÓN DE LOS MENORES" : lang === "ht" ? "ENFÒMASYON SOU TIMOUN" : "CHILDREN'S INFORMATION");
  const kids = Array.isArray(answers.children) ? (answers.children as Array<Record<string, unknown>>) : [];
  if (!kids.length) drawBilingual(ctx, "(no children listed)", lang === "es" ? "(no hay menores listados)" : lang === "ht" ? "(pa gen timoun)" : "(none)", { italic: true });
  kids.forEach((c, i) => {
    drawBilingual(ctx, `Child ${i + 1}: ${s(c.name)}`, `${lang === "es" ? "Menor" : lang === "ht" ? "Timoun" : "Child"} ${i + 1}: ${s(c.name)}`, { bold: true });
    drawBilingual(ctx, `DOB: ${s(c.dob)}  |  School: ${s(c.school)}  |  SSN/A#: ${s(c.id_number)}`, `${lang === "es" ? "Fecha nac." : lang === "ht" ? "Dat nesans" : "DOB"}: ${s(c.dob)}  |  ${lang === "es" ? "Escuela" : lang === "ht" ? "Lekòl" : "School"}: ${s(c.school)}`, { size: 9 });
    drawBilingual(ctx, `Doctor: ${s(c.doctor)}  |  Allergies/meds: ${s(c.medical, "(none)")}`, `${lang === "es" ? "Médico" : lang === "ht" ? "Doktè" : "Doctor"}: ${s(c.doctor)}  |  ${lang === "es" ? "Alergias/medicinas" : lang === "ht" ? "Alèji/medikaman" : "Allergies/meds"}: ${s(c.medical, "(none)")}`, { size: 9, gap: 8 });
  });
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// 8. DOCUMENT LOCATOR
async function renderDocumentLocator(answers: Answers, lang: Lang): Promise<Uint8Array> {
  const ctx = await newDoc("Document Locator");
  const t = getT(lang);
  drawTitle(ctx, "DOCUMENT LOCATOR MAP", lang === "es" ? "MAPA DE UBICACIÓN DE DOCUMENTOS" : lang === "ht" ? "KAT KOTE DOKIMAN YO YE" : "DOCUMENT LOCATOR");
  drawBilingual(ctx, "Where to find originals of important documents:", lang === "es" ? "Dónde encontrar los originales de los documentos importantes:" : lang === "ht" ? "Kote pou jwenn dokiman enpòtan yo:" : "", { italic: true, size: 9 });
  const items: Array<[string, string, string]> = [
    ["Passport(s)", "Pasaporte(s)", "Paspò"],
    ["Birth certificates", "Actas de nacimiento", "Sètifika nesans"],
    ["Marriage certificate", "Acta de matrimonio", "Sètifika maryaj"],
    ["A-number / immigration file", "Número A / archivo de inmigración", "Nimewo A / dosye imigrasyon"],
    ["Social Security card", "Tarjeta del Seguro Social", "Kat Sekirite Sosyal"],
    ["Lease / deed / title", "Contrato / escritura / título", "Lwaye / kontra / tit"],
    ["Vehicle title & registration", "Título y registro del vehículo", "Tit ak enskripsyon machin"],
    ["Bank statements", "Estados de cuenta", "Deklarasyon labank"],
    ["Tax returns", "Declaraciones de impuestos", "Deklarasyon enpo"],
  ];
  const map = (answers.document_locations ?? {}) as Record<string, string>;
  items.forEach(([en, es, ht]) => {
    const where = s(map[en], "____________________");
    drawBilingual(ctx, `${en}: ${where}`, `${lang === "es" ? es : lang === "ht" ? ht : en}: ${where}`, { size: 10 });
  });
  drawBilingual(ctx, `Letter to children (optional): ${s(answers.letter_to_children, "(see attached)")}`, `${lang === "es" ? "Carta a los hijos" : lang === "ht" ? "Lèt pou timoun yo" : "Letter to children"}: ${s(answers.letter_to_children, "")}`, { italic: true, size: 9 });
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

async function renderLandlordAuthorization(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("Landlord and Property Access Authorization");
  const t = getT(lang);
  const principal = s(answers.full_legal_name ?? answers.full_name);
  const agent = s(recipient.name);
  drawTitle(ctx, "LANDLORD / PROPERTY ACCESS AUTHORIZATION", lang === "es" ? "AUTORIZACIÓN PARA ARRENDADOR Y ACCESO A LA PROPIEDAD" : lang === "ht" ? "OTORIZASYON POU PWOPRIYETÈ AK AKSÈ PWOPRIYETE" : "LANDLORD / PROPERTY ACCESS AUTHORIZATION");
  drawBilingual(ctx,
    `I, ${principal}, authorize ${agent} to communicate with my landlord, obtain account and lease information, pay rent and utilities from funds I make available, enter my residence, secure my belongings, receive notices, and arrange lawful removal or storage of my personal property while I am detained or unavailable.`,
    lang === "es" ? `Yo, ${principal}, autorizo a ${agent} a comunicarse con mi arrendador, obtener información de la cuenta y contrato, pagar alquiler y servicios con fondos que yo proporcione, entrar a mi residencia, proteger mis pertenencias, recibir avisos y organizar legalmente el retiro o almacenamiento de mis bienes mientras esté detenido o no disponible.` : lang === "ht" ? `Mwen menm, ${principal}, otorize ${agent} pou kominike ak pwopriyetè kay mwen, jwenn enfòmasyon sou kont ak kontra lwaye, peye lwaye ak sèvis ak lajan mwen bay, antre lakay mwen, pwoteje byen mwen, resevwa avi, epi òganize retire oswa depoze byen mwen legalman pandan yo detni mwen oswa mwen pa disponib.` : "");
  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

async function renderVehicleRetrieval(answers: Answers, lang: Lang, recipient: Recipient): Promise<Uint8Array> {
  const ctx = await newDoc("Vehicle Retrieval Authorization");
  const t = getT(lang);
  const principal = s(answers.full_legal_name ?? answers.full_name);
  const agent = s(recipient.name);
  drawTitle(ctx, "VEHICLE RETRIEVAL / IMPOUND AUTHORIZATION", lang === "es" ? "AUTORIZACIÓN PARA RETIRAR VEHÍCULO DEL DEPÓSITO" : lang === "ht" ? "OTORIZASYON POU REKIPERE MACHIN NAN DEPO" : "VEHICLE RETRIEVAL AUTHORIZATION");
  drawBilingual(ctx,
    `I, ${principal}, authorize ${agent} to locate, retrieve, receive, tow, store, and take possession of any vehicle owned or lawfully used by me, including from a police or private impound lot, and to receive property from the vehicle. Vehicle: ${s(answers.vehicle_description)}. VIN / plate: ${s(answers.vehicle_vin_plate)}.`,
    lang === "es" ? `Yo, ${principal}, autorizo a ${agent} a localizar, retirar, recibir, remolcar, almacenar y tomar posesión de cualquier vehículo de mi propiedad o uso legal, incluso de un depósito policial o privado, y recibir los bienes dentro del vehículo. Vehículo: ${s(answers.vehicle_description)}. VIN / placa: ${s(answers.vehicle_vin_plate)}.` : lang === "ht" ? `Mwen menm, ${principal}, otorize ${agent} pou lokalize, rekipere, resevwa, remoke, estoke epi pran posesyon nenpòt machin mwen posede oswa itilize legalman, menm nan depo lapolis oswa prive, epi resevwa byen ki nan machin nan. Machin: ${s(answers.vehicle_description)}. VIN / plak: ${s(answers.vehicle_vin_plate)}.` : "");
  drawSignatureBlock(ctx, t);
  drawDisclaimer(ctx, t);
  return await ctx.doc.save();
}

// ====================== PUBLIC API ======================

export interface GeneratedDoc {
  filename: string;
  bytes: Uint8Array;
}

export async function generateAllDocs(answers: Answers, lang: Lang, recipient: Recipient): Promise<GeneratedDoc[]> {
  return [
    { filename: "1-power-of-attorney.pdf", bytes: await renderPOA(answers, lang, recipient) },
    { filename: "2-standby-guardianship.pdf", bytes: await renderGuardianship(answers, lang, recipient) },
    { filename: "3-school-pickup.pdf", bytes: await renderSchoolPickup(answers, lang, recipient) },
    { filename: "4-hipaa-authorization.pdf", bytes: await renderHIPAA(answers, lang, recipient) },
    { filename: "5-financial-inventory.pdf", bytes: await renderFinancialInventory(answers, lang) },
    { filename: "6-emergency-contact-tree.pdf", bytes: await renderContactTree(answers, lang, recipient) },
    { filename: "7-childrens-info.pdf", bytes: await renderChildrenInfo(answers, lang) },
    { filename: "8-document-locator.pdf", bytes: await renderDocumentLocator(answers, lang) },
    { filename: "9-landlord-authorization.pdf", bytes: await renderLandlordAuthorization(answers, lang, recipient) },
    { filename: "10-vehicle-retrieval.pdf", bytes: await renderVehicleRetrieval(answers, lang, recipient) },
  ];
}
