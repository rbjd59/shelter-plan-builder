export const BUSINESS_TRUST_LANGUAGES = ["en", "es", "ht"] as const;
export type BusinessTrustLanguage = (typeof BUSINESS_TRUST_LANGUAGES)[number];
export type PacketSection = { heading: string; lines: string[]; pageBreak?: boolean };

export type BusinessTrustFormValues = {
  clientName: string;
  businessName: string;
  entity: string;
  goal: string;
  assets: string;
  trustName: string;
  trustMode: "new" | "existing_home";
  trustee: string;
  backupTrustee: string;
  beneficiaries: string;
  monthlyFee: number;
  feeStatus: string;
  startDate: string;
  paymentPlan: string;
  trustFee: number;
};

export const languageNames: Record<BusinessTrustLanguage, string> = {
  en: "English",
  es: "Español",
  ht: "Kreyòl ayisyen",
};

const labels = {
  en: {
    title: "DO NOT FORGET YOUR BUSINESS — BUSINESS TRUST FORMS",
    draft: "ATTORNEY-REVIEW DRAFT — DO NOT SIGN OR USE",
    page: "Page",
    incomplete: "[attorney to complete]",
    blank: "[to be completed]",
    pathNew: "New business trust, subject to attorney approval.",
    pathExisting:
      "Possible use of the existing home trust. The attorney must decide whether it may hold business interests. No second trust is assumed.",
  },
  es: {
    title: "DO NOT FORGET YOUR BUSINESS — FORMULARIOS DEL FIDEICOMISO DEL NEGOCIO",
    draft: "BORRADOR PARA REVISIÓN DEL ABOGADO — NO FIRMAR NI USAR",
    page: "Página",
    incomplete: "[el abogado debe completar]",
    blank: "[por completar]",
    pathNew: "Nuevo fideicomiso del negocio, sujeto a la aprobación del abogado.",
    pathExisting:
      "Posible uso del fideicomiso de la casa que ya existe. El abogado debe decidir si puede incluir partes del negocio. No se supone que habrá un segundo fideicomiso.",
  },
  ht: {
    title: "DO NOT FORGET YOUR BUSINESS — FÒM FIDISI BIZNIS YO",
    draft: "BOUYON POU AVOKA A REVIZE — PA SIYEN NI SÈVI AK LI",
    page: "Paj",
    incomplete: "[avoka a dwe ranpli]",
    blank: "[pou ranpli]",
    pathNew: "Nouvo fidisi biznis, si avoka a apwouve li.",
    pathExisting:
      "Nou ka gade si fidisi kay ki la deja a ka gen pataj biznis. Avoka a dwe deside sa. Nou pa sipoze y ap gen yon dezyèm fidisi.",
  },
} as const;

export function businessTrustPdfCopy(language: BusinessTrustLanguage) {
  return labels[language];
}

