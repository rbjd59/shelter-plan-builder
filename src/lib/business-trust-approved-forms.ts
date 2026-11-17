import type { BusinessTrustAttorneyTerms } from "./business-trust";
import type {
  BusinessTrustFormValues,
  BusinessTrustLanguage,
  PacketSection,
} from "./business-trust-forms";

export function businessTrustApprovedPdfCopy(language: BusinessTrustLanguage) {
  if (language === "es") {
    return {
      title: "DO NOT FORGET YOUR BUSINESS — PAQUETE APROBADO DEL FIDEICOMISO DEL NEGOCIO",
      notice: "COPIA PARA FIRMAS APROBADA POR EL ABOGADO — COMPLETE LAS FIRMAS EXIGIDAS",
      page: "Página",
      creationNew: `El otorgante crea el fideicomiso identificado en este paquete, con efecto en la fecha aprobada.`,
      creationExisting:
        "El abogado aprobó usar el fideicomiso de la casa identificado para el interés del negocio descrito. Este paquete se lee junto con ese fideicomiso y cualquier enmienda firmada; no sustituye el documento existente.",
    };
  }
  if (language === "ht") {
    return {
      title: "DO NOT FORGET YOUR BUSINESS — PAKÈ FIDISI BIZNIS AVOKA A APROUVE",
      notice: "KOPI POU SIYEN AVOKA A APROUVE — RANPLI TOUT SIYATI YO MANDE",
      page: "Paj",
      creationNew:
        "Moun ki kreye fidisi a kreye fidisi ki nan pakè sa a, apati dat avoka a apwouve a.",
      creationExisting:
        "Avoka a apwouve sèvi ak fidisi kay ki idantifye a pou pataj biznis ki dekri a. Pakè sa a li ansanm ak fidisi sa a ak nenpòt amandman siyen; li pa ranplase dokiman ki la deja a.",
    };
  }
  return {
    title: "DO NOT FORGET YOUR BUSINESS — ATTORNEY-APPROVED BUSINESS TRUST PACKET",
    notice: "ATTORNEY-APPROVED EXECUTION COPY — COMPLETE ALL REQUIRED SIGNATURES",
    page: "Page",
    creationNew:
      "The Settlor establishes the trust identified in this packet on the approved effective date.",
    creationExisting:
      "The attorney approved use of the identified home trust for the described business interest. Read this packet with that trust and every signed amendment; this packet does not replace the existing instrument.",
  };
}

