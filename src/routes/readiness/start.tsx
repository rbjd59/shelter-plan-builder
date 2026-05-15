import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment, isStripeConfigured } from "@/lib/stripe";
import { createReadinessCheckout } from "@/lib/readiness.functions";

const search = z.object({
  session: z.string().min(6).optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  email: z.string().email().optional(),
});

function generateStandaloneSessionId() {
  return `standalone_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export const Route = createFileRoute("/readiness/start")({
  validateSearch: search,
  component: StartPage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Add-on" }] }),
});

const COPY = {
  en: {
    title: "Sentinel Readiness Packet",
    price: "$99 — one-time  ·  optional $5/month vault storage",
    body: "Do not leave your family unprepared. We gather every court-recognized document your family will need, translate them into English and your language side-by-side, you fill them out in your own words, and we type your exact answers onto the official forms. You print, sign, and notarize. You keep 100% control until you need help.",
    docsTitle: "Exactly what you get for $99",
    docs: [
      { name: "Power of Attorney (UPOAA model)", info: "Lets the person you choose pay your bills, talk to your bank, and handle your money while you are detained. Based on the Uniform Power of Attorney Act adopted in most states. Must be notarized." },
      { name: "Standby / Temporary Guardianship for minor children", info: "Names who legally cares for your children if you are detained — without giving up your parental rights. Recognized in Florida, Texas, NY, NJ, GA, IL and most states. Some states require a notary, others a judge's stamp." },
      { name: "HIPAA Medical Authorization", info: "Lets your designated person speak to doctors and get medical records for you and your minor children. Federal HIPAA-compliant template." },
      { name: "School Pickup Authorization", info: "Tells the school exactly who can pick up your children. Most school districts accept this as a notarized parent letter." },
      { name: "Financial Inventory", info: "A private list of your bank accounts, credit cards, debts, and recurring payments — WITHOUT passwords. So your family knows what bills exist." },
      { name: "Emergency Contact Tree (3 tiers)", info: "Family · extended family · attorney/community. The order we should call if you are detained." },
      { name: "Children's Information Sheet", info: "DOB, school, doctor, allergies, daily medications, allergies, dietary needs. One sheet per child." },
      { name: "Important-Document Locator", info: "Where to find passports, birth certificates, marriage certificate, deeds, vehicle titles, leases, insurance policies." },
    ],
    vaultTitle: "Optional encrypted vault — $5/month",
    vaultBody: "Instead of handing the signed packet to your family today, you can load it into your encrypted device vault. We do NOT have a copy. We only release it to the person you designated when YOU trigger HELP NOW. Cancel anytime — your packet stays yours.",
    faqTitle: "Quick FAQ",
    faq: [
      { q: "Is this legal advice?", a: "No. We are a translation + typing + delivery service. We do NOT pick documents for you, give legal opinions, or appear in court. You decide what you want to say; we type your exact words onto the standard forms." },
      { q: "Do I need a lawyer?", a: "Not to fill out these forms. They are standard templates. We strongly recommend a notary in your state review the POA and guardianship before you sign — most states require notarization for them to be valid." },
      { q: "What if I never get detained?", a: "Nothing happens. You keep your packet. The vault (if you bought it) sits encrypted. You stay 100% in control." },
      { q: "Can I update the packet later?", a: "Yes. You can re-do any section anytime — new bank account, new child's school, new guardian. Re-print, re-notarize the changed pages." },
      { q: "Who pays for notary fees?", a: "You do — separately. A notary in Florida is $10/document. UPS, banks, and many libraries notarize for free or low cost." },
      { q: "Is this only for immigrants?", a: "No. Anyone facing the possibility of being held by ANY federal agency — or simply wanting their family prepared for any emergency — can use this. We advertise in immigrant communities because that is where the urgent need is, but the documents are the same standard family-protection forms any estate planner uses." },
    ],
    disclaimer: "Document preparation and translation only. NOT legal advice. We are scriveners — we type your exact dictated answers onto Clerk-of-Court and standard state forms. Forms are based on the Uniform Power of Attorney Act and standard state-recognized templates — have an attorney or notary in your state review POA and guardianship documents before signing.",
  },
  es: {
    title: "Paquete Sentinel Readiness",
    price: "$99 — pago único  ·  bóveda opcional $5/mes",
    body: "No deje a su familia desprevenida. Reunimos cada documento reconocido por las cortes que su familia necesitará, los traducimos al inglés y a su idioma lado a lado, usted los llena en sus propias palabras, y nosotros escribimos sus respuestas exactas en los formularios oficiales. Usted imprime, firma y notariza. Usted mantiene el 100% del control hasta que necesite ayuda.",
    docsTitle: "Esto es exactamente lo que recibe por $99",
    docs: [
      { name: "Poder Notarial (modelo UPOAA)", info: "Permite a la persona que usted elija pagar sus cuentas, hablar con el banco y manejar su dinero mientras está detenido. Basado en la Ley Uniforme de Poder Notarial adoptada en la mayoría de los estados. Debe notarizarse." },
      { name: "Tutela temporal/en espera de hijos menores", info: "Designa quién cuida legalmente a sus hijos si lo detienen — sin renunciar a sus derechos como padre. Reconocido en Florida, Texas, NY, NJ, GA, IL y la mayoría de los estados. Algunos estados requieren notario, otros sello del juez." },
      { name: "Autorización Médica HIPAA", info: "Permite a su persona designada hablar con médicos y obtener registros médicos suyos y de sus hijos menores. Plantilla federal conforme a HIPAA." },
      { name: "Autorización para recoger en la escuela", info: "Indica a la escuela exactamente quién puede recoger a sus hijos. La mayoría de los distritos escolares lo aceptan como carta notarizada de padre." },
      { name: "Inventario Financiero", info: "Lista privada de sus cuentas bancarias, tarjetas de crédito, deudas y pagos recurrentes — SIN contraseñas. Para que su familia sepa qué cuentas existen." },
      { name: "Árbol de Contactos de Emergencia (3 niveles)", info: "Familia · familia extendida · abogado/comunidad. El orden en que se debe llamar si lo detienen." },
      { name: "Hoja de Información de los Menores", info: "Fecha de nacimiento, escuela, médico, alergias, medicamentos diarios, necesidades dietéticas. Una hoja por niño." },
      { name: "Localizador de Documentos Importantes", info: "Dónde encontrar pasaportes, actas de nacimiento, acta de matrimonio, escrituras, títulos de vehículos, contratos de arrendamiento, pólizas de seguro." },
    ],
    vaultTitle: "Bóveda cifrada opcional — $5/mes",
    vaultBody: "En vez de entregar el paquete firmado a su familia hoy, puede cargarlo en su bóveda cifrada del dispositivo. Nosotros NO tenemos copia. Solo se libera a la persona que usted designó cuando USTED active AYUDA YA. Cancele cuando quiera — su paquete sigue siendo suyo.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Es esto asesoría legal?", a: "No. Somos un servicio de traducción + escritura + entrega. NO elegimos documentos por usted, no damos opiniones legales, no comparecemos en corte. Usted decide qué quiere decir; nosotros escribimos sus palabras exactas en los formularios estándar." },
      { q: "¿Necesito un abogado?", a: "No para llenar estos formularios. Son plantillas estándar. Recomendamos fuertemente que un notario en su estado revise el poder y la tutela antes de firmar — la mayoría de los estados requieren notarización para que sean válidos." },
      { q: "¿Y si nunca me detienen?", a: "Nada pasa. Conserva su paquete. La bóveda (si la compró) queda cifrada. Usted sigue 100% en control." },
      { q: "¿Puedo actualizar el paquete después?", a: "Sí. Puede rehacer cualquier sección en cualquier momento — nueva cuenta bancaria, nueva escuela del niño, nuevo tutor. Reimprima y vuelva a notarizar las páginas cambiadas." },
      { q: "¿Quién paga las tarifas del notario?", a: "Usted — por separado. Un notario en Florida cuesta $10/documento. UPS, bancos y muchas bibliotecas notarizan gratis o a bajo costo." },
      { q: "¿Es solo para inmigrantes?", a: "No. Cualquier persona que enfrente la posibilidad de ser retenida por CUALQUIER agencia federal — o que simplemente quiera tener a su familia preparada para cualquier emergencia — puede usarlo. Anunciamos en comunidades inmigrantes porque allí está la necesidad urgente, pero los documentos son los mismos formularios estándar de protección familiar que usa cualquier planificador de bienes." },
    ],
    disclaimer: "Solo preparación y traducción de documentos. NO es asesoría legal. Somos escribanos — escribimos sus respuestas dictadas exactas en formularios del Secretario de la Corte y formularios estatales estándar. Los formularios se basan en la Ley Uniforme de Poder Notarial y plantillas estatales estándar — pida a un abogado o notario en su estado revisar el poder y la tutela antes de firmar.",
  },
  ht: {
    title: "Pakè Sentinel Readiness",
    price: "$99 — pèman youn fwa  ·  $5/mwa pou kòfrefò opsyonèl",
    body: "Pa kite fanmi w san preparasyon. Nou rasanble chak dokiman tribinal yo rekonèt fanmi w ap bezwen, tradui yo an angle ak lang ou kòt-a-kòt, ou ranpli yo nan pwòp mo w, e nou tape repons egzak ou yo sou fòm ofisyèl yo. Ou enprime, siyen, e notaryze. Ou gen 100% kontwòl jiskaske w bezwen èd.",
    docsTitle: "Sa egzakteman ou jwenn pou $99",
    docs: [
      { name: "Pouvwa Avoka (modèl UPOAA)", info: "Pèmèt moun ou chwazi a peye fakti w, pale ak labank, e jere lajan w pandan ou nan detansyon. Baze sou Lwa Inifòm sou Pouvwa Avoka pifò eta adopte. Dwe notaryze." },
      { name: "Gad legal tanporè/an atant pou timoun minè", info: "Nonmen kiyès ki pran swen timoun ou legalman si yo detni w — san ou pa pèdi dwa paran w. Rekonèt nan Florida, Texas, NY, NJ, GA, IL ak pifò eta. Kèk eta mande notè, lòt mande so jij." },
      { name: "Otorizasyon Medikal HIPAA", info: "Pèmèt moun ou chwazi a pale ak doktè e jwenn dosye medikal pou ou ak timoun minè w. Modèl federal HIPAA." },
      { name: "Otorizasyon pou ranmase nan lekòl", info: "Di lekòl la egzakteman kiyès ki ka ranmase timoun ou yo. Pifò distri lekòl aksepte sa kòm lèt paran notaryze." },
      { name: "Envantè Finansye", info: "Lis prive kont labank, kat kredi, dèt, ak peman regilye w — SAN modpas. Pou fanmi w konnen ki kont ki egziste." },
      { name: "Ab Kontak Ijans (3 nivo)", info: "Fanmi · fanmi laj · avoka/kominote. Lòd pou rele si yo detni w." },
      { name: "Fèy Enfòmasyon Timoun", info: "Dat nesans, lekòl, doktè, alèji, medikaman chak jou, bezwen alimantè. Yon fèy chak timoun." },
      { name: "Lokalizatè Dokiman Enpòtan", info: "Kote pou jwenn paspò, batistè, sètifika maryaj, papye kay, tit machin, kontra lwaye, polis asirans." },
    ],
    vaultTitle: "Kòfrefò chiffre opsyonèl — $5/mwa",
    vaultBody: "Olye bay fanmi w pakè ki siyen an jodi a, ou ka mete l nan kòfrefò chiffre aparèy ou a. Nou PA gen kopi. Nou voye l sèlman bay moun ou nonmen an lè OU aktive AYÈ KOUNYE A. Anile nenpòt lè — pakè a rete pou ou.",
    faqTitle: "Kesyon Frekan",
    faq: [
      { q: "Èske sa a se konsèy legal?", a: "Non. Nou se yon sèvis tradiksyon + tape + livrezon. Nou PA chwazi dokiman pou ou, pa bay opinyon legal, pa parèt nan tribinal. Ou deside kisa ou vle di; nou tape mo egzak ou yo sou fòm estanda yo." },
      { q: "Èske mwen bezwen yon avoka?", a: "Non pou ranpli fòm sa yo. Yo se modèl estanda. Nou rekòmande fò pou yon notè nan eta w revize POA ak gad legal anvan w siyen — pifò eta mande notarizasyon pou yo valab." },
      { q: "Si yo pa janm detni m?", a: "Pa gen anyen ki rive. Ou kenbe pakè w. Kòfrefò a (si w te achte l) rete chiffre. Ou rete 100% an kontwòl." },
      { q: "Èske mwen ka mete pakè a ajou pita?", a: "Wi. Ou ka refè nenpòt seksyon nenpòt lè — nouvo kont labank, nouvo lekòl timoun, nouvo gadyen. Re-enprime, re-notaryze paj ki chanje yo." },
      { q: "Kiyès ki peye frè notè?", a: "Ou — apa. Yon notè nan Florida koute $10/dokiman. UPS, labank, ak anpil bibliyotèk notarize gratis oswa ak yon ti pri." },
      { q: "Èske se sèlman pou imigran?", a: "Non. Nenpòt moun ki ap fè fas ak posibilite pou yo ta detni l pa NENPÒT ajans federal — oswa ki vle senpman fanmi w prepare pou nenpòt ijans — ka itilize l. Nou fè piblisite nan kominote imigran paske se la bezwen ijan an ye, men dokiman yo se menm fòm estanda pwoteksyon fanmi nenpòt planifikatè byen itilize." },
    ],
    disclaimer: "Preparasyon ak tradiksyon dokiman sèlman. PA konsèy legal. Nou se eskriben — nou tape repons ou dikte yo egzakteman sou fòm Grefye Tribinal ak fòm estanda eta yo. Fòm yo baze sou Lwa Inifòm sou Pouvwa Avoka ak modèl estanda eta yo — mande yon avoka oswa notè nan eta w revize POA ak gad legal anvan w siyen.",
  },
} as const;

function StartPage() {
  const { session, lang, email } = Route.useSearch();
  const c = COPY[lang as keyof typeof COPY];
  const [stripePromise] = useState(() => getStripe());
  const [sessionId] = useState(() => session ?? generateStandaloneSessionId());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openDoc, setOpenDoc] = useState<number | null>(null);

  const fetchClientSecret = async () => {
    const secret = await createReadinessCheckout({
      data: {
        intakeSessionId: sessionId,
        language: lang,
        customerEmail: email,
        returnUrl: `${window.location.origin}/readiness/intake?packet_session={CHECKOUT_SESSION_ID}&lang=${lang}`,
        environment: getStripeEnvironment(),
      },
    });
    if (!secret) throw new Error("No client secret");
    return secret;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a3c11", marginBottom: 8 }}>Sentinel — Asset & Family Protection</div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 36, fontWeight: 600, margin: "0 0 6px" }}>{c.title}</h1>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#b8551f", marginBottom: 18 }}>{c.price}</div>
        <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 26, color: "#1a2940" }}>{c.body}</p>

        <section style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderTop: "3px solid #b8551f", borderRadius: 6, padding: "22px 24px", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, margin: "0 0 14px" }}>{c.docsTitle}</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {c.docs.map((d, i) => {
              const open = openDoc === i;
              return (
                <li key={d.name} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(14,26,43,0.08)", padding: "10px 0" }}>
                  <button type="button" onClick={() => setOpenDoc(open ? null : i)} aria-expanded={open}
                    style={{ background: "transparent", border: 0, padding: 0, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", color: "#0e1a2b", fontSize: 15 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-flex", width: 18, height: 18, borderRadius: "50%", background: "#b8551f", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>✓</span>
                      <span style={{ fontWeight: 500 }}>{d.name}</span>
                    </span>
                    <span aria-hidden style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", border: "1px solid #8a3c11", color: "#8a3c11", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "Georgia, serif", fontStyle: "italic", flexShrink: 0 }}>?</span>
                  </button>
                  {open && (
                    <div role="region" style={{ marginTop: 8, marginLeft: 28, padding: "10px 14px", background: "#faf6ee", border: "1px solid rgba(184,85,31,0.2)", borderRadius: 4, fontSize: 13.5, lineHeight: 1.55, color: "#1a2940" }}>{d.info}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section style={{ background: "#0e1a2b", color: "#f4efe6", borderRadius: 6, borderTop: "3px solid #c9a961", padding: "20px 24px", marginBottom: 18 }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a961", marginBottom: 6 }}>+ $5/mo</div>
          <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>{c.vaultTitle}</h3>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#e6e0d2" }}>{c.vaultBody}</p>
        </section>

        <section style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.12)", borderRadius: 6, padding: "20px 24px", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 20, fontWeight: 600, margin: "0 0 12px" }}>{c.faqTitle}</h2>
          {c.faq.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.q} style={{ borderTop: i === 0 ? "none" : "1px solid rgba(14,26,43,0.08)" }}>
                <button type="button" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}
                  style={{ background: "transparent", border: 0, padding: "12px 0", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left", color: "#0e1a2b", fontSize: 14.5, fontWeight: 600 }}>
                  <span>{f.q}</span>
                  <span aria-hidden style={{ color: "#b8551f", fontSize: 18, lineHeight: 1 }}>{open ? "−" : "+"}</span>
                </button>
                {open && <p style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: "#1a2940" }}>{f.a}</p>}
              </div>
            );
          })}
        </section>

        <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 16, marginBottom: 18 }}>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5 }}>{c.disclaimer}</p>
      </div>
    </div>
  );
}