export function businessTrustFormSections(
  language: BusinessTrustLanguage,
  v: BusinessTrustFormValues,
): PacketSection[] {
  const l = labels[language];
  const path = v.trustMode === "existing_home" ? l.pathExisting : l.pathNew;
  if (language === "es") {
    return [
      {
        heading: "1. Datos del cliente y del negocio",
        lines: [
          `Cliente y futuro otorgante: ${v.clientName}`,
          `Nombre del negocio: ${v.businessName}`,
          `Tipo de compañía actual: ${v.entity}`,
          `Meta para el negocio: ${v.goal}`,
          `Nombre propuesto del fideicomiso: ${v.trustName}`,
          `Fideicomiso propuesto: ${path}`,
          `Fiduciario propuesto: ${v.trustee}`,
          `Fiduciario suplente propuesto: ${v.backupTrustee}`,
          "Dirección del otorgante: ______________________________________________",
          "Dirección del negocio: _______________________________________________",
          "Estado donde opera el negocio: ____________ Teléfono: __________________",
          `Preparado para revisión de Sorrentino Law Firm, PLLC, Miami, FL. ${l.draft}.`,
        ],
      },
      {
        heading: "2. Acuerdo de fideicomiso revocable del negocio",
        pageBreak: true,
        lines: [
          `2.1 Creación. ${v.clientName}, como otorgante, propone crear ${v.trustName}. ${v.trustee} es el fiduciario propuesto. El acuerdo final debe indicar la fecha, el estado y la ley que rige: ${l.incomplete}.`,
          "2.2 Propósito. El fideicomiso podrá tener partes de un negocio y ayudar a cuidar sus registros, contratos y trabajo diario. No se crea para esconder bienes, evitar una deuda, desobedecer una orden de un juez o quitar derechos a otra persona.",
          "2.3 Bienes del fideicomiso. Solo serán parte del fideicomiso los bienes y partes del negocio que se transfieran por documentos separados, completos y aprobados. La lista inicial está en el Anexo A. Firmar este borrador no transfiere nada.",
          "2.4 Control durante la vida. Mientras el otorgante esté vivo y pueda decidir por sí mismo, podrá cambiar o terminar el fideicomiso por escrito, como diga el documento final y la ley. El abogado debe completar las reglas para hacerlo.",
          `2.5 Beneficiarios. Las personas y las instrucciones propuestas están en el Anexo B: ${v.beneficiaries}. El abogado debe completar las partes de cada persona, las fechas de entrega, las reglas y los beneficiarios suplentes.`,
          "2.6 Distribuciones. El fiduciario solo podrá dar dinero o bienes según el acuerdo final. Debe anotar cada pago y guardar el recibo. Las reglas para pagos durante la vida, por incapacidad y después de la muerte las debe completar el abogado.",
          "2.7 Poderes del fiduciario. El documento final puede permitir cuidar el negocio, llevar registros, cobrar pagos, pagar gastos aprobados, contratar ayuda, comprar seguro y cumplir contratos. Cada poder debe estar escrito en el acuerdo final y permitido por la ley.",
          "2.8 Límites. El fiduciario no puede mezclar su dinero con el del fideicomiso, darse beneficios que no estén permitidos, esconder registros o actuar contra los beneficiarios. No puede vender el negocio, pedir un préstamo o firmar una comisión sin los poderes y permisos exigidos.",
          "2.9 Cuentas y registros. El fiduciario debe separar el dinero del negocio y del fideicomiso, guardar facturas, recibos, contratos y registros de clientes, y dar los informes que exija la ley. Este formulario no abre una cuenta de banco ni una cuenta de pagos.",
          `2.10 Fiduciario suplente. Se propone a ${v.backupTrustee}. El abogado debe escribir cómo se decide una incapacidad, renuncia, remoción o reemplazo, y cómo el suplente acepta el cargo.`,
          "2.11 Pago y gastos. El pago al fiduciario y el reembolso de gastos deben ser razonables y estar permitidos por el acuerdo final. Deben guardarse facturas y recibos. El abogado debe completar estas reglas.",
          "2.12 Compañía, EIN e impuestos. Si se aprueba una corporación de Florida tipo C perteneciente al fideicomiso, se necesitan documentos de formación y transferencia por separado. Este paquete no crea una compañía ni pide un EIN. Un profesional de impuestos debe revisar los efectos fiscales y las reglas para dueños extranjeros.",
          "2.13 Deudas y reclamos. El fideicomiso no borra deudas, impuestos, contratos ni reclamos. No promete proteger bienes ni asegura que un banco, comprador o agencia acepte la estructura.",
          "2.14 Ley, cambios y documentos completos. El acuerdo final debe incluir la ley que rige, cómo resolver conflictos, cómo hacer cambios, cómo firmar por separado y qué pasa si una parte no es válida. Todas estas cláusulas las debe aprobar el abogado.",
          `2.15 Antes de firmar. Faltan términos legales y documentos de transferencia. Este borrador no es un fideicomiso completo. No debe firmarse ni usarse hasta que el abogado entregue una versión final aprobada. Revisión y aprobación del abogado: ${l.incomplete}.`,
          "Firma del otorgante (solo en la versión aprobada): __________________ Fecha: __________",
          "Nombre en letra de imprenta: _________________________________________________",
          "Aceptación del fiduciario (solo en la versión aprobada): __________ Fecha: __________",
          "Testigos y notario exigidos por el estado: el abogado debe agregar los bloques correctos.",
        ],
      },
      {
        heading: "3. Anexo A — Partes y bienes del negocio",
        pageBreak: true,
        lines: [
          `Negocio: ${v.businessName}    Compañía actual: ${v.entity}`,
          `Partes y bienes propuestos: ${v.assets}`,
          "Dueño actual / parte que posee / número de certificado o registro: __________________",
          "Estado y fecha de formación de la compañía: ____________________________________",
          "Dirección registrada y agente registrado: ________________________________________",
          "Vehículos, herramientas y equipos (con número de serie o VIN): _____________________",
          "Contratos, listas de clientes, cuentas por cobrar y registros de trabajo: ______________",
          "Cuentas de banco o de pagos que el abogado apruebe incluir: _________________________",
          "Deudas, gravámenes, reclamos o permisos de otras personas: _________________________",
          "Documento separado que transfiere cada bien, su fecha y quien lo firmó: ______________",
          "Importante: una lista no transfiere la propiedad. El abogado debe preparar o aprobar cada cesión, acción, documento de compañía o título que se necesite.",
        ],
      },
      {
        heading: "4. Anexo B — Beneficiarios e instrucciones",
        pageBreak: true,
        lines: [
          `Personas e instrucciones propuestas: ${v.beneficiaries}`,
          "Nombre completo / parentesco / dirección / parte: _________________________________",
          "Beneficiario suplente / parte: __________________________________________________",
          "Edad o condiciones para recibir dinero o bienes: __________________________________",
          "Instrucciones si una persona muere o no puede recibir su parte: _____________________",
          "Quién cuidará los intereses de un menor: _________________________________________",
          "El abogado debe revisar estas instrucciones y agregar las reglas que exige la ley.",
        ],
      },
      {
        heading: "5. Aceptación del fiduciario — borrador",
        pageBreak: true,
        lines: [
          `Yo, ${v.trustee}, he leído la versión final aprobada del fideicomiso cuando el abogado la entregue.`,
          "Aceptaré solo los deberes y poderes escritos en esa versión. Cuidaré los bienes, separaré el dinero, guardaré registros y seguiré la ley.",
          "Entiendo que este borrador no me da autoridad para actuar, abrir cuentas, mover dinero, vender el negocio o firmar por otra persona.",
          "Firma del fiduciario (solo en la versión aprobada): _______________________________",
          "Nombre en letra de imprenta: ____________________________ Fecha: __________________",
          "Dirección: __________________________________ Teléfono: _________________________",
          `Fiduciario suplente propuesto: ${v.backupTrustee}. Su aceptación requiere una versión aprobada y las reglas completas.`,
        ],
      },
      {
        heading: "6. Lista para la compañía y las transferencias",
        pageBreak: true,
        lines: [
          "[ ] El abogado aprobó el acuerdo final y la ley del estado que rige.",
          "[ ] Se revisaron los dueños, deudas, contratos, impuestos, seguros y licencias actuales.",
          "[ ] Se prepararon los documentos de formación de la corporación, si se aprueba.",
          "[ ] Se solicitó el EIN por el canal oficial, si corresponde; este paquete no lo solicita.",
          "[ ] Se preparó y firmó cada documento de transferencia exigido.",
          "[ ] Se actualizaron los registros de dueños, banco, pagos, seguros y licencias cuando fue permitido.",
          "[ ] Se revisó por separado cualquier venta, préstamo o comisión con profesionales con licencia.",
          "[ ] Se entregaron copias completas al cliente y al fiduciario.",
          "Abogado que aprueba / fecha / notas: _____________________________________________",
        ],
      },
      {
        heading: "7. Registro de preparación y entrega del paralegal",
        pageBreak: true,
        lines: [
          "El paralegal juntó la información, escribió los datos y preparó este borrador para el abogado. El paralegal no dio consejo legal, no decidió los términos del fideicomiso y no aprobó la transferencia de bienes.",
          "Nombre del paralegal en letra de imprenta: ______________________________________",
          "Firma del paralegal: __________________________________ Fecha: __________________",
          "Correo o teléfono del paralegal: __________________________________________________",
          "Abogado supervisor: Rosario Kyle Sorrentino, Esq. · FL Bar No. 1049132",
          "Fecha en que se envió al abogado: _____________ Versión revisada: __________________",
          "Cambios pedidos por el abogado: ___________________________________________________",
          "Fecha y forma de entrega del PDF al cliente: ______________________________________",
          "La firma del paralegal solo confirma preparación y entrega. No sustituye la firma del abogado, del cliente, del fiduciario, de testigos o de un notario.",
        ],
      },
      {
        heading: "8. Registro de la cuota mensual — no es una factura",
        pageBreak: true,
        lines: [
          `Cuota inicial de servicio ofrecida: $${v.monthlyFee} al mes, sujeta a un acuerdo firmado.`,
          `Estado guardado: ${v.feeStatus}. Fecha de inicio acordada: ${v.startDate}.`,
          `Cuota ofrecida por un fideicomiso nuevo: $${v.trustFee}, pagadera con el tiempo bajo un acuerdo separado.`,
          `Plan de pago o referencia del acuerdo: ${v.paymentPlan}`,
          "Si se usa el fideicomiso de la casa, el abogado debe confirmar el trabajo y la cuota. No se supone una segunda cuota de fideicomiso.",
          "Este registro no activa una suscripción, no cobra una tarjeta y no prueba un pago. Los costos de registro de Florida y del agente registrado son separados. Director local opcional: $50 al mes bajo otro acuerdo.",
          "Cualquier venta o comisión necesita un acuerdo separado con un corredor y las licencias exigidas. Este paquete no vende el negocio ni crea una comisión.",
        ],
      },
      {
        heading: "9. Papeles para reunir y revisión final",
        lines: [
          "[ ] Identificación y datos de contacto del dueño y del fiduciario.",
          "[ ] Documentos de la compañía, licencias y registros de dueños.",
          "[ ] Lista de clientes, trabajos, facturas, recibos y pagos.",
          "[ ] Lista de herramientas, vehículos, contratos, deudas y seguros.",
          "[ ] Fideicomiso de la casa, si se propone usarlo.",
          "[ ] Términos aprobados por el abogado y acuerdo de cuotas firmado.",
          "Sorrentino Law Firm, PLLC · Miami, FL debe aprobar los documentos legales antes de firmarlos o usarlos. El cliente puede escoger otros proveedores.",
          `${l.draft}. Este paquete no es un fideicomiso firmado, una corporación creada ni un documento de transferencia.`,
        ],
      },
    ];
  }
  if (language === "ht") {
    return [
      {
        heading: "1. Enfòmasyon sou kliyan ak biznis la",
        lines: [
          `Kliyan ak moun ki pral kreye fidisi a: ${v.clientName}`,
          `Non biznis la: ${v.businessName}`,
          `Kalite konpayi li ye kounye a: ${v.entity}`,
          `Objektif pou biznis la: ${v.goal}`,
          `Non fidisi yo pwopoze a: ${v.trustName}`,
          `Fidisi yo pwopoze a: ${path}`,
          `Fidisyè yo pwopoze a: ${v.trustee}`,
          `Fidisyè ranplasan yo pwopoze a: ${v.backupTrustee}`,
          "Adrès moun ki kreye fidisi a: ____________________________________________",
          "Adrès biznis la: ________________________________________________________",
          "Eta kote biznis la travay: ____________ Telefòn: __________________________",
          `Yo prepare li pou Sorrentino Law Firm, PLLC, Miami, FL revize. ${l.draft}.`,
        ],
      },
      {
        heading: "2. Akò fidisi biznis ou ka revoke",
        pageBreak: true,
        lines: [
          `2.1 Kreyasyon. ${v.clientName} pwopoze kreye ${v.trustName}. ${v.trustee} se fidisyè yo pwopoze a. Dokiman final la dwe bay dat, eta ak lwa ki gouvènen li: ${l.incomplete}.`,
          "2.2 Objektif. Fidisi a ka kenbe pataj nan yon biznis epi ede pwoteje achiv, kontra ak travay chak jou. Li pa pou kache byen, pa peye dèt, derefize lòd jij oswa retire dwa yon lòt moun.",
          "2.3 Byen fidisi a. Se sèlman byen ak pataj biznis yo transfere ak dokiman separe, konplè epi apwouve ki ap nan fidisi a. Premye lis la nan Anèks A. Siyen bouyon sa a pa transfere anyen.",
          "2.4 Kontwòl pandan lavi. Pandan moun ki kreye fidisi a vivan epi li ka pran pwòp desizyon li, li ka chanje oswa fini fidisi a alekri, jan dokiman final la ak lwa a di. Avoka a dwe ranpli règ yo.",
          `2.5 Benefisyè. Moun ak enstriksyon yo pwopoze yo nan Anèks B: ${v.beneficiaries}. Avoka a dwe ranpli pataj chak moun, dat distribisyon, règ ak benefisyè ranplasan yo.`,
          "2.6 Distribisyon. Fidisyè a ka bay lajan oswa byen sèlman jan akò final la di. Li dwe note chak peman epi kenbe resi. Avoka a dwe ranpli règ pou peman pandan lavi, si moun nan pa kapab, ak apre lanmò.",
          "2.7 Pouvwa fidisyè a. Dokiman final la ka pèmèt fidisyè a okipe biznis la, kenbe achiv, resevwa peman, peye depans apwouve, anplwaye èd, achte asirans ak respekte kontra. Chak pouvwa dwe ekri epi lalwa dwe pèmèt li.",
          "2.8 Limit. Fidisyè a pa ka melanje lajan pa li ak lajan fidisi a, pran benefis ki pa pèmèt, kache achiv oswa travay kont benefisyè yo. Li pa ka vann biznis la, pran pre oswa siyen komisyon san pouvwa ak pèmisyon ki nesesè yo.",
          "2.9 Kont ak achiv. Fidisyè a dwe separe lajan biznis ak fidisi a, kenbe fakti, resi, kontra ak lis kliyan, epi bay rapò lalwa mande. Fòm sa a pa louvri kont labank ni kont peman.",
          `2.10 Fidisyè ranplasan. Yo pwopoze ${v.backupTrustee}. Avoka a dwe ekri kijan yo deside enkapasite, demisyon, revokasyon oswa ranplasman, ak kijan ranplasan an aksepte.`,
          "2.11 Peman ak depans. Peman fidisyè a ak ranbousman depans dwe rezonab epi akò final la dwe pèmèt yo. Dwe gen fakti ak resi. Avoka a dwe ranpli règ sa yo.",
          "2.12 Konpayi, EIN ak taks. Si yo apwouve yon koporasyon C nan Florid ki pami fidisi a, fo dokiman fòmasyon ak transfè separe. Pakè sa a pa kreye konpayi ni mande EIN. Yon pwofesyonèl taks dwe revize taks ak règ pou pwopriyetè etranje yo.",
          "2.13 Dèt ak reklamasyon. Fidisi a pa efase dèt, taks, kontra ni reklamasyon. Li pa pwomèt pwoteksyon byen ni ke yon labank, achtè oswa ajans ap aksepte estrikti a.",
          "2.14 Lwa, chanjman ak dokiman konplè. Akò final la dwe di ki lwa ki gouvènen, kijan pou rezoud konfli, fè chanjman, siyen separe ak sa k pase si yon pati pa valab. Avoka a dwe apwouve tout kloz sa yo.",
          `2.15 Anvan siyen. Gen tèm legal ak dokiman transfè ki manke. Bouyon sa a pa yon fidisi konplè. Pa siyen ni sèvi ak li jiskaske avoka a bay yon vèsyon final apwouve. Revizyon ak apwobasyon avoka: ${l.incomplete}.`,
          "Siyati moun ki kreye fidisi a (sèlman sou vèsyon apwouve): _____________ Dat: ________",
          "Non an gwo lèt: _______________________________________________________________",
          "Akseptasyon fidisyè a (sèlman sou vèsyon apwouve): __________________ Dat: ________",
          "Temwen ak notè eta a mande: avoka a dwe ajoute bon blòk yo.",
        ],
      },
      {
        heading: "3. Anèks A — Pataj ak byen biznis la",
        pageBreak: true,
        lines: [
          `Biznis: ${v.businessName}    Konpayi kounye a: ${v.entity}`,
          `Pataj ak byen yo pwopoze: ${v.assets}`,
          "Pwopriyetè kounye a / pataj / nimewo sètifika oswa achiv: __________________________",
          "Eta ak dat konpayi a te fòme: __________________________________________________",
          "Adrès anrejistre ak ajan anrejistre: _____________________________________________",
          "Machin, zouti ak ekipman (nimewo seri oswa VIN): __________________________________",
          "Kontra, lis kliyan, lajan pou resevwa ak achiv travay: _______________________________",
          "Kont labank oswa peman avoka a apwouve mete: ______________________________________",
          "Dèt, gaj, reklamasyon oswa pèmisyon lòt moun: _____________________________________",
          "Dokiman separe ki transfere chak byen, dat ak moun ki siyen: _________________________",
          "Enpòtan: yon lis pa transfere pwopriyete. Avoka a dwe prepare oswa apwouve chak sesyon, aksyon, dokiman konpayi oswa tit ki nesesè.",
        ],
      },
      {
        heading: "4. Anèks B — Benefisyè ak enstriksyon",
        pageBreak: true,
        lines: [
          `Moun ak enstriksyon yo pwopoze: ${v.beneficiaries}`,
          "Non konplè / relasyon / adrès / pataj: _____________________________________________",
          "Benefisyè ranplasan / pataj: _____________________________________________________",
          "Laj oswa kondisyon pou resevwa lajan oswa byen: ___________________________________",
          "Enstriksyon si yon moun mouri oswa pa ka resevwa pataj li: ___________________________",
          "Kiyès ki ap okipe enterè yon minè: ________________________________________________",
          "Avoka a dwe revize enstriksyon sa yo epi ajoute règ lalwa mande.",
        ],
      },
      {
        heading: "5. Akseptasyon fidisyè a — bouyon",
        pageBreak: true,
        lines: [
          `Mwen menm, ${v.trustee}, mwen pral li vèsyon final avoka a apwouve a lè li lage li.`,
          "Mwen pral aksepte sèlman devwa ak pouvwa ki ekri nan vèsyon sa a. Mwen pral okipe byen yo, separe lajan, kenbe achiv epi swiv lalwa.",
          "Mwen konprann bouyon sa a pa ban m otorite pou aji, louvri kont, deplase lajan, vann biznis la oswa siyen pou yon lòt moun.",
          "Siyati fidisyè a (sèlman sou vèsyon apwouve): _____________________________________",
          "Non an gwo lèt: ______________________________________ Dat: ______________________",
          "Adrès: ______________________________________ Telefòn: __________________________",
          `Fidisyè ranplasan yo pwopoze: ${v.backupTrustee}. Akseptasyon li bezwen vèsyon apwouve ak tout règ yo.`,
        ],
      },
      {
        heading: "6. Lis pou konpayi ak transfè yo",
        pageBreak: true,
        lines: [
          "[ ] Avoka a apwouve akò final la ak lwa eta ki gouvènen an.",
          "[ ] Yo revize pwopriyetè, dèt, kontra, taks, asirans ak lisans kounye a.",
          "[ ] Yo prepare dokiman fòmasyon koporasyon an, si yo apwouve li.",
          "[ ] Yo mande EIN nan chanèl ofisyèl la, si sa nesesè; pakè sa a pa mande li.",
          "[ ] Yo prepare epi siyen chak dokiman transfè ki nesesè.",
          "[ ] Yo mete ajou achiv pwopriyetè, labank, peman, asirans ak lisans lè sa pèmèt.",
          "[ ] Pwofesyonèl ki gen lisans revize separe nenpòt vant, pre oswa komisyon.",
          "[ ] Yo bay kliyan ak fidisyè a kopi konplè.",
          "Avoka ki apwouve / dat / nòt: ____________________________________________________",
        ],
      },
      {
        heading: "7. Rejis preparasyon ak livrezon paralegal la",
        pageBreak: true,
        lines: [
          "Paralegal la rasanble enfòmasyon, mete done yo epi prepare bouyon sa a pou avoka a. Paralegal la pa bay konsèy legal, pa chwazi tèm fidisi a epi pa apwouve transfè byen.",
          "Non paralegal la an gwo lèt: ____________________________________________________",
          "Siyati paralegal la: _______________________________________ Dat: _______________",
          "Imèl oswa telefòn paralegal la: ___________________________________________________",
          "Avoka sipèvizè: Rosario Kyle Sorrentino, Esq. · FL Bar No. 1049132",
          "Dat yo voye bay avoka a: _________________ Vèsyon yo revize: _______________________",
          "Chanjman avoka a mande: _________________________________________________________",
          "Dat ak jan yo voye PDF bay kliyan an: ______________________________________________",
          "Siyati paralegal la konfime preparasyon ak livrezon sèlman. Li pa ranplase siyati avoka, kliyan, fidisyè, temwen oswa notè.",
        ],
      },
      {
        heading: "8. Rejis frè pa mwa a — se pa yon bòdwo",
        pageBreak: true,
        lines: [
          `Frè sèvis pou kòmanse yo ofri a: $${v.monthlyFee} pa mwa, si gen yon akò siyen.`,
          `Estati ki anrejistre: ${v.feeStatus}. Dat kòmansman yo dakò a: ${v.startDate}.`,
          `Frè yo ofri pou nouvo fidisi a: $${v.trustFee}, ka peye piti piti dapre yon akò separe.`,
          `Plan peman oswa referans akò a: ${v.paymentPlan}`,
          "Si yo sèvi ak fidisi kay la, avoka a dwe konfime travay ak frè a. Nou pa sipoze yon dezyèm frè fidisi.",
          "Rejis sa a pa aktive abònman, pa debite kat epi pa pwouve peman. Frè anrejistreman Florid ak ajan anrejistre separe. Direktè lokal si ou vle: $50 pa mwa dapre yon lòt akò.",
          "Nenpòt vant oswa komisyon bezwen akò separe ak yon kwèk ki gen lisans. Pakè sa a pa vann biznis la ni kreye komisyon.",
        ],
      },
      {
        heading: "9. Papye pou rasanble ak dènye revizyon",
        lines: [
          "[ ] Idantite ak enfòmasyon kontak pwopriyetè ak fidisyè a.",
          "[ ] Dokiman konpayi, lisans ak achiv pwopriyetè yo.",
          "[ ] Lis kliyan, travay, fakti, resi ak peman.",
          "[ ] Lis zouti, machin, kontra, dèt ak asirans.",
          "[ ] Fidisi kay la, si yo pwopoze sèvi ak li.",
          "[ ] Tèm avoka a apwouve ak akò frè siyen.",
          "Sorrentino Law Firm, PLLC · Miami, FL dwe apwouve dokiman legal yo anvan yo siyen oswa sèvi ak yo. Kliyan an ka chwazi lòt pwofesyonèl.",
          `${l.draft}. Pakè sa a pa yon fidisi siyen, yon koporasyon kreye ni yon dokiman transfè.`,
        ],
      },
    ];
  }
  return [
    {
      heading: "1. Client and business information",
      lines: [
        `Client and proposed Settlor: ${v.clientName}`,
        `Business name: ${v.businessName}`,
        `Current company type: ${v.entity}`,
        `Goal for the business: ${v.goal}`,
        `Proposed trust name: ${v.trustName}`,
        `Proposed trust path: ${path}`,
        `Proposed Trustee: ${v.trustee}`,
        `Proposed successor Trustee: ${v.backupTrustee}`,
        "Settlor address: _________________________________________________________",
        "Business address: ________________________________________________________",
        "State where the business works: ____________ Phone: _________________________",
        `Prepared for review by Sorrentino Law Firm, PLLC, Miami, FL. ${l.draft}.`,
      ],
    },
    {
      heading: "2. Revocable business trust agreement",
      pageBreak: true,
      lines: [
        `2.1 Creation. ${v.clientName}, as Settlor, proposes to create ${v.trustName}. ${v.trustee} is the proposed Trustee. The final agreement must state its date, state and governing law: ${l.incomplete}.`,
        "2.2 Purpose. The trust may hold business interests and help preserve records, contracts and daily work. It may not be used to hide assets, avoid a debt, disobey a court order or take another person's rights.",
        "2.3 Trust property. Only assets and business interests transferred by separate, complete and approved instruments become trust property. The proposed starting list is Schedule A. Signing this draft transfers nothing.",
        "2.4 Control during life. While the Settlor is alive and able to make decisions, the Settlor may change or end the trust in writing as the final document and law allow. The attorney must complete those rules.",
        `2.5 Beneficiaries. Proposed people and instructions appear in Schedule B: ${v.beneficiaries}. The attorney must complete shares, distribution dates, rules and backup beneficiaries.`,
        "2.6 Distributions. The Trustee may give money or property only as the final agreement allows. Each payment and receipt must be recorded. The attorney must complete rules for lifetime, incapacity and after-death distributions.",
        "2.7 Trustee powers. The final document may allow managing the business, keeping records, collecting payments, paying approved expenses, hiring help, buying insurance and performing contracts. Each power must be written in the final agreement and allowed by law.",
        "2.8 Limits. The Trustee may not mix personal and trust money, take unapproved benefits, hide records or act against the beneficiaries. The Trustee may not sell the business, borrow money or sign a commission without the required powers and approvals.",
        "2.9 Accounts and records. The Trustee must keep business and trust money separate, keep invoices, receipts, contracts and client records, and give reports required by law. This form opens no bank or payment account.",
        `2.10 Successor Trustee. ${v.backupTrustee} is proposed. The attorney must write how incapacity, resignation, removal or replacement is decided and how the successor accepts the role.`,
        "2.11 Pay and expenses. Trustee pay and expense repayment must be reasonable and allowed by the final agreement. Invoices and receipts must be kept. The attorney must complete these rules.",
        "2.12 Company, EIN and taxes. If a trust-owned Florida C corporation is approved, separate formation and transfer documents are needed. This packet does not form a company or request an EIN. A tax professional must review tax effects and rules for foreign owners.",
        "2.13 Debts and claims. The trust does not erase debts, taxes, contracts or claims. It does not promise asset protection or guarantee that a bank, buyer or agency will accept the structure.",
        "2.14 Law, changes and complete documents. The final agreement must cover governing law, resolving conflicts, making changes, signing in counterparts and what happens if a provision is invalid. The attorney must approve all of these clauses.",
        `2.15 Before signing. Legal terms and transfer documents are missing. This draft is not a complete trust. Do not sign or use it until the attorney provides an approved final version. Attorney review and approval: ${l.incomplete}.`,
        "Settlor signature (approved version only): ________________________ Date: ____________",
        "Printed name: __________________________________________________________________",
        "Trustee acceptance (approved version only): _______________________ Date: ____________",
        "State-required witnesses and notary: the attorney must add the correct blocks.",
      ],
    },
    {
      heading: "3. Schedule A — Business ownership and assets",
      pageBreak: true,
      lines: [
        `Business: ${v.businessName}    Current company: ${v.entity}`,
        `Proposed ownership interests and assets: ${v.assets}`,
        "Current owner / share owned / certificate or record number: __________________________",
        "Company formation state and date: __________________________________________________",
        "Registered address and registered agent: ___________________________________________",
        "Vehicles, tools and equipment (serial number or VIN): _________________________________",
        "Contracts, client lists, money owed and work records: _________________________________",
        "Bank or payment accounts the attorney approves including: _____________________________",
        "Debts, liens, claims or other people's permissions: __________________________________",
        "Separate transfer instrument for each asset, its date and signer: _______________________",
        "Important: a list does not transfer ownership. The attorney must prepare or approve every needed assignment, share, company record or title.",
      ],
    },
    {
      heading: "4. Schedule B — Beneficiaries and instructions",
      pageBreak: true,
      lines: [
        `Proposed people and instructions: ${v.beneficiaries}`,
        "Full name / relationship / address / share: __________________________________________",
        "Backup beneficiary / share: ________________________________________________________",
        "Age or conditions for receiving money or property: ___________________________________",
        "Instructions if a person dies or cannot receive a share: _______________________________",
        "Who will protect a minor's interests: ________________________________________________",
        "The attorney must review these instructions and add rules required by law.",
      ],
    },
    {
      heading: "5. Trustee acceptance — draft",
      pageBreak: true,
      lines: [
        `I, ${v.trustee}, will read the attorney-approved final trust when it is provided.`,
        "I will accept only the duties and powers written in that version. I will care for the property, keep money separate, preserve records and follow the law.",
        "I understand this draft gives me no authority to act, open accounts, move money, sell the business or sign for anyone else.",
        "Trustee signature (approved version only): _________________________________________",
        "Printed name: _____________________________________________ Date: _________________",
        "Address: _________________________________________ Phone: _________________________",
        `Proposed successor Trustee: ${v.backupTrustee}. That acceptance requires an approved version and complete rules.`,
      ],
    },
    {
      heading: "6. Company and transfer checklist",
      pageBreak: true,
      lines: [
        "[ ] The attorney approved the final agreement and governing state law.",
        "[ ] Current owners, debts, contracts, taxes, insurance and licenses were reviewed.",
        "[ ] Corporation formation documents were prepared, if approved.",
        "[ ] An EIN was requested through the official channel, if needed; this packet does not request it.",
        "[ ] Every required transfer document was prepared and signed.",
        "[ ] Owner, bank, payment, insurance and license records were updated where allowed.",
        "[ ] Any sale, loan or commission was separately reviewed by licensed professionals.",
        "[ ] The client and Trustee received complete copies.",
        "Approving attorney / date / notes: __________________________________________________",
      ],
    },
    {
      heading: "7. Paralegal preparation and delivery record",
      pageBreak: true,
      lines: [
        "The paralegal gathered information, entered the details and prepared this draft for the attorney. The paralegal gave no legal advice, chose no trust terms and approved no transfer of property.",
        "Paralegal printed name: __________________________________________________________",
        "Paralegal signature: ___________________________________________ Date: _____________",
        "Paralegal email or phone: _________________________________________________________",
        "Supervising attorney: Rosario Kyle Sorrentino, Esq. · FL Bar No. 1049132",
        "Date sent to attorney: _____________________ Version reviewed: ______________________",
        "Changes requested by attorney: ____________________________________________________",
        "Date and method PDF delivered to client: ___________________________________________",
        "The paralegal signature confirms preparation and delivery only. It does not replace the attorney, client, Trustee, witness or notary signature.",
      ],
    },
    {
      heading: "8. Monthly fee record — not a bill",
      pageBreak: true,
      lines: [
        `Offered starting service fee: $${v.monthlyFee}/month, subject to a signed agreement.`,
        `Recorded status: ${v.feeStatus}. Agreed start date: ${v.startDate}.`,
        `Offered new trust fee: $${v.trustFee}, payable over time under a separate agreement.`,
        `Payment plan or agreement reference: ${v.paymentPlan}`,
        "If the home trust is used, the attorney must confirm the work and fee. No second trust fee is assumed.",
        "This record activates no subscription, charges no card and proves no payment. Florida filing and registered-agent costs are separate. Optional local director: $50/month under another agreement.",
        "Any sale or commission needs a separate agreement with a licensed broker. This packet does not sell the business or create a commission.",
      ],
    },
    {
      heading: "9. Papers to gather and final review",
      lines: [
        "[ ] Identification and contact details for the owner and Trustee.",
        "[ ] Company documents, licenses and ownership records.",
        "[ ] Client lists, jobs, invoices, receipts and payments.",
        "[ ] Lists of tools, vehicles, contracts, debts and insurance.",
        "[ ] Home trust, if it is proposed for use.",
        "[ ] Attorney-approved terms and a signed fee agreement.",
        "Sorrentino Law Firm, PLLC · Miami, FL must approve legal documents before signing or use. The client may choose other providers.",
        `${l.draft}. This packet is not a signed trust, formed corporation or transfer document.`,
      ],
    },
  ];
}
