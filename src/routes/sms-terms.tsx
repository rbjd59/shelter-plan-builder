import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/sms-terms")({
  head: () => ({
    meta: [
      { title: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
      { property: "og:title", content: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/sms-terms" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "SMS Terms & Opt-In — DetencionDefensa.com" },
      {
        name: "twitter:description",
        content:
          "DetencionDefensa.com SMS program terms: message types, frequency, fees, STOP/HELP, and privacy.",
      },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/sms-terms" }],
  }),
  component: SmsTermsPage,
});

const COPY = {
  en: {
    pageTitle: "SMS Terms & Opt-In — DetencionDefensa.com",
    dates: "Effective date: June 22, 2026    Last updated: June 22, 2026",
    programNameTitle: "Program Name",
    programName: (
      <>
        DetencionDefensa.com Case &amp; Emergency Notifications, operated by{" "}
        <strong className="text-[#f6efe1]">DetencionDefensa.com, Inc.</strong>
      </>
    ),
    optInTitle: "How to Opt In",
    optInIntro: (
      <>
        You opt in to receive SMS messages from DetencionDefensa.com by checking the SMS
        consent box and entering your mobile phone number on our intake form at{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com/intake">
          https://detenciondefensa.com/intake
        </a>
        . The consent checkbox reads, in substance:
      </>
    ),
    optInQuote:
      '"I agree to receive text messages from DetencionDefensa.com, Inc. at the mobile number I provided, including my one-time activation code and emergency-case notifications related to my account. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe or HELP for help. See our SMS Terms and Privacy Policy."',
    optInFooter:
      "By submitting the intake form with this box checked, you provide your express written consent to receive the SMS messages described below.",
    typesTitle: "Types of Messages You Will Receive",
    types: [
      "One-time activation / pairing codes to link your intake form to your phone app.",
      "Case-status notifications related to your DetencionDefensa.com account.",
      "Court-date and document-ready reminders for forms you have generated.",
      "Emergency-activation alerts confirming an alert you triggered, or an all-clear.",
    ],
    freqTitle: "Message Frequency",
    freq: "Message frequency varies based on your activity. Most users receive fewer than 10 messages per month.",
    feesTitle: "Fees",
    fees: (
      <>
        <strong className="text-[#f6efe1]">Message and data rates may apply.</strong> Your
        mobile carrier may charge you for sending and receiving text messages. DetencionDefensa.com
        does not charge you any additional fee for the SMS messages themselves.
      </>
    ),
    stopTitle: "How to Opt Out (STOP)",
    stop: (
      <>
        You can cancel the SMS service at any time. Reply{" "}
        <strong className="text-[#f6efe1]">STOP</strong> to any message you receive from us, and
        you will be unsubscribed. After you send STOP, we will send you a final SMS confirming
        that you have been unsubscribed. After this, you will no longer receive SMS messages
        from us. To rejoin, sign up again as described above.
      </>
    ),
    helpTitle: "Help (HELP)",
    help: (
      <>
        If you need help, reply <strong className="text-[#f6efe1]">HELP</strong> to any message,
        or email{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        .
      </>
    ),
    carriersTitle: "Supported Carriers",
    carriers:
      "Supported carriers include AT&T, T-Mobile, Verizon Wireless, Sprint, Boost, U.S. Cellular, MetroPCS, and most other U.S. carriers. Carriers are not liable for delayed or undelivered messages.",
    privacyTitle: "Privacy",
    privacy1:
      "No mobile information, SMS opt-in data, or consent records will be shared with third parties or affiliates for marketing or promotional purposes. Phone numbers collected for SMS communications are used only to deliver the messages you opted in to receive, and are transmitted solely to our SMS carrier (Twilio) for that delivery.",
    privacy2: (
      <>
        For more information, see our{" "}
        <a className="text-[#e8a04a] underline" href="/privacy">
          Privacy Policy
        </a>
        .
      </>
    ),
    contactTitle: "Contact",
    contact: (
      <>
        DetencionDefensa.com, Inc.
        <br />
        Email:{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        <br />
        Website:{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com">
          https://detenciondefensa.com
        </a>
      </>
    ),
    copyright: "© 2026 DetencionDefensa.com, Inc.",
  },
  es: {
    pageTitle: "Términos de SMS y Suscripción — DetencionDefensa.com",
    dates: "Fecha de vigencia: 22 de junio de 2026    Última actualización: 22 de junio de 2026",
    programNameTitle: "Nombre del Programa",
    programName: (
      <>
        Notificaciones de Caso y Emergencia de DetencionDefensa.com, operado por{" "}
        <strong className="text-[#f6efe1]">DetencionDefensa.com, Inc.</strong>
      </>
    ),
    optInTitle: "Cómo Suscribirse",
    optInIntro: (
      <>
        Usted se suscribe para recibir mensajes de texto (SMS) de DetencionDefensa.com al marcar
        la casilla de consentimiento de SMS e ingresar su número de teléfono móvil en nuestro
        formulario de admisión en{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com/intake">
          https://detenciondefensa.com/intake
        </a>
        . La casilla de consentimiento dice, en esencia:
      </>
    ),
    optInQuote:
      '"Acepto recibir mensajes de texto de DetencionDefensa.com, Inc. al número móvil que proporcioné, incluyendo mi código de activación de un solo uso y notificaciones de caso de emergencia relacionadas con mi cuenta. Pueden aplicarse tarifas de mensajes y datos. La frecuencia de los mensajes varía. Responda STOP para cancelar la suscripción o HELP para obtener ayuda. Consulte nuestros Términos de SMS y Política de Privacidad."',
    optInFooter:
      "Al enviar el formulario de admisión con esta casilla marcada, usted otorga su consentimiento expreso por escrito para recibir los mensajes de SMS descritos a continuación.",
    typesTitle: "Tipos de Mensajes que Recibirá",
    types: [
      "Códigos de activación / emparejamiento de un solo uso para vincular su formulario de admisión con su aplicación móvil.",
      "Notificaciones sobre el estado de su caso relacionadas con su cuenta de DetencionDefensa.com.",
      "Recordatorios de fechas de corte y de documentos listos para los formularios que haya generado.",
      "Alertas de activación de emergencia que confirman una alerta que usted activó, o un aviso de que todo está despejado.",
    ],
    freqTitle: "Frecuencia de los Mensajes",
    freq: "La frecuencia de los mensajes varía según su actividad. La mayoría de los usuarios reciben menos de 10 mensajes por mes.",
    feesTitle: "Tarifas",
    fees: (
      <>
        <strong className="text-[#f6efe1]">Pueden aplicarse tarifas de mensajes y datos.</strong>{" "}
        Su proveedor de servicio móvil puede cobrarle por enviar y recibir mensajes de texto.
        DetencionDefensa.com no le cobra ninguna tarifa adicional por los mensajes de SMS en sí.
      </>
    ),
    stopTitle: "Cómo Cancelar la Suscripción (STOP)",
    stop: (
      <>
        Puede cancelar el servicio de SMS en cualquier momento. Responda{" "}
        <strong className="text-[#f6efe1]">STOP</strong> a cualquier mensaje que reciba de
        nosotros, y quedará dado de baja. Después de enviar STOP, le enviaremos un SMS final
        confirmando que ha sido dado de baja. Después de esto, ya no recibirá mensajes de SMS de
        nuestra parte. Para volver a suscribirse, regístrese nuevamente como se describe
        anteriormente.
      </>
    ),
    helpTitle: "Ayuda (HELP)",
    help: (
      <>
        Si necesita ayuda, responda <strong className="text-[#f6efe1]">HELP</strong> a cualquier
        mensaje, o envíe un correo a{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        .
      </>
    ),
    carriersTitle: "Compañías de Telefonía Compatibles",
    carriers:
      "Las compañías compatibles incluyen AT&T, T-Mobile, Verizon Wireless, Sprint, Boost, U.S. Cellular, MetroPCS, y la mayoría de las demás compañías de EE. UU. Las compañías no son responsables por mensajes retrasados o no entregados.",
    privacyTitle: "Privacidad",
    privacy1:
      "No se compartirá ninguna información móvil, datos de suscripción de SMS ni registros de consentimiento con terceros o afiliados con fines de mercadeo o promoción. Los números de teléfono recopilados para comunicaciones de SMS se usan únicamente para entregar los mensajes que usted aceptó recibir, y se transmiten solo a nuestro proveedor de SMS (Twilio) para dicha entrega.",
    privacy2: (
      <>
        Para más información, consulte nuestra{" "}
        <a className="text-[#e8a04a] underline" href="/privacy">
          Política de Privacidad
        </a>
        .
      </>
    ),
    contactTitle: "Contacto",
    contact: (
      <>
        DetencionDefensa.com, Inc.
        <br />
        Correo electrónico:{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        <br />
        Sitio web:{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com">
          https://detenciondefensa.com
        </a>
      </>
    ),
    copyright: "© 2026 DetencionDefensa.com, Inc.",
  },
  ht: {
    pageTitle: "Kondisyon SMS ak Enskripsyon — DetencionDefensa.com",
    dates: "Dat efektif: 22 jen 2026    Dènye mizajou: 22 jen 2026",
    programNameTitle: "Non Pwogram nan",
    programName: (
      <>
        Notifikasyon Ka ak Ijans DetencionDefensa.com, opere pa{" "}
        <strong className="text-[#f6efe1]">DetencionDefensa.com, Inc.</strong>
      </>
    ),
    optInTitle: "Kijan pou Enskri",
    optInIntro: (
      <>
        Ou enskri pou resevwa mesaj SMS soti nan DetencionDefensa.com lè ou klike sou bwat
        konsantman SMS la epi antre nimewo telefòn selilè ou sou fòm admisyon nou an nan{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com/intake">
          https://detenciondefensa.com/intake
        </a>
        . Bwat konsantman an di, nan sibstans:
      </>
    ),
    optInQuote:
      '"Mwen dakò pou resevwa mesaj tèks nan men DetencionDefensa.com, Inc. nan nimewo selilè mwen bay la, ki gen ladan kòd aktivasyon inik mwen an ak notifikasyon ka ijans ki gen rapò ak kont mwen an. Ka gen frè mesaj ak done ki aplike. Frekans mesaj yo varye. Reponn STOP pou dezabòne oswa HELP pou èd. Gade Kondisyon SMS ak Politik Konfidansyalite nou yo."',
    optInFooter:
      "Lè w soumèt fòm admisyon an ak bwat sa a kliken, ou bay konsantman ekri eksprè ou pou resevwa mesaj SMS ki dekri anba a.",
    typesTitle: "Kalite Mesaj Ou Pral Resevwa",
    types: [
      "Kòd aktivasyon / apèyman inik pou lye fòm admisyon w lan ak aplikasyon telefòn ou.",
      "Notifikasyon estati ka ki gen rapò ak kont DetencionDefensa.com ou.",
      "Rapèl dat tribinal ak dokiman ki pare pou fòm ou te jenere.",
      "Alèt aktivasyon ijans ki konfime yon alèt ou te deklanche, oswa yon siyal tout klè.",
    ],
    freqTitle: "Frekans Mesaj",
    freq: "Frekans mesaj yo varye selon aktivite w. Pifò itilizatè resevwa mwens pase 10 mesaj pa mwa.",
    feesTitle: "Frè",
    fees: (
      <>
        <strong className="text-[#f6efe1]">Ka gen frè mesaj ak done ki aplike.</strong>{" "}
        Konpayi telefòn selilè w la ka fè w peye pou voye ak resevwa mesaj tèks. DetencionDefensa.com
        pa fè w peye okenn lòt frè pou mesaj SMS yo menm.
      </>
    ),
    stopTitle: "Kijan pou Dezabòne (STOP)",
    stop: (
      <>
        Ou ka anile sèvis SMS la nenpòt lè. Reponn{" "}
        <strong className="text-[#f6efe1]">STOP</strong> nan nenpòt mesaj ou resevwa nan men nou,
        e w ap dezabòne. Apre ou voye STOP, n ap voye w yon dènye SMS ki konfime ou dezabòne.
        Apre sa, ou p ap resevwa mesaj SMS nan men nou ankò. Pou re-enskri, enskri ankò jan yo
        dekri pi wo a.
      </>
    ),
    helpTitle: "Èd (HELP)",
    help: (
      <>
        Si w bezwen èd, reponn <strong className="text-[#f6efe1]">HELP</strong> nan nenpòt mesaj,
        oswa voye imèl nan{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        .
      </>
    ),
    carriersTitle: "Konpayi Telefòn ki Sipòte",
    carriers:
      "Konpayi ki sipòte yo enkli AT&T, T-Mobile, Verizon Wireless, Sprint, Boost, U.S. Cellular, MetroPCS, ak pifò lòt konpayi Ozetazini. Konpayi yo pa responsab pou mesaj ki reta oswa ki pa livre.",
    privacyTitle: "Konfidansyalite",
    privacy1:
      "Okenn enfòmasyon selilè, done enskripsyon SMS, oswa dosye konsantman p ap pataje ak twazyèm pati oswa afilye pou rezon maketing oswa pwomosyon. Nimewo telefòn yo rekeyi pou kominikasyon SMS itilize sèlman pou livre mesaj ou te aksepte resevwa yo, e yo transmèt sèlman bay founisè SMS nou an (Twilio) pou livrezon sa a.",
    privacy2: (
      <>
        Pou plis enfòmasyon, gade{" "}
        <a className="text-[#e8a04a] underline" href="/privacy">
          Politik Konfidansyalite
        </a>{" "}
        nou an.
      </>
    ),
    contactTitle: "Kontak",
    contact: (
      <>
        DetencionDefensa.com, Inc.
        <br />
        Imèl:{" "}
        <a className="text-[#e8a04a] underline" href="mailto:legal@detenciondefensa.com">
          legal@detenciondefensa.com
        </a>
        <br />
        Sit entènèt:{" "}
        <a className="text-[#e8a04a] underline" href="https://detenciondefensa.com">
          https://detenciondefensa.com
        </a>
      </>
    ),
    copyright: "© 2026 DetencionDefensa.com, Inc.",
  },
} as const;

function SmsTermsPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f6efe1]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 font-[Fraunces,serif]">
          {t.pageTitle}
        </h1>
        <p className="text-sm text-[#cfc8b8] mb-10">
          {t.dates}
        </p>

        <Section title={t.programNameTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.programName}</p>
        </Section>

        <Section title={t.optInTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.optInIntro}</p>
          <blockquote className="mt-4 mb-4 border-l-4 border-[#e8a04a] pl-4 italic text-[#f6efe1]">
            {t.optInQuote}
          </blockquote>
          <p className="text-[#cfc8b8] leading-relaxed">{t.optInFooter}</p>
        </Section>

        <Section title={t.typesTitle}>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            {t.types.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title={t.freqTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.freq}</p>
        </Section>

        <Section title={t.feesTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.fees}</p>
        </Section>

        <Section title={t.stopTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.stop}</p>
        </Section>

        <Section title={t.helpTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.help}</p>
        </Section>

        <Section title={t.carriersTitle}>
          <p className="text-[#cfc8b8] leading-relaxed">{t.carriers}</p>
        </Section>

        <Section title={t.privacyTitle}>
          <p className="text-[#cfc8b8] leading-relaxed font-semibold">{t.privacy1}</p>
          <p className="text-[#cfc8b8] leading-relaxed mt-4">{t.privacy2}</p>
        </Section>

        <Section title={t.contactTitle}>
          <p className="text-[#f6efe1]">{t.contact}</p>
        </Section>

        <p className="text-xs text-[#6b7a8f] mt-12 text-center">
          {t.copyright}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#f6efe1] mb-3">{title}</h2>
      {children}
    </section>
  );
}
