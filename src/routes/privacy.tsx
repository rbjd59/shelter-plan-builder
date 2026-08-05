import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — DetencionDefensa" },
      {
        name: "description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
      { property: "og:title", content: "Privacy Policy — DetencionDefensa" },
      {
        property: "og:description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/privacy" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — DetencionDefensa" },
      {
        name: "twitter:description",
        content:
          "DetencionDefensa privacy policy — what we collect, how we use it, and your rights.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://detenciondefensa.com/privacy" },
    ],
  }),
  component: PrivacyPage,
});

const COPY = {
  en: {
    title: "Privacy Policy — DetencionDefensa",
    dates: "Effective date: May 25, 2026\u00a0\u00a0Last updated: May 25, 2026",
    intro:
      'This Privacy Policy explains what information DetencionDefensa ("we," "us," "the app") collects, how it is used, and the choices you have. This policy applies to both the DetencionDefensa mobile app and the detenciondefensa.com website.',
    s1title: "Plain-English Summary",
    s1li1:
      "We collect only what you give us to make the emergency alert work: your name, your A-number, your date of birth, your country of origin, your emergency contacts, and your intake answers about your case.",
    s1li2:
      "We use this information only to (a) send your emergency contacts a notification if you press the alert button, and (b) automatically fill out federal court forms (habeas corpus petition, IFP application, civil cover sheet, attorney referral) attached to that notification.",
    s1li3: "We do not track your location.",
    s1li4: "We do not show advertising.",
    s1li5pre:
      "We do not sell or share your data with any third party except the email delivery service that sends your alert (Resend.com), and only at the moment the alert is triggered.",
    s1li6pre: "You can delete your data at any time by emailing",
    s1li6post: ".",
    s2title: "What We Collect",
    s2_1title: "2.1 Information you give us",
    s2_1li1label: "Personal identifiers:",
    s2_1li1: 'First and last name, date of birth, Alien Registration Number ("A-number"), country of citizenship.',
    s2_1li2label: "Emergency contacts:",
    s2_1li2: "Up to two people you designate, including their name, phone, email, and relationship to you.",
    s2_1li3label: "Case intake answers:",
    s2_1li3:
      "Information you enter on the website intake form, including the name and address of the facility where you fear detention, prior immigration history, financial information for in-forma-pauperis applications, and the legal grounds and relief you wish to request in a habeas corpus petition.",
    s2_2title: "2.2 Information collected automatically",
    s2_2li1label: "Device technical information:",
    s2_2li1: "App version, operating system version, language preference.",
    s2_2li2label: "Pairing code:",
    s2_2li2: "A unique 6-digit code (expires in 24 hours) used to link your website intake form to your phone app.",
    s2_3title: "2.3 What we do NOT collect",
    s2_3li1: "We do not request or collect your location.",
    s2_3li2: "We do not access your camera, microphone, contacts list, photos, or files.",
    s2_3li3: "We do not use cookies for tracking or advertising on the website.",
    s2_3li4: "We do not use any analytics SDK that builds a profile of you.",
    s3title: "How We Use Your Information",
    s3p1: "We use the information you provide for one purpose only: to operate the emergency alert system.",
    s3p2: "Specifically:",
    s3li1pre:
      "When you press and hold the red alert button for 3 seconds, the app sends a notification email to (a) the emergency contacts you provided, and (b) the DetencionDefensa legal team inbox at",
    s3li1post: ".",
    s3li2:
      "That email automatically attaches four PDF legal documents pre-filled with your information: Petition for Writ of Habeas Corpus (AO-242), Application to Proceed In Forma Pauperis (AO-240), Civil Cover Sheet (JS-44), and an Attorney Referral / Motion letter.",
    s3li3: 'If you cancel the alert within 2 hours using your 4-digit PIN, an "all-clear" email is sent to the same contacts.',
    s3li4: "We do not use your information for marketing, advertising, profiling, research, or any other purpose.",
    s4title: "Who We Share Information With",
    s4p1: "We share your information only with the following services, only as necessary to deliver the alert, and only at the moment you trigger it:",
    tableService: "Service",
    tablePurpose: "Purpose",
    tableData: "Data shared",
    tRow1Purpose: "Email delivery",
    tRow1Data: "Email addresses of your contacts, the alert message, the attached PDF forms",
    tRow2Purpose: "Hosting our server",
    tRow2Data: "Encrypted-in-transit copies of intake data as it passes through our servers",
    tRow3Purpose: "SMS delivery (activation code, case alerts)",
    tRow3Data: "Your mobile phone number and the SMS message body only",
    s4_1title: "4.1 SMS / Text Messaging Privacy",
    s4_1p1:
      "When you check the SMS consent box on our intake form, you opt in to receive text messages from DetencionDefensa.com, Inc. at the mobile number you provide. Messages include your one-time activation code and emergency-case notifications related to your account. Message frequency varies. Message and data rates may apply. Reply STOP to unsubscribe or HELP for help.",
    s4_1p2:
      "No mobile information, SMS opt-in data, or consent records will be shared with third parties or affiliates for marketing or promotional purposes. Phone numbers collected for SMS communications are used only to deliver the messages you opted in to receive, and are transmitted solely to our SMS carrier (Twilio) for that delivery.",
    s4p2: "We do not share your data with:",
    s4li1: "Advertisers",
    s4li2: "Data brokers",
    s4li3: "Government agencies (unless required by valid legal process, in which case we will notify you when legally permitted)",
    s4li4: "Any other third party",
    s5title: "Where Your Data Is Stored and For How Long",
    s5li1label: "Pairing codes",
    s5li1: "(the 6-digit code linking your website intake to your phone) are stored in server memory and automatically deleted after 24 hours or upon first use, whichever is sooner.",
    s5li2label: "Backup intake logs",
    s5li2: "are retained on the website's database (Lovable / Supabase) for 90 days, then deleted, to allow re-firing a pairing code if delivery to the phone fails.",
    s5li3label: "Your intake answers on your phone",
    s5li3: "are stored locally on your device (encrypted at rest by the operating system) and are sent to our server only at the moment you press the alert button.",
    s5li4: "After the alert is delivered and the PDFs are emailed, our server does not retain a copy of the intake answers.",
    s6title: "Your Rights",
    s6p1: "You may, at any time:",
    s6li1label: "Delete all of your data",
    s6li1mid: "by emailing",
    s6li1post: 'with the subject "Delete my data" — we will remove it within 7 days.',
    s6li2label: "Request a copy",
    s6li2: "of your data we hold, by emailing the same address.",
    s6li3label: "Update or correct",
    s6li3: "any information by editing it in the app or on the website.",
    s6p2: "If you are a resident of California, the EU, or another jurisdiction with specific privacy rights (CCPA, GDPR), the rights above are available to you and we will respond within the timeframes required by your local law.",
    s7title: "Children",
    s7pre: "DetencionDefensa is not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have, contact us at",
    s7post: "and we will delete it.",
    s8title: "Security",
    s8p1: "We use industry-standard security practices including HTTPS / TLS encryption for all data in transit, encrypted storage at rest, single-use pairing codes that expire automatically, rate-limiting to prevent abuse, and minimal data retention.",
    s8p2: "No internet system is 100% secure. If we discover a breach of your data, we will notify you within 72 hours by email.",
    s9title: "Changes to This Policy",
    s9p1: 'If we change this policy, we will update the "Last updated" date at the top of this page and, for material changes, notify users by email or through an in-app notice.',
    s10title: "Contact Us",
    s10p1: "Questions, concerns, or data deletion requests:",
    s10emailLabel: "Email:",
    s10webLabel: "Website:",
    s11title: "Legal Disclaimer",
    s11p1: "DetencionDefensa is a notification and document-translation and typing tool. It is not a law firm and does not provide legal advice. Use of this app does not create an attorney-client relationship. The pre-filled federal court forms generated by the app are based on public-domain U.S. federal templates and the information you provide; their accuracy depends on the accuracy of your input. We strongly encourage you to consult a licensed attorney to review any document before filing.",
    copyright: "\u00a9 2026 DetencionDefensa",
  },
  es: {
    title: "Política de Privacidad — DetencionDefensa",
    dates: "Fecha de vigencia: 25 de mayo de 2026\u00a0\u00a0Última actualización: 25 de mayo de 2026",
    intro:
      'Esta Política de Privacidad explica qué información recopila DetencionDefensa ("nosotros," "la app"), cómo se usa, y las opciones que usted tiene. Esta política aplica tanto a la aplicación móvil de DetencionDefensa como al sitio web detenciondefensa.com.',
    s1title: "Resumen en lenguaje sencillo",
    s1li1:
      "Solo recopilamos lo que usted nos proporciona para que funcione la alerta de emergencia: su nombre, su número A, su fecha de nacimiento, su país de origen, sus contactos de emergencia y sus respuestas de admisión sobre su caso.",
    s1li2:
      "Usamos esta información únicamente para (a) enviar una notificación a sus contactos de emergencia si presiona el botón de alerta, y (b) completar automáticamente formularios de la corte federal (petición de habeas corpus, solicitud IFP, hoja de cubierta civil, referencia de abogado) adjuntos a esa notificación.",
    s1li3: "No rastreamos su ubicación.",
    s1li4: "No mostramos publicidad.",
    s1li5pre:
      "No vendemos ni compartimos sus datos con ningún tercero, excepto el servicio de entrega de correo que envía su alerta (Resend.com), y solo en el momento en que se activa la alerta.",
    s1li6pre: "Puede eliminar sus datos en cualquier momento enviando un correo a",
    s1li6post: ".",
    s2title: "Qué Recopilamos",
    s2_1title: "2.1 Información que usted nos proporciona",
    s2_1li1label: "Identificadores personales:",
    s2_1li1: 'Nombre y apellido, fecha de nacimiento, Número de Registro de Extranjero ("número A"), país de ciudadanía.',
    s2_1li2label: "Contactos de emergencia:",
    s2_1li2: "Hasta dos personas que usted designe, incluyendo su nombre, teléfono, correo electrónico y relación con usted.",
    s2_1li3label: "Respuestas de admisión del caso:",
    s2_1li3:
      "Información que ingresa en el formulario de admisión del sitio web, incluyendo el nombre y dirección de la instalación donde teme ser detenido, historial migratorio previo, información financiera para solicitudes in-forma-pauperis, y los fundamentos legales y el remedio que desea solicitar en una petición de habeas corpus.",
    s2_2title: "2.2 Información recopilada automáticamente",
    s2_2li1label: "Información técnica del dispositivo:",
    s2_2li1: "Versión de la app, versión del sistema operativo, preferencia de idioma.",
    s2_2li2label: "Código de emparejamiento:",
    s2_2li2: "Un código único de 6 dígitos (expira en 24 horas) usado para vincular su formulario de admisión del sitio web con la app de su teléfono.",
    s2_3title: "2.3 Qué NO recopilamos",
    s2_3li1: "No solicitamos ni recopilamos su ubicación.",
    s2_3li2: "No accedemos a su cámara, micrófono, lista de contactos, fotos ni archivos.",
    s2_3li3: "No usamos cookies para rastreo o publicidad en el sitio web.",
    s2_3li4: "No usamos ningún SDK de análisis que cree un perfil sobre usted.",
    s3title: "Cómo Usamos Su Información",
    s3p1: "Usamos la información que proporciona para un solo propósito: operar el sistema de alerta de emergencia.",
    s3p2: "Específicamente:",
    s3li1pre:
      "Cuando presiona y mantiene presionado el botón rojo de alerta durante 3 segundos, la app envía un correo de notificación a (a) los contactos de emergencia que proporcionó, y (b) la bandeja del equipo legal de DetencionDefensa en",
    s3li1post: ".",
    s3li2:
      "Ese correo adjunta automáticamente cuatro documentos legales en PDF prellenados con su información: Petición de Auto de Habeas Corpus (AO-242), Solicitud para Proceder In Forma Pauperis (AO-240), Hoja de Cubierta Civil (JS-44), y una carta de Referencia de Abogado / Moción.",
    s3li3: 'Si cancela la alerta dentro de 2 horas usando su PIN de 4 dígitos, se envía un correo de "todo bien" a los mismos contactos.',
    s3li4: "No usamos su información para marketing, publicidad, creación de perfiles, investigación, ni ningún otro propósito.",
    s4title: "Con Quién Compartimos Información",
    s4p1: "Compartimos su información únicamente con los siguientes servicios, solo cuando es necesario para entregar la alerta, y solo en el momento en que usted la activa:",
    tableService: "Servicio",
    tablePurpose: "Propósito",
    tableData: "Datos compartidos",
    tRow1Purpose: "Entrega de correo electrónico",
    tRow1Data: "Direcciones de correo de sus contactos, el mensaje de alerta, los formularios PDF adjuntos",
    tRow2Purpose: "Alojamiento de nuestro servidor",
    tRow2Data: "Copias cifradas en tránsito de los datos de admisión mientras pasan por nuestros servidores",
    tRow3Purpose: "Entrega de SMS (código de activación, alertas de caso)",
    tRow3Data: "Solo su número de teléfono móvil y el contenido del mensaje SMS",
    s4_1title: "4.1 Privacidad de SMS / Mensajes de Texto",
    s4_1p1:
      "Al marcar la casilla de consentimiento de SMS en nuestro formulario de admisión, usted acepta recibir mensajes de texto de DetencionDefensa.com, Inc. al número móvil que proporcione. Los mensajes incluyen su código de activación de un solo uso y notificaciones de casos de emergencia relacionadas con su cuenta. La frecuencia de los mensajes varía. Pueden aplicar tarifas de mensajes y datos. Responda STOP para cancelar la suscripción o HELP para ayuda.",
    s4_1p2:
      "No se compartirá ninguna información móvil, datos de aceptación de SMS ni registros de consentimiento con terceros o afiliados con fines de marketing o promocionales. Los números de teléfono recopilados para comunicaciones por SMS se usan únicamente para entregar los mensajes que usted aceptó recibir, y se transmiten únicamente a nuestro proveedor de SMS (Twilio) para esa entrega.",
    s4p2: "No compartimos sus datos con:",
    s4li1: "Anunciantes",
    s4li2: "Corredores de datos",
    s4li3: "Agencias gubernamentales (a menos que lo exija un proceso legal válido, en cuyo caso le notificaremos cuando sea legalmente permitido)",
    s4li4: "Ningún otro tercero",
    s5title: "Dónde Se Almacenan Sus Datos y Por Cuánto Tiempo",
    s5li1label: "Códigos de emparejamiento",
    s5li1: "(el código de 6 dígitos que vincula su admisión del sitio web con su teléfono) se almacenan en la memoria del servidor y se eliminan automáticamente después de 24 horas o al primer uso, lo que ocurra primero.",
    s5li2label: "Registros de respaldo de admisión",
    s5li2: "se conservan en la base de datos del sitio web (Lovable / Supabase) durante 90 días, y luego se eliminan, para permitir reenviar un código de emparejamiento si la entrega al teléfono falla.",
    s5li3label: "Sus respuestas de admisión en su teléfono",
    s5li3: "se almacenan localmente en su dispositivo (cifradas en reposo por el sistema operativo) y se envían a nuestro servidor solo en el momento en que presiona el botón de alerta.",
    s5li4: "Después de que se entrega la alerta y se envían los PDF por correo, nuestro servidor no conserva una copia de las respuestas de admisión.",
    s6title: "Sus Derechos",
    s6p1: "Usted puede, en cualquier momento:",
    s6li1label: "Eliminar todos sus datos",
    s6li1mid: "enviando un correo a",
    s6li1post: 'con el asunto "Eliminar mis datos" — los eliminaremos dentro de 7 días.',
    s6li2label: "Solicitar una copia",
    s6li2: "de los datos que tenemos sobre usted, enviando un correo a la misma dirección.",
    s6li3label: "Actualizar o corregir",
    s6li3: "cualquier información editándola en la app o en el sitio web.",
    s6p2: "Si usted es residente de California, la UE, u otra jurisdicción con derechos de privacidad específicos (CCPA, GDPR), los derechos anteriores están disponibles para usted y responderemos dentro de los plazos requeridos por su ley local.",
    s7title: "Niños",
    s7pre: "DetencionDefensa no está dirigido a niños menores de 13 años. No recopilamos a sabiendas información de niños menores de 13 años. Si cree que lo hemos hecho, contáctenos en",
    s7post: "y la eliminaremos.",
    s8title: "Seguridad",
    s8p1: "Usamos prácticas de seguridad estándar de la industria, incluyendo cifrado HTTPS / TLS para todos los datos en tránsito, almacenamiento cifrado en reposo, códigos de emparejamiento de un solo uso que expiran automáticamente, limitación de velocidad para prevenir abusos, y retención mínima de datos.",
    s8p2: "Ningún sistema de internet es 100% seguro. Si descubrimos una violación de sus datos, le notificaremos dentro de 72 horas por correo electrónico.",
    s9title: "Cambios a Esta Política",
    s9p1: 'Si cambiamos esta política, actualizaremos la fecha de "Última actualización" en la parte superior de esta página y, para cambios materiales, notificaremos a los usuarios por correo electrónico o mediante un aviso en la app.',
    s10title: "Contáctenos",
    s10p1: "Preguntas, inquietudes o solicitudes de eliminación de datos:",
    s10emailLabel: "Correo:",
    s10webLabel: "Sitio web:",
    s11title: "Aviso Legal",
    s11p1: "DetencionDefensa es una herramienta de notificación, traducción de documentos y mecanografía. No es un bufete de abogados y no brinda asesoría legal. El uso de esta app no crea una relación abogado-cliente. Los formularios federales prellenados generados por la app se basan en plantillas federales de EE. UU. de dominio público y en la información que usted proporciona; su exactitud depende de la exactitud de su entrada. Le recomendamos encarecidamente consultar a un abogado con licencia para revisar cualquier documento antes de presentarlo.",
    copyright: "\u00a9 2026 DetencionDefensa",
  },
  ht: {
    title: "Politik Konfidansyalite — DetencionDefensa",
    dates: "Dat antre an vigè: 25 me 2026\u00a0\u00a0Dènye mizajou: 25 me 2026",
    intro:
      'Politik Konfidansyalite sa a eksplike ki enfòmasyon DetencionDefensa ("nou," "aplikasyon an") kolekte, kijan yo itilize l, ak chwa ou genyen. Politik sa a aplike ni pou aplikasyon mobil DetencionDefensa ni pou sit entènèt detenciondefensa.com.',
    s1title: "Rezime an Kreyòl Fasil",
    s1li1:
      "Nou sèlman kolekte sa ou ban nou pou fè alèt ijans lan fonksyone: non ou, nimewo A ou, dat nesans ou, peyi orijin ou, kontak ijans ou yo, ak repons ou bay nan admisyon konsènan ka ou.",
    s1li2:
      "Nou itilize enfòmasyon sa a sèlman pou (a) voye yon notifikasyon bay kontak ijans ou yo si ou peze bouton alèt la, ak (b) ranpli otomatikman fòm tribinal federal (petisyon habeas corpus, aplikasyon IFP, fèy kouvèti sivil, referans avoka) ki tache ak notifikasyon sa a.",
    s1li3: "Nou pa suiv kote ou ye.",
    s1li4: "Nou pa montre reklam.",
    s1li5pre:
      "Nou pa vann oswa pataje done ou ak okenn twazyèm pati eksepte sèvis livrezon imèl ki voye alèt ou a (Resend.com), e sèlman nan moman alèt la deklanche.",
    s1li6pre: "Ou ka efase done ou nenpòt lè lè ou voye yon imèl bay",
    s1li6post: ".",
    s2title: "Sa Nou Kolekte",
    s2_1title: "2.1 Enfòmasyon ou ba nou",
    s2_1li1label: "Idantifyan pèsonèl:",
    s2_1li1: 'Non ak siyati, dat nesans, Nimewo Anrejistreman Etranje ("nimewo A"), peyi sitwayènte.',
    s2_1li2label: "Kontak ijans:",
    s2_1li2: "Jiska de moun ou chwazi, ki gen ladan non yo, telefòn, imèl, ak relasyon ak ou.",
    s2_1li3label: "Repons admisyon ka a:",
    s2_1li3:
      "Enfòmasyon ou antre nan fòm admisyon sit entènèt la, tankou non ak adrès etablisman kote ou pè detansyon, istwa imigrasyon anvan, enfòmasyon finansye pou aplikasyon in-forma-pauperis, ak rezon legal ak sekou ou vle mande nan yon petisyon habeas corpus.",
    s2_2title: "2.2 Enfòmasyon kolekte otomatikman",
    s2_2li1label: "Enfòmasyon teknik aparèy la:",
    s2_2li1: "Vèsyon aplikasyon an, vèsyon sistèm opere a, preferans lang.",
    s2_2li2label: "Kòd koneksyon:",
    s2_2li2: "Yon kòd inik 6 chif (ekspire nan 24 èdtan) itilize pou konekte fòm admisyon sit entènèt ou ak aplikasyon telefòn ou.",
    s2_3title: "2.3 Sa nou PA kolekte",
    s2_3li1: "Nou pa mande oswa kolekte kote ou ye.",
    s2_3li2: "Nou pa jwenn aksè kamera, mikwofòn, lis kontak, foto, oswa fichye ou yo.",
    s2_3li3: "Nou pa itilize cookies pou swiv oswa pou reklam sou sit entènèt la.",
    s2_3li4: "Nou pa itilize okenn SDK analiz ki bati yon pwofil sou ou.",
    s3title: "Kijan Nou Itilize Enfòmasyon Ou",
    s3p1: "Nou itilize enfòmasyon ou bay pou yon sèl rezon: fè sistèm alèt ijans lan fonksyone.",
    s3p2: "Espesifikman:",
    s3li1pre:
      "Lè ou peze epi kenbe bouton wouj alèt la pandan 3 segond, aplikasyon an voye yon imèl notifikasyon bay (a) kontak ijans ou te bay yo, ak (b) bwat resepsyon ekip legal DetencionDefensa nan",
    s3li1post: ".",
    s3li2:
      "Imèl sa a otomatikman tache kat dokiman legal PDF ranpli davans ak enfòmasyon ou: Petisyon pou Manda Habeas Corpus (AO-242), Aplikasyon pou Pwosede In Forma Pauperis (AO-240), Fèy Kouvèti Sivil (JS-44), ak yon lèt Referans Avoka / Mosyon.",
    s3li3: 'Si ou anile alèt la nan lespas 2 èdtan lè w itilize PIN 4 chif ou, yon imèl "tout bagay anfòm" ap voye bay menm kontak yo.',
    s3li4: "Nou pa itilize enfòmasyon ou pou maketing, piblisite, kreyasyon pwofil, rechèch, oswa nenpòt lòt objektif.",
    s4title: "Ak Ki Moun Nou Pataje Enfòmasyon",
    s4p1: "Nou pataje enfòmasyon ou sèlman ak sèvis annapre yo, sèlman lè sa nesesè pou livre alèt la, e sèlman nan moman ou deklanche l:",
    tableService: "Sèvis",
    tablePurpose: "Objektif",
    tableData: "Done pataje",
    tRow1Purpose: "Livrezon imèl",
    tRow1Data: "Adrès imèl kontak ou yo, mesaj alèt la, fòm PDF tache yo",
    tRow2Purpose: "Ebèjman sèvè nou an",
    tRow2Data: "Kopi kripte pandan transpò done admisyon yo pandan yo pase nan sèvè nou yo",
    tRow3Purpose: "Livrezon SMS (kòd aktivasyon, alèt ka)",
    tRow3Data: "Sèlman nimewo telefòn mobil ou ak kò mesaj SMS la",
    s4_1title: "4.1 Konfidansyalite SMS / Mesaj Tèks",
    s4_1p1:
      "Lè ou koche kaz konsantman SMS la nan fòm admisyon nou an, ou aksepte resevwa mesaj tèks nan men DetencionDefensa.com, Inc. nan nimewo mobil ou bay la. Mesaj yo gen ladan kòd aktivasyon yon sèl fwa ou ak notifikasyon ka ijans ki gen rapò ak kont ou. Frekans mesaj yo varye. Frè mesaj ak done ka aplike. Reponn STOP pou dezabòne oswa HELP pou èd.",
    s4_1p2:
      "Okenn enfòmasyon mobil, done konsantman SMS, oswa dosye konsantman p ap pataje ak twazyèm pati oswa afilye pou objektif maketing oswa pwomosyon. Nimewo telefòn kolekte pou kominikasyon SMS itilize sèlman pou livre mesaj ou te aksepte resevwa yo, e yo transmèt sèlman bay founisè SMS nou an (Twilio) pou livrezon sa a.",
    s4p2: "Nou pa pataje done ou ak:",
    s4li1: "Anonsè",
    s4li2: "Konpayi ki vann done",
    s4li3: "Ajans gouvènman (sof si yon pwosesis legal valab egzije sa, nan ka sa a n ap notifye ou lè lalwa pèmèt sa)",
    s4li4: "Nenpòt lòt twazyèm pati",
    s5title: "Kote Done Ou Estoke ak Pou Konbyen Tan",
    s5li1label: "Kòd koneksyon",
    s5li1: "(kòd 6 chif ki konekte admisyon sit ou ak telefòn ou) estoke nan memwa sèvè a e otomatikman efase apre 24 èdtan oswa nan premye itilizasyon, kèlkeswa sa ki vini anvan.",
    s5li2label: "Dosye sovgad admisyon",
    s5li2: "kenbe nan baz done sit entènèt la (Lovable / Supabase) pandan 90 jou, apre sa efase, pou pèmèt refè yon kòd koneksyon si livrezon nan telefòn nan echwe.",
    s5li3label: "Repons admisyon ou sou telefòn ou",
    s5li3: "estoke lokalman sou aparèy ou (kripte nan repo pa sistèm opere a) e voye bay sèvè nou an sèlman nan moman ou peze bouton alèt la.",
    s5li4: "Apre alèt la livre e PDF yo voye pa imèl, sèvè nou an pa kenbe yon kopi repons admisyon yo.",
    s6title: "Dwa Ou Yo",
    s6p1: "Ou ka, nenpòt lè:",
    s6li1label: "Efase tout done ou",
    s6li1mid: "lè ou voye yon imèl bay",
    s6li1post: 'ak sijè "Efase done mwen" — n ap retire yo nan lespas 7 jou.',
    s6li2label: "Mande yon kopi",
    s6li2: "done nou genyen sou ou, lè ou voye yon imèl nan menm adrès la.",
    s6li3label: "Mete ajou oswa korije",
    s6li3: "nenpòt enfòmasyon lè ou modifye l nan aplikasyon an oswa sou sit entènèt la.",
    s6p2: "Si ou se rezidan Kalifòni, Inyon Ewopeyèn, oswa yon lòt jiridiksyon ak dwa konfidansyalite espesifik (CCPA, GDPR), dwa ki anwo yo disponib pou ou e n ap reponn nan delè lalwa lokal ou egzije.",
    s7title: "Timoun",
    s7pre: "DetencionDefensa pa dirije vè timoun ki poko gen 13 an. Nou pa kolekte konsyaman enfòmasyon nan men timoun ki poko gen 13 an. Si ou kwè nou fè sa, kontakte nou nan",
    s7post: "e n ap efase l.",
    s8title: "Sekirite",
    s8p1: "Nou itilize pratik sekirite estanda endistri a tankou kriptaj HTTPS / TLS pou tout done pandan transpò, estokaj kripte nan repo, kòd koneksyon yon sèl itilizasyon ki ekspire otomatikman, limit vitès pou anpeche abi, ak retansyon minim done.",
    s8p2: "Okenn sistèm entènèt pa 100% sekirize. Si nou dekouvri yon vyolasyon done ou, n ap notifye ou nan lespas 72 èdtan pa imèl.",
    s9title: "Chanjman nan Politik Sa a",
    s9p1: 'Si nou chanje politik sa a, n ap mete ajou dat "Dènye mizajou" a anlè paj sa a e, pou chanjman enpòtan, n ap notifye itilizatè yo pa imèl oswa atravè yon avi nan aplikasyon an.',
    s10title: "Kontakte Nou",
    s10p1: "Kesyon, enkyetid, oswa demand pou efase done:",
    s10emailLabel: "Imèl:",
    s10webLabel: "Sit entènèt:",
    s11title: "Dega Legal",
    s11p1: "DetencionDefensa se yon zouti notifikasyon, tradiksyon dokiman, ak tapaj. Se pa yon biwo avoka e li pa bay konsèy legal. Itilizasyon aplikasyon sa a pa kreye yon relasyon avoka-kliyan. Fòm federal ranpli davans yo aplikasyon an jenere yo baze sou modèl federal domèn piblik Etazini ak enfòmasyon ou bay; egzaktitid yo depann de egzaktitid antre ou. Nou ankouraje w fòtman konsilte yon avoka ki gen lisans pou revize nenpòt dokiman anvan ou depoze l.",
    copyright: "\u00a9 2026 DetencionDefensa",
  },
} as const;

function PrivacyPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f6efe1]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 font-[Fraunces,serif]">
          {t.title}
        </h1>
        <p className="text-sm text-[#cfc8b8] mb-10">
          {t.dates}
        </p>

        <p className="text-[#cfc8b8] mb-8 leading-relaxed">
          {t.intro}
        </p>

        <Section num="1" title={t.s1title}>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>{t.s1li1}</li>
            <li>{t.s1li2}</li>
            <li>{t.s1li3}</li>
            <li>{t.s1li4}</li>
            <li>{t.s1li5pre}</li>
            <li>
              {t.s1li6pre}{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>
              {t.s1li6post}
            </li>
          </ul>
        </Section>

        <Section num="2" title={t.s2title}>
          <SubSection title={t.s2_1title}>
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>
                <strong className="text-[#f6efe1]">{t.s2_1li1label}</strong> {t.s2_1li1}
              </li>
              <li>
                <strong className="text-[#f6efe1]">{t.s2_1li2label}</strong> {t.s2_1li2}
              </li>
              <li>
                <strong className="text-[#f6efe1]">{t.s2_1li3label}</strong> {t.s2_1li3}
              </li>
            </ul>
          </SubSection>

          <SubSection title={t.s2_2title}>
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>
                <strong className="text-[#f6efe1]">{t.s2_2li1label}</strong> {t.s2_2li1}
              </li>
              <li>
                <strong className="text-[#f6efe1]">{t.s2_2li2label}</strong> {t.s2_2li2}
              </li>
            </ul>
          </SubSection>

          <SubSection title={t.s2_3title}>
            <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
              <li>{t.s2_3li1}</li>
              <li>{t.s2_3li2}</li>
              <li>{t.s2_3li3}</li>
              <li>{t.s2_3li4}</li>
            </ul>
          </SubSection>
        </Section>

        <Section num="3" title={t.s3title}>
          <p className="text-[#cfc8b8] leading-relaxed mb-4">{t.s3p1}</p>
          <p className="text-[#f6efe1] font-semibold mb-2">{t.s3p2}</p>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              {t.s3li1pre}{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>
              {t.s3li1post}
            </li>
            <li>{t.s3li2}</li>
            <li>{t.s3li3}</li>
            <li>{t.s3li4}</li>
          </ul>
        </Section>

        <Section num="4" title={t.s4title}>
          <p className="text-[#cfc8b8] leading-relaxed mb-4">{t.s4p1}</p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-[#3a4458]">
              <thead>
                <tr className="bg-[#1a2436]">
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    {t.tableService}
                  </th>
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    {t.tablePurpose}
                  </th>
                  <th className="text-left px-4 py-2 text-[#f6efe1] border-b border-[#3a4458]">
                    {t.tableData}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#3a4458]">
                  <td className="px-4 py-2 text-[#f6efe1]">Resend.com</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow1Purpose}</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow1Data}</td>
                </tr>
                <tr className="border-b border-[#3a4458]">
                  <td className="px-4 py-2 text-[#f6efe1]">Replit</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow2Purpose}</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow2Data}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-[#f6efe1]">Twilio</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow3Purpose}</td>
                  <td className="px-4 py-2 text-[#cfc8b8]">{t.tRow3Data}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <SubSection title={t.s4_1title}>
            <p className="text-[#cfc8b8] leading-relaxed mb-3">{t.s4_1p1}</p>
            <p className="text-[#cfc8b8] leading-relaxed font-semibold">{t.s4_1p2}</p>
          </SubSection>

          <p className="text-[#f6efe1] font-semibold mb-2">{t.s4p2}</p>
          <ul className="list-disc pl-5 space-y-1 text-[#cfc8b8] leading-relaxed">
            <li>{t.s4li1}</li>
            <li>{t.s4li2}</li>
            <li>{t.s4li3}</li>
            <li>{t.s4li4}</li>
          </ul>

        </Section>

        <Section num="5" title={t.s5title}>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              <strong className="text-[#f6efe1]">{t.s5li1label}</strong> {t.s5li1}
            </li>
            <li>
              <strong className="text-[#f6efe1]">{t.s5li2label}</strong> {t.s5li2}
            </li>
            <li>
              <strong className="text-[#f6efe1]">{t.s5li3label}</strong> {t.s5li3}
            </li>
            <li>{t.s5li4}</li>
          </ul>
        </Section>

        <Section num="6" title={t.s6title}>
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            {t.s6p1}
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#cfc8b8] leading-relaxed">
            <li>
              <strong className="text-[#f6efe1]">{t.s6li1label}</strong> {t.s6li1mid}{" "}
              <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
                legal@detenciondefensa.com
              </a>{" "}
              {t.s6li1post}
            </li>
            <li>
              <strong className="text-[#f6efe1]">{t.s6li2label}</strong> {t.s6li2}
            </li>
            <li>
              <strong className="text-[#f6efe1]">{t.s6li3label}</strong> {t.s6li3}
            </li>
          </ul>
          <p className="text-[#cfc8b8] leading-relaxed mt-4">
            {t.s6p2}
          </p>
        </Section>

        <Section num="7" title={t.s7title}>
          <p className="text-[#cfc8b8] leading-relaxed">
            {t.s7pre}{" "}
            <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
              legal@detenciondefensa.com
            </a>{" "}
            {t.s7post}
          </p>
        </Section>

        <Section num="8" title={t.s8title}>
          <p className="text-[#cfc8b8] leading-relaxed mb-4">
            {t.s8p1}
          </p>
          <p className="text-[#cfc8b8] leading-relaxed">
            {t.s8p2}
          </p>
        </Section>

        <Section num="9" title={t.s9title}>
          <p className="text-[#cfc8b8] leading-relaxed">
            {t.s9p1}
          </p>
        </Section>

        <Section num="10" title={t.s10title}>
          <p className="text-[#cfc8b8] leading-relaxed mb-1">{t.s10p1}</p>
          <p className="text-[#f6efe1]">
            DetencionDefensa<br />
            {t.s10emailLabel}{" "}
            <a href="mailto:legal@detenciondefensa.com" className="text-[#e8a04a] underline">
              legal@detenciondefensa.com
            </a>
            <br />
            {t.s10webLabel}{" "}
            <a href="https://detenciondefensa.com" className="text-[#e8a04a] underline">
              https://detenciondefensa.com
            </a>
          </p>
        </Section>

        <Section num="11" title={t.s11title}>
          <p className="text-[#cfc8b8] leading-relaxed">
            {t.s11p1}
          </p>
        </Section>

        <p className="text-xs text-[#6b7a8f] mt-12 text-center">
          {t.copyright}
        </p>
      </div>
    </div>
  );
}

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#f6efe1] mb-3">
        {num}. {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-[#f6efe1] mb-2">{title}</h3>
      {children}
    </div>
  );
}