export function businessTrustApprovedFormSections(
  language: BusinessTrustLanguage,
  v: BusinessTrustFormValues,
  t: BusinessTrustAttorneyTerms,
  approvedAt: string,
): PacketSection[] {
  const c = businessTrustApprovedPdfCopy(language);
  const creation = v.trustMode === "existing_home" ? c.creationExisting : c.creationNew;
  if (language === "es") {
    return [
      {
        heading: "1. Registro de aprobación del abogado",
        lines: [
          `Cliente y otorgante: ${v.clientName}`,
          `Negocio: ${v.businessName} · Tipo actual: ${v.entity}`,
          `Fideicomiso: ${v.trustName}`,
          `Fiduciario: ${v.trustee} · Fiduciario suplente: ${v.backupTrustee}`,
          `Fecha de efecto: ${t.effectiveDate} · Ley que rige: ${t.governingLaw}`,
          `Abogado que revisó y aprobó: ${t.reviewerName} · ${t.reviewerBarNumber}`,
          `Fecha y hora de aprobación registrada: ${approvedAt}`,
          "Esta aprobación se limita a los datos del cliente y los términos guardados en esta versión. Cualquier cambio necesita una nueva versión revisada.",
        ],
      },
      {
        heading: "2. Acuerdo de fideicomiso revocable del negocio",
        pageBreak: true,
        lines: [
          `2.1 Creación. ${creation}`,
          "2.2 Propósito. El fideicomiso tendrá los intereses del negocio transferidos válidamente y apoyará la administración, los registros y los contratos. No puede usarse para esconder bienes, evitar deudas, desobedecer una orden judicial ni quitar derechos a otra persona.",
          "2.3 Bienes. Solo los bienes e intereses descritos en el Anexo A y transferidos por instrumentos válidos y completos serán bienes del fideicomiso. Una lista por sí sola no transfiere propiedad.",
          `2.4 Cambios y revocación. ${t.amendmentAndRevocation}`,
          `2.5 Beneficiarios. Las personas e instrucciones aprobadas aparecen en el Anexo B: ${v.beneficiaries}.`,
          `2.6 Distribuciones. ${t.distributions}`,
          `2.7 Poderes del fiduciario. ${t.trusteePowers}`,
          "2.8 Límites. El fiduciario debe actuar con lealtad, separar el dinero, evitar beneficios no autorizados y conservar registros. Ninguna venta, préstamo o comisión queda autorizada fuera de los poderes escritos y los permisos exigidos.",
          "2.9 Cuentas y registros. El fiduciario conservará facturas, recibos, contratos, registros de clientes y comprobantes, y dará los informes exigidos por la ley.",
          `2.10 Incapacidad y sucesión. ${t.incapacityAndSuccession}`,
          `2.11 Pago y gastos. ${t.compensationAndExpenses}`,
          "2.12 Compañía e impuestos. La corporación, el EIN y las cuentas necesitan trámites separados. Un profesional de impuestos debe revisar los efectos fiscales y las reglas para dueños extranjeros.",
          `2.13 Ley y deudas. Rige la ley aprobada: ${t.governingLaw}. El fideicomiso no borra deudas, impuestos, contratos ni reclamos y no garantiza protección de bienes.`,
        ],
      },
      {
        heading: "3. Anexo A — Intereses y bienes del negocio",
        pageBreak: true,
        lines: [
          `Negocio: ${v.businessName}`,
          `Intereses y bienes aprobados: ${v.assets}`,
          `Requisitos de transferencia aprobados: ${t.transferTerms}`,
          "Cada transferencia debe identificar el bien, el dueño actual, la parte transferida y el instrumento exigido. Deben revisarse deudas, gravámenes, contratos, impuestos y permisos de terceros.",
          "Dueño actual / parte / certificado o registro: ____________________________________",
          "Instrumento separado, fecha y firmante: ____________________________________________",
        ],
      },
      {
        heading: "4. Anexo B — Beneficiarios",
        pageBreak: true,
        lines: [
          `Personas e instrucciones aprobadas: ${v.beneficiaries}`,
          `Distribuciones y condiciones: ${t.distributions}`,
          "Las disposiciones aprobadas controlan las partes, condiciones, beneficiarios suplentes y protección de menores que se hayan incluido.",
        ],
      },
      {
        heading: "5. Cesión del interés del negocio",
        pageBreak: true,
        lines: [
          `Por la contraprestación indicada en los documentos de transferencia, ${v.clientName} cede a ${v.trustee}, como fiduciario de ${v.trustName}, únicamente los intereses descritos en el Anexo A, con efecto solo cuando se cumplan estos requisitos: ${t.transferTerms}`,
          "Esta cesión no transfiere bienes omitidos ni elimina deudas, gravámenes, impuestos, reclamos o derechos de terceros.",
          "Firma del cedente: __________________________________ Fecha: ______________________",
          "Nombre en letra de imprenta: ______________________________________________________",
          "Aceptación del fiduciario: ______________________________ Fecha: ____________________",
        ],
      },
      {
        heading: "6. Aceptación del fiduciario",
        pageBreak: true,
        lines: [
          `Yo, ${v.trustee}, acepto servir como fiduciario de ${v.trustName} según este acuerdo aprobado. Cumpliré los deberes escritos, cuidaré los bienes, separaré el dinero, conservaré registros y seguiré la ley.`,
          `Sucesión y reemplazo: ${t.incapacityAndSuccession}`,
          "Firma del fiduciario: _________________________________ Fecha: ____________________",
          "Dirección: ____________________________________________ Teléfono: _________________",
          `Aceptación del fiduciario suplente ${v.backupTrustee}, cuando corresponda: ______________`,
        ],
      },
      {
        heading: "7. Firmas, testigos y notario",
        pageBreak: true,
        lines: [
          `Requisitos aprobados para firmar: ${t.executionRequirements}`,
          "Firma del otorgante: __________________________________ Fecha: ____________________",
          "Nombre en letra de imprenta: ______________________________________________________",
          "Firma del fiduciario: __________________________________ Fecha: ____________________",
          "Testigo 1 / nombre / dirección: _____________________________________________________",
          "Testigo 2 / nombre / dirección: _____________________________________________________",
          "Use el reconocimiento notarial estatal proporcionado por el abogado. Adjunte otra página si hace falta espacio.",
        ],
      },
      {
        heading: "8. Registro de la compañía y los proveedores",
        pageBreak: true,
        lines: [
          "[ ] Se prepararon y presentaron por separado los documentos aprobados de la corporación de Florida tipo C.",
          "[ ] Se solicitó el EIN por el canal oficial, si corresponde.",
          "[ ] Se actualizaron los registros de dueños y las transferencias exigidas.",
          "[ ] El agente registrado y cualquier director tienen acuerdos escritos separados, con la revelación de conflictos firmada por el cliente.",
          "Sorrentino Law Firm, PLLC puede servir como agente registrado o director solo bajo un acuerdo escrito separado. El cliente puede escoger cualquier otro proveedor.",
          "Este paquete no presenta una formación, no pide un EIN, no abre cuentas y no garantiza que un banco, comprador o agencia acepte la estructura.",
        ],
      },
      {
        heading: "9. Preparación, cuotas y certificado final",
        pageBreak: true,
        lines: [
          "Nombre y firma del paralegal que preparó y entregó: _____________________ Fecha: ________",
          "El paralegal confirmó preparación y entrega solamente; no dio consejo legal ni aprobó los términos.",
          `Registro informativo: servicio inicial $${v.monthlyFee}/mes; fideicomiso nuevo $${v.trustFee}; estado ${v.feeStatus}; plan ${v.paymentPlan}. Esto no es una factura ni prueba de pago.`,
          `Certifico que revisé y aprobé esta versión para firma: ${t.reviewerName}, ${t.reviewerBarNumber}.`,
          "Firma del abogado: ____________________________________ Fecha: ____________________",
          "Sorrentino Law Firm, PLLC · Miami, FL. El cliente puede escoger otros abogados y proveedores.",
        ],
      },
    ];
  }
  if (language === "ht") {
    return [
      {
        heading: "1. Rejis apwobasyon avoka a",
        lines: [
          `Kliyan ak moun ki kreye fidisi a: ${v.clientName}`,
          `Biznis: ${v.businessName} · Kalite konpayi kounye a: ${v.entity}`,
          `Fidisi: ${v.trustName}`,
          `Fidisyè: ${v.trustee} · Fidisyè ranplasan: ${v.backupTrustee}`,
          `Dat li pran efè: ${t.effectiveDate} · Lwa ki gouvènen: ${t.governingLaw}`,
          `Avoka ki revize epi apwouve: ${t.reviewerName} · ${t.reviewerBarNumber}`,
          `Dat ak lè apwobasyon an anrejistre: ${approvedAt}`,
          "Apwobasyon sa a se sèlman pou done kliyan ak tèm ki anrejistre nan vèsyon sa a. Nenpòt chanjman bezwen yon nouvo vèsyon revize.",
        ],
      },
      {
        heading: "2. Akò fidisi biznis ou ka revoke",
        pageBreak: true,
        lines: [
          `2.1 Kreyasyon. ${creation}`,
          "2.2 Objektif. Fidisi a ap kenbe pataj biznis yo transfere legalman epi ede ak administrasyon, achiv ak kontra. Pa sèvi ak li pou kache byen, evite dèt, derefize lòd jij oswa retire dwa yon lòt moun.",
          "2.3 Byen. Se sèlman byen ak pataj nan Anèks A yo transfere ak dokiman valid epi konplè ki ap byen fidisi a. Yon lis poukont li pa transfere pwopriyete.",
          `2.4 Chanjman ak revokasyon. ${t.amendmentAndRevocation}`,
          `2.5 Benefisyè. Moun ak enstriksyon avoka a apwouve yo nan Anèks B: ${v.beneficiaries}.`,
          `2.6 Distribisyon. ${t.distributions}`,
          `2.7 Pouvwa fidisyè a. ${t.trusteePowers}`,
          "2.8 Limit. Fidisyè a dwe aji ak lwayote, separe lajan, evite benefis ki pa otorize epi kenbe achiv. Okenn vant, pre oswa komisyon pa otorize andeyò pouvwa ekri ak pèmisyon ki nesesè yo.",
          "2.9 Kont ak achiv. Fidisyè a ap kenbe fakti, resi, kontra, lis kliyan ak prèv peman, epi bay rapò lalwa mande.",
          `2.10 Enkapasite ak ranplasman. ${t.incapacityAndSuccession}`,
          `2.11 Peman ak depans. ${t.compensationAndExpenses}`,
          "2.12 Konpayi ak taks. Korporasyon, EIN ak kont yo bezwen pwosedi separe. Yon pwofesyonèl taks dwe revize taks ak règ pou pwopriyetè etranje yo.",
          `2.13 Lwa ak dèt. Lwa avoka a apwouve a gouvènen: ${t.governingLaw}. Fidisi a pa efase dèt, taks, kontra ni reklamasyon epi li pa garanti pwoteksyon byen.`,
        ],
      },
      {
        heading: "3. Anèks A — Pataj ak byen biznis la",
        pageBreak: true,
        lines: [
          `Biznis: ${v.businessName}`,
          `Pataj ak byen avoka a apwouve: ${v.assets}`,
          `Kondisyon transfè avoka a apwouve: ${t.transferTerms}`,
          "Chak transfè dwe idantifye byen an, pwopriyetè kounye a, pataj a ak dokiman ki nesesè. Dwe revize dèt, gaj, kontra, taks ak pèmisyon lòt moun.",
          "Pwopriyetè kounye a / pataj / sètifika oswa achiv: _________________________________",
          "Dokiman separe, dat ak moun ki siyen: ____________________________________________",
        ],
      },
      {
        heading: "4. Anèks B — Benefisyè",
        pageBreak: true,
        lines: [
          `Moun ak enstriksyon avoka a apwouve: ${v.beneficiaries}`,
          `Distribisyon ak kondisyon: ${t.distributions}`,
          "Dispozisyon avoka a apwouve yo kontwole pataj, kondisyon, benefisyè ranplasan ak pwoteksyon minè ki enkli yo.",
        ],
      },
      {
        heading: "5. Sesyon pataj biznis la",
        pageBreak: true,
        lines: [
          `Dapre kontrèpatie ki nan dokiman transfè yo, ${v.clientName} transfere bay ${v.trustee}, kòm fidisyè ${v.trustName}, sèlman pataj ki nan Anèks A, epi sa pran efè sèlman lè kondisyon sa yo fini: ${t.transferTerms}`,
          "Sesyon sa a pa transfere byen ki pa nan lis la epi li pa efase dèt, gaj, taks, reklamasyon oswa dwa lòt moun.",
          "Siyati moun ki transfere a: _____________________________ Dat: ______________________",
          "Non an gwo lèt: _________________________________________________________________",
          "Akseptasyon fidisyè a: __________________________________ Dat: ____________________",
        ],
      },
      {
        heading: "6. Akseptasyon fidisyè a",
        pageBreak: true,
        lines: [
          `Mwen menm, ${v.trustee}, mwen aksepte sèvi kòm fidisyè ${v.trustName} dapre akò avoka a apwouve sa a. M ap swiv devwa ekri yo, okipe byen yo, separe lajan, kenbe achiv epi swiv lalwa.`,
          `Ranplasman ak siksesyon: ${t.incapacityAndSuccession}`,
          "Siyati fidisyè a: ______________________________________ Dat: ____________________",
          "Adrès: _________________________________________________ Telefòn: _________________",
          `Akseptasyon fidisyè ranplasan ${v.backupTrustee}, lè sa nesesè: _________________________`,
        ],
      },
      {
        heading: "7. Siyati, temwen ak notè",
        pageBreak: true,
        lines: [
          `Kondisyon avoka a apwouve pou siyen: ${t.executionRequirements}`,
          "Siyati moun ki kreye fidisi a: _____________________________ Dat: ____________________",
          "Non an gwo lèt: __________________________________________________________________",
          "Siyati fidisyè a: _______________________________________ Dat: ____________________",
          "Temwen 1 / non / adrès: ___________________________________________________________",
          "Temwen 2 / non / adrès: ___________________________________________________________",
          "Sèvi ak rekonesans notè eta avoka a bay la. Tache yon lòt paj si espas pa ase.",
        ],
      },
      {
        heading: "8. Rejis konpayi ak pwofesyonèl yo",
        pageBreak: true,
        lines: [
          "[ ] Yo prepare epi depoze separe dokiman koporasyon C Florid avoka a apwouve yo.",
          "[ ] Yo mande EIN nan chanèl ofisyèl la, si sa nesesè.",
          "[ ] Yo mete ajou achiv pwopriyetè ak transfè ki nesesè yo.",
          "[ ] Ajan anrejistre ak nenpòt direktè gen akò alekri separe, avèk divilgasyon konfli kliyan an siyen.",
          "Sorrentino Law Firm, PLLC ka sèvi kòm ajan anrejistre oswa direktè sèlman dapre yon akò alekri separe. Kliyan an ka chwazi nenpòt lòt pwofesyonèl.",
          "Pakè sa a pa depoze fòmasyon, pa mande EIN, pa louvri kont epi li pa garanti yon labank, achtè oswa ajans ap aksepte estrikti a.",
        ],
      },
      {
        heading: "9. Preparasyon, frè ak sètifika final",
        pageBreak: true,
        lines: [
          "Non ak siyati paralegal ki prepare epi livre a: _______________________ Dat: ____________",
          "Paralegal la konfime preparasyon ak livrezon sèlman; li pa bay konsèy legal ni apwouve tèm yo.",
          `Rejis enfòmasyon: sèvis pou kòmanse $${v.monthlyFee} pa mwa; nouvo fidisi $${v.trustFee}; estati ${v.feeStatus}; plan ${v.paymentPlan}. Sa se pa yon bòdwo ni prèv peman.`,
          `Mwen sètifye mwen revize epi apwouve vèsyon sa a pou siyen: ${t.reviewerName}, ${t.reviewerBarNumber}.`,
          "Siyati avoka a: _________________________________________ Dat: ____________________",
          "Sorrentino Law Firm, PLLC · Miami, FL. Kliyan an ka chwazi lòt avoka ak pwofesyonèl.",
        ],
      },
    ];
  }
  return [
    {
      heading: "1. Attorney approval record",
      lines: [
        `Client and Settlor: ${v.clientName}`,
        `Business: ${v.businessName} · Current company type: ${v.entity}`,
        `Trust: ${v.trustName}`,
        `Trustee: ${v.trustee} · Successor Trustee: ${v.backupTrustee}`,
        `Effective date: ${t.effectiveDate} · Governing law: ${t.governingLaw}`,
        `Reviewed and approved by: ${t.reviewerName} · ${t.reviewerBarNumber}`,
        `Approval recorded: ${approvedAt}`,
        "This approval is limited to the client facts and terms saved in this version. Any change requires a newly reviewed version.",
      ],
    },
    {
      heading: "2. Revocable business trust agreement",
      pageBreak: true,
      lines: [
        `2.1 Creation. ${creation}`,
        "2.2 Purpose. The trust holds validly transferred business interests and supports administration, records and contracts. It may not be used to hide assets, avoid debts, disobey a court order or take another person's rights.",
        "2.3 Trust property. Only property and interests described in Schedule A and transferred by complete, valid instruments become trust property. A list alone transfers no ownership.",
        `2.4 Amendment and revocation. ${t.amendmentAndRevocation}`,
        `2.5 Beneficiaries. Approved people and instructions appear in Schedule B: ${v.beneficiaries}.`,
        `2.6 Distributions. ${t.distributions}`,
        `2.7 Trustee powers. ${t.trusteePowers}`,
        "2.8 Limits. The Trustee must act loyally, keep money separate, avoid unauthorized benefits and preserve records. No sale, loan or commission is authorized outside the written powers and required approvals.",
        "2.9 Accounts and records. The Trustee must keep invoices, receipts, contracts, client records and proof of payment, and give reports required by law.",
        `2.10 Incapacity and succession. ${t.incapacityAndSuccession}`,
        `2.11 Compensation and expenses. ${t.compensationAndExpenses}`,
        "2.12 Company and taxes. Corporation formation, an EIN and accounts require separate steps. A tax professional must review tax effects and rules for foreign owners.",
        `2.13 Law and debts. The approved governing law is ${t.governingLaw}. The trust does not erase debts, taxes, contracts or claims and does not guarantee asset protection.`,
      ],
    },
    {
      heading: "3. Schedule A — Business ownership and assets",
      pageBreak: true,
      lines: [
        `Business: ${v.businessName}`,
        `Approved ownership interests and assets: ${v.assets}`,
        `Approved transfer requirements: ${t.transferTerms}`,
        "Each transfer must identify the asset, current owner, interest transferred and required instrument. Debts, liens, contracts, taxes and third-party permissions must be reviewed.",
        "Current owner / share / certificate or record: ________________________________________",
        "Separate instrument, date and signer: __________________________________________________",
      ],
    },
    {
      heading: "4. Schedule B — Beneficiaries",
      pageBreak: true,
      lines: [
        `Approved people and instructions: ${v.beneficiaries}`,
        `Distributions and conditions: ${t.distributions}`,
        "The approved provisions control any included shares, conditions, backup beneficiaries and protection of minors.",
      ],
    },
    {
      heading: "5. Assignment of business ownership interest",
      pageBreak: true,
      lines: [
        `For the consideration stated in the transfer documents, ${v.clientName} assigns to ${v.trustee}, as Trustee of ${v.trustName}, only the interests described in Schedule A, effective only when these requirements are complete: ${t.transferTerms}`,
        "This assignment transfers no omitted asset and does not erase debts, liens, taxes, claims or third-party rights.",
        "Assignor signature: ______________________________________ Date: ______________________",
        "Printed name: ______________________________________________________________________",
        "Trustee acceptance: _______________________________________ Date: _____________________",
      ],
    },
    {
      heading: "6. Trustee acceptance",
      pageBreak: true,
      lines: [
        `I, ${v.trustee}, accept service as Trustee of ${v.trustName} under this approved agreement. I will perform the written duties, care for property, keep money separate, preserve records and follow the law.`,
        `Succession and replacement: ${t.incapacityAndSuccession}`,
        "Trustee signature: _________________________________________ Date: ____________________",
        "Address: ___________________________________________________ Phone: ___________________",
        `Acceptance by successor Trustee ${v.backupTrustee}, when required: _________________________`,
      ],
    },
    {
      heading: "7. Signatures, witnesses and notary",
      pageBreak: true,
      lines: [
        `Approved execution requirements: ${t.executionRequirements}`,
        "Settlor signature: _________________________________________ Date: ____________________",
        "Printed name: ______________________________________________________________________",
        "Trustee signature: _________________________________________ Date: ____________________",
        "Witness 1 / name / address: ___________________________________________________________",
        "Witness 2 / name / address: ___________________________________________________________",
        "Use the attorney-supplied state-specific notary acknowledgment. Attach another page if more space is needed.",
      ],
    },
    {
      heading: "8. Company and provider implementation record",
      pageBreak: true,
      lines: [
        "[ ] Approved Florida C-corporation formation documents were separately prepared and filed.",
        "[ ] An EIN was requested through the official channel, if needed.",
        "[ ] Ownership records and required transfers were updated.",
        "[ ] The registered agent and any director have separate written agreements, including the conflict disclosure signed by the client.",
        "Sorrentino Law Firm, PLLC may serve as registered agent or director only under a separate written agreement. The client may choose any other provider.",
        "This packet files no formation, requests no EIN, opens no accounts and does not guarantee that a bank, buyer or agency will accept the structure.",
      ],
    },
    {
      heading: "9. Preparation, fees and final certificate",
      pageBreak: true,
      lines: [
        "Preparing and delivering paralegal name and signature: ____________________ Date: __________",
        "The paralegal confirmed preparation and delivery only; the paralegal gave no legal advice and approved no terms.",
        `Informational record: starting service $${v.monthlyFee}/month; new trust $${v.trustFee}; status ${v.feeStatus}; plan ${v.paymentPlan}. This is not a bill or proof of payment.`,
        `I certify that I reviewed and approved this version for execution: ${t.reviewerName}, ${t.reviewerBarNumber}.`,
        "Attorney signature: ________________________________________ Date: ____________________",
        "Sorrentino Law Firm, PLLC · Miami, FL. The client may choose other attorneys and providers.",
      ],
    },
  ];
}
