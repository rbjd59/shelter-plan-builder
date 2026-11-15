import type { ScreeningFinding } from "./legal-screening";

export const SCREENING_STEPS = [
  {
    key: "status",
    values: [
      "valid_tps",
      "expired_tps",
      "daca",
      "pending_asylum",
      "overstay",
      "undocumented",
      "valid_visa",
      "green_card",
      "other",
      "unknown",
    ],
  },
  { key: "time", values: ["under1", "1to10", "10plus"] },
  { key: "prior", values: ["yes", "no", "unknown"] },
  { key: "family", values: ["usc_spouse", "usc_child21", "lpr_family", "none", "unknown"] },
  { key: "children", values: ["yes", "no", "unknown"] },
  { key: "vehicle", values: ["yes", "no", "unknown"] },
  { key: "detention", values: ["none", "undersix", "sixplus", "unknown"] },
  { key: "entry", values: ["inspected", "parole", "without_check", "unknown"] },
  { key: "missed", values: ["court", "ice", "both", "no", "unknown"] },
  { key: "fear", values: ["yes", "no", "unknown"] },
  { key: "changed", values: ["yes", "no", "unknown"] },
  { key: "asylumFiled", values: ["yes", "no", "unknown"] },
  { key: "returned", values: ["yes", "no", "unknown"] },
  { key: "hardship", values: ["yes", "no", "unknown"] },
  { key: "crime", values: ["yes", "no", "unknown"] },
  { key: "home", values: ["yes", "no", "unknown"] },
  { key: "business", values: ["yes", "no", "unknown"] },
  { key: "equipment", values: ["yes", "no", "unknown"] },
  { key: "departure", values: ["considering", "no", "unknown"] },
  { key: "funds", values: ["yes", "no", "unknown"] },
  { key: "documents", values: ["yes", "no", "unknown"] },
] as const;

export const SCREENING_SIMPLE = {
  en: {
    questions: [
      "What papers or permission do you have to stay in the U.S. now?",
      "How long have you lived in the U.S.?",
      "Has a judge or immigration officer ever told you to leave the U.S.?",
      "Which of these people in your family has U.S. citizenship or a green card?",
      "Do you have children under age 18 who need someone to care for them?",
      "Is a car, truck or van in your name?",
      "Is ICE holding you now?",
      "How were you let into the U.S. on your last trip here?",
      "Have you missed a court date or an ICE check-in?",
      "Are you afraid someone would hurt you if you returned to your country?",
      "Has something changed that affects your fear, or did illness or another serious problem delay an asylum request?",
      "Have you already sent in an asylum application?",
      "Have you ever left or been sent out of the U.S. and then come back?",
      "Would your U.S. citizen or green-card spouse, parent or child face very serious problems without you?",
      "Have you ever been arrested, charged or found guilty of a crime?",
      "Do you own a home?",
      "Do you have a business or regular customers, such as lawns, pools or cleaning?",
      "Do you own work tools or equipment?",
      "Are you thinking about leaving the U.S.?",
      "Do you have money ready for travel, bills and a place to live?",
      "Do you have a current passport or other travel papers?",
    ],
    options: [
      [
        "TPS: temporary protection that is still in effect",
        "TPS that ended or may have ended",
        "DACA: permission to delay removal",
        "I applied for asylum and am waiting",
        "My permitted stay ended and I stayed",
        "I have no current papers to stay",
        "My visa stay is still allowed",
        "I have a green card",
        "Something else",
        "Not sure",
      ],
      ["Less than one year", "One year to less than ten years", "Ten years or more"],
      ["Yes", "No", "Not sure"],
      [
        "My husband or wife is a U.S. citizen",
        "My son or daughter is a U.S. citizen and is at least 21",
        "My husband, wife, mother or father has a green card",
        "None of these",
        "Not sure",
      ],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Not detained", "Held less than six months", "Held six months or more", "Not sure"],
      [
        "An officer checked my papers and let me in",
        "An officer gave me temporary permission called parole",
        "I came in without an officer letting me in",
        "Not sure",
      ],
      ["A court date", "An ICE check-in", "Both", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["I am thinking about leaving", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
      ["Yes", "No", "Not sure"],
    ],
    local: [
      "What country are you a citizen of?",
      "When did you last arrive in the U.S.?",
      "If you filed for asylum, when did you send it?",
      "When did your permission to stay end, if it ended?",
      "If you might leave, what country would you ask to live in?",
      "Write a country name, or leave blank if unsure.",
      "If you do not know a date, leave it blank. Do not guess.",
      "These details stay on this page. A country name or date alone does not decide your case.",
    ],
    result: [
      "Based on what you told us, here is what to ask a lawyer.",
      "No personal chance of winning is shown. This check cannot decide your case.",
      "Ask what help the law allows and get the price in writing. A big fee does not promise a win. Do not miss deadlines.",
      "Plan for your home, work and family too. Paid services are optional.",
      "Ask about keeping, renting or selling your home. Ask a lender about loans before detention. Approval is not promised.",
      "Your customers and tools may have value. Ask how to keep, sell or pass on your business. Setup costs and broker fees apply.",
      "List your tools, who owns them and any loans. Choose someone who can help with them.",
      "A lawyer must check whether you can ask a judge about release. Six months alone is not enough. This check does not unlock court papers.",
      "If you may leave, ask a lawyer first. Leaving can affect your case and your right to return. Voluntary departure has rules; it is not automatic. Another country must allow you to enter and stay. Plan travel papers, children, housing, bills and money.",
    ],
    findings: {
      status:
        "Without current permission, changing your status may be hard. A lawyer must check your entry, papers and any exceptions.",
      tps: "TPS is temporary. Check whether it still applies to you. TPS alone does not give you a green card.",
      daca: "DACA alone does not give you a green card. Ask about other options.",
      pending:
        "Waiting for asylum is not the same as approval. Keep your filing papers and court dates.",
      asylum_timely:
        "Asylum usually must be filed within one year of your last arrival. Being here less than a year does not mean you qualify.",
      asylum_deadline:
        "If you have not filed for asylum, the usual one-year deadline may matter. Some exceptions apply. A filing made on time does not become late just because time passes.",
      cancellation10:
        "Ten years here is only one rule for one type of court help. Family hardship, your history and other rules also matter.",
      cancellation_short:
        "Your answer does not show ten years here. That may limit one type of court help, not every option.",
      prior:
        "An old order to leave needs fast review. It does not by itself prove every option is closed.",
      prior_unknown: "Not knowing if there is an order means a lawyer needs to check your records.",
      immediate:
        "Your U.S. citizen husband, wife or adult child may be able to file family papers. That does not by itself give you a green card.",
      lpr: "A family member with a green card may be able to file papers. Age, marriage, wait times and other rules matter.",
      no_family:
        "Not having these relatives does not rule out all help. Ask about fear, harm, other family and work options.",
      entry:
        "How you entered matters. Entry with permission and entry without a check have different rules. A lawyer needs your actual papers.",
      missed:
        "A missed court date or ICE visit needs fast review. Do not skip future dates. A missed court date may lead to an order to leave.",
      fear: "Tell a lawyer why you fear returning. Fear alone does not prove an asylum claim, but other protection may also need review.",
      changed:
        "Changed conditions or a serious delay may affect a late asylum request. A lawyer must check the reason, dates and proof. This is not the same as changing visa status.",
      filed:
        "Keep proof of when you filed for asylum. An application filed on time is not late just because you have lived here longer.",
      returned:
        "Leaving and returning can change your options. An old removal followed by return without permission can cause serious limits.",
      hardship:
        "Very serious harm to certain family members may matter for court help. A lawyer must check which relative, the harm and all other rules.",
      crime:
        "Bring arrest and court records to a lawyer. An arrest alone does not mean you were found guilty, but some crimes limit options.",
      departure:
        "Do not leave based on this check. Ask about your case, travel papers, entry to another country and possible limits on returning to the U.S.",
      valid_status:
        "A visa or green card needs its own review. A visa stamp is not the same as the date you may stay until.",
      status_unknown:
        "Bring your immigration papers to a lawyer so they can check what permission you have.",
      family_unknown:
        "Ask your relative to confirm citizenship or green-card status. Do not guess.",
    },
  },
  es: {
    questions: [
      "¿Qué papeles o permiso tiene para quedarse en EE.UU. ahora?",
      "¿Cuánto tiempo lleva viviendo en EE.UU.?",
      "¿Un juez o agente de inmigración le ha dicho que salga de EE.UU.?",
      "¿Quién en su familia tiene ciudadanía de EE.UU. o tarjeta verde?",
      "¿Tiene hijos menores de 18 años que necesitan alguien que los cuide?",
      "¿Hay un carro, camión o camioneta a su nombre?",
      "¿ICE lo tiene detenido ahora?",
      "¿Cómo le permitieron entrar a EE.UU. la última vez?",
      "¿Ha faltado a la corte o a una cita con ICE?",
      "¿Teme que alguien le haga daño si vuelve a su país?",
      "¿Cambió algo que afecta su miedo, o una enfermedad u otro problema grave retrasó su solicitud de asilo?",
      "¿Ya envió una solicitud de asilo?",
      "¿Salió o lo sacaron de EE.UU. y luego volvió?",
      "¿Su esposo, esposa, padre, madre o hijo ciudadano o con tarjeta verde tendría problemas muy graves sin usted?",
      "¿Lo han arrestado, acusado o declarado culpable de un delito?",
      "¿Es dueño de una casa?",
      "¿Tiene negocio o clientes fijos, como jardines, piscinas o limpieza?",
      "¿Es dueño de herramientas o equipos de trabajo?",
      "¿Está pensando en salir de EE.UU.?",
      "¿Tiene dinero listo para viajes, cuentas y un lugar donde vivir?",
      "¿Tiene pasaporte vigente u otros papeles para viajar?",
    ],
    options: [
      [
        "TPS: protección temporal que sigue vigente",
        "TPS que terminó o puede haber terminado",
        "DACA: permiso para retrasar la deportación",
        "Pedí asilo y estoy esperando",
        "Mi permiso para quedarme terminó y me quedé",
        "No tengo papeles vigentes para quedarme",
        "Mi permiso de estadía con visa sigue vigente",
        "Tengo tarjeta verde",
        "Otra cosa",
        "No sé",
      ],
      ["Menos de un año", "De un año a menos de diez", "Diez años o más"],
      ["Sí", "No", "No sé"],
      [
        "Mi esposo o esposa es ciudadano de EE.UU.",
        "Mi hijo o hija es ciudadano de EE.UU. y tiene 21 años o más",
        "Mi esposo, esposa, madre o padre tiene tarjeta verde",
        "Ninguno de estos",
        "No sé",
      ],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["No detenido", "Menos de seis meses", "Seis meses o más", "No sé"],
      [
        "Un agente revisó mis papeles y me dejó entrar",
        "Un agente me dio permiso temporal llamado parole",
        "Entré sin que un agente me dejara entrar",
        "No sé",
      ],
      ["Una fecha en la corte", "Una cita con ICE", "Ambas", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Estoy pensando en salir", "No", "No sé"],
      ["Sí", "No", "No sé"],
      ["Sí", "No", "No sé"],
    ],
    local: [
      "¿De qué país es ciudadano?",
      "¿Cuándo llegó a EE.UU. la última vez?",
      "Si pidió asilo, ¿cuándo envió la solicitud?",
      "¿Cuándo terminó su permiso para quedarse, si terminó?",
      "Si piensa salir, ¿en qué país pediría vivir?",
      "Escriba el país o deje vacío si no sabe.",
      "Si no sabe una fecha, deje vacío. No adivine.",
      "Estos datos quedan en esta página. El país o una fecha no deciden su caso.",
    ],
    result: [
      "Según lo que nos dijo, esto debe preguntar al abogado.",
      "No mostramos su posibilidad de ganar. Esta revisión no decide su caso.",
      "Pregunte qué ayuda permite la ley y pida el precio por escrito. Pagar mucho no promete ganar. No pierda plazos.",
      "Planee también para su casa, trabajo y familia. Los servicios pagados son opcionales.",
      "Pregunte cómo conservar, alquilar o vender su casa. Pregunte por préstamos antes de la detención. No se promete aprobación.",
      "Sus clientes y equipos pueden tener valor. Pregunte cómo conservar, vender o traspasar el negocio. Hay costos de creación y comisiones.",
      "Liste herramientas, dueños y préstamos. Elija a alguien para ayudar con ellas.",
      "Un abogado debe ver si puede pedir al juez revisar la detención. Seis meses no bastan. Esta revisión no desbloquea papeles de la corte.",
      "Si piensa salir, pregunte al abogado primero. Salir puede afectar su caso y su derecho a volver. La salida voluntaria tiene reglas; no es automática. Otro país debe permitirle entrar y quedarse. Planee papeles de viaje, hijos, vivienda, cuentas y dinero.",
    ],
    findings: {
      status:
        "Sin permiso vigente, cambiar su estatus puede ser difícil. Un abogado debe revisar entrada, papeles y excepciones.",
      tps: "TPS es temporal. Revise si todavía lo cubre. TPS solo no da tarjeta verde.",
      daca: "DACA solo no da tarjeta verde. Pregunte por otras opciones.",
      pending: "Esperar asilo no es tener aprobación. Guarde pruebas y fechas de corte.",
      asylum_timely:
        "Normalmente debe pedir asilo dentro de un año de su última llegada. Estar aquí menos de un año no significa que califica.",
      asylum_deadline:
        "Si no pidió asilo, el plazo normal de un año puede importar. Hay excepciones. Una solicitud a tiempo no se vuelve tarde al pasar los años.",
      cancellation10:
        "Diez años aquí son solo una regla para una ayuda de la corte. También importan el daño a la familia, su historial y otras reglas.",
      cancellation_short:
        "Su respuesta no muestra diez años aquí. Puede limitar una ayuda de la corte, no todas las opciones.",
      prior:
        "Una orden de salir necesita revisión rápida. Por sí sola no prueba que todas las opciones estén cerradas.",
      prior_unknown: "Si no sabe si hay orden, un abogado debe revisar los registros.",
      immediate:
        "Su esposo, esposa o hijo adulto ciudadano puede pedirlo. Eso solo no da tarjeta verde.",
      lpr: "Un familiar con tarjeta verde puede pedirlo. Importan edad, matrimonio, espera y otras reglas.",
      no_family:
        "No tener estos familiares no descarta toda ayuda. Pregunte por miedo, daño, otros familiares y trabajo.",
      entry:
        "Cómo entró importa. Entrar con permiso o sin revisión tiene reglas distintas. El abogado necesita sus papeles.",
      missed:
        "Faltar a la corte o ICE necesita revisión rápida. No falte a futuras citas. Faltar a la corte puede causar una orden de salir.",
      fear: "Diga al abogado por qué teme volver. El miedo solo no prueba asilo, pero puede haber otras protecciones.",
      changed:
        "Un cambio o retraso grave puede afectar asilo tardío. El abogado debe revisar razones, fechas y pruebas. No es lo mismo que cambiar estatus de visa.",
      filed:
        "Guarde prueba de cuándo pidió asilo. Una solicitud a tiempo no se vuelve tarde por vivir aquí más años.",
      returned:
        "Salir y volver puede cambiar sus opciones. Una deportación seguida de entrada sin permiso puede causar límites graves.",
      hardship:
        "Un daño muy grave a ciertos familiares puede importar. El abogado debe revisar quién, el daño y las otras reglas.",
      crime:
        "Lleve registros de arresto y corte al abogado. Un arresto no significa culpabilidad, pero algunos delitos limitan opciones.",
      departure:
        "No salga por esta revisión. Pregunte por su caso, papeles, entrada a otro país y límites para volver a EE.UU.",
      valid_status:
        "Una visa o tarjeta verde necesita revisión propia. El sello de visa no es la fecha hasta la que puede quedarse.",
      status_unknown: "Lleve sus papeles al abogado para ver qué permiso tiene.",
      family_unknown: "Pida al familiar confirmar ciudadanía o tarjeta verde. No adivine.",
    },
  },
  ht: {
    questions: [
      "Ki papye oswa pèmisyon ou genyen pou rete Etazini kounye a?",
      "Konbyen tan ou ap viv Etazini?",
      "Èske yon jij oswa ajan imigrasyon te di ou kite Etazini?",
      "Kiyès nan fanmi ou ki sitwayen ameriken oswa ki gen kat vèt?",
      "Èske ou gen timoun anba 18 an ki bezwen yon moun pran swen yo?",
      "Èske yon machin, kamyon oswa kamyonèt sou non ou?",
      "Èske ICE kenbe ou kounye a?",
      "Kijan yo te kite ou antre Etazini dènye fwa a?",
      "Èske ou rate yon dat tribinal oswa randevou ICE?",
      "Èske ou pè yon moun fè ou mal si ou retounen nan peyi ou?",
      "Èske yon bagay chanje ki afekte laperèz ou, oswa maladi oswa yon lòt gwo pwoblèm te retade demann azil ou?",
      "Èske ou deja voye yon demann azil?",
      "Èske ou te kite oswa yo te voye ou soti Etazini epi ou tounen?",
      "Èske mari, madanm, paran oswa pitit ou ki sitwayen oswa gen kat vèt ta gen gwo pwoblèm san ou?",
      "Èske yo te arete, akize oswa jwenn ou koupab pou yon krim?",
      "Èske ou posede yon kay?",
      "Èske ou gen biznis oswa kliyan regilye pou gazon, pisin oswa netwayaj?",
      "Èske ou posede zouti oswa ekipman travay?",
      "Èske ou ap panse kite Etazini?",
      "Èske ou gen lajan pare pou vwayaj, bòdwo ak yon kote pou rete?",
      "Èske ou gen yon paspò valab oswa lòt papye vwayaj?",
    ],
    options: [
      [
        "TPS: pwoteksyon tanporè ki toujou valab",
        "TPS ki fini oswa ki ka fini",
        "DACA: pèmisyon pou retade depòtasyon",
        "Mwen mande azil epi mwen ap tann",
        "Pèmisyon pou rete mwen fini epi mwen rete",
        "Mwen pa gen papye valab pou rete",
        "Pèmisyon sejou ak viza mwen toujou valab",
        "Mwen gen kat vèt",
        "Yon lòt bagay",
        "Mwen pa konnen",
      ],
      ["Mwens pase yon ane", "Yon ane rive mwens pase dis", "Dis ane oswa plis"],
      ["Wi", "Non", "Mwen pa konnen"],
      [
        "Mari oswa madanm mwen sitwayen ameriken",
        "Pitit mwen sitwayen ameriken epi li gen omwen 21 an",
        "Mari, madanm, manman oswa papa mwen gen kat vèt",
        "Okenn nan sa yo",
        "Mwen pa konnen",
      ],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Pa detni", "Mwens pase sis mwa", "Sis mwa oswa plis", "Mwen pa konnen"],
      [
        "Yon ajan tcheke papye mwen epi kite mwen antre",
        "Yon ajan ban mwen pèmisyon tanporè yo rele parole",
        "Mwen antre san yon ajan kite mwen antre",
        "Mwen pa konnen",
      ],
      ["Yon dat tribinal", "Yon randevou ICE", "Toude", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Mwen ap panse kite", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
      ["Wi", "Non", "Mwen pa konnen"],
    ],
    local: [
      "Nan ki peyi ou gen sitwayènte?",
      "Kilè ou te rive Etazini dènye fwa a?",
      "Si ou mande azil, kilè ou te voye demann lan?",
      "Kilè pèmisyon pou rete ou te fini, si li fini?",
      "Si ou ka kite, nan ki peyi ou ta mande viv?",
      "Ekri non peyi a oswa kite vid si ou pa konnen.",
      "Si ou pa konnen dat la, kite vid. Pa devine.",
      "Detay sa yo rete sou paj sa a. Yon peyi oswa dat pa deside dosye ou.",
    ],
    result: [
      "Dapre sa ou di nou, men sa pou mande avoka.",
      "Nou pa montre chans ou pou genyen. Ti tès sa a pa deside dosye ou.",
      "Mande ki èd lalwa pèmèt ak pri alekri. Peye anpil pa pwomèt genyen. Pa rate delè.",
      "Planifye pou kay, travay ak fanmi tou. Sèvis peye yo pa obligatwa.",
      "Mande kijan pou kenbe, lwe oswa vann kay ou. Mande sou prè anvan detansyon. Apwobasyon pa garanti.",
      "Kliyan ak zouti ou ka gen valè. Mande kijan pou kenbe, vann oswa transfere biznis ou. Gen frè kreyasyon ak komisyon.",
      "Fè lis zouti, pwopriyetè ak prè. Chwazi yon moun pou ede ak yo.",
      "Avoka dwe wè si ou ka mande jij revize detansyon. Sis mwa pa sifi. Ti tès sa a pa debloke papye tribinal.",
      "Si ou ka kite, mande avoka anvan. Kite ka afekte dosye ou ak dwa ou pou tounen. Depa volontè gen règ; li pa otomatik. Yon lòt peyi dwe pèmèt ou antre epi rete. Planifye papye vwayaj, timoun, lojman, bòdwo ak lajan.",
    ],
    findings: {
      status:
        "San pèmisyon valab, chanje estati ka difisil. Avoka dwe revize antre, papye ak eksepsyon.",
      tps: "TPS tanporè. Verifye si li toujou kouvri ou. TPS poukont li pa bay kat vèt.",
      daca: "DACA poukont li pa bay kat vèt. Mande sou lòt opsyon.",
      pending: "Tann azil pa menm ak apwobasyon. Kenbe prèv ak dat tribinal.",
      asylum_timely:
        "Anjeneral ou dwe mande azil nan yon ane apre dènye rive ou. Mwens pase yon ane isit pa vle di ou kalifye.",
      asylum_deadline:
        "Si ou pa mande azil, delè nòmal yon ane ka enpòtan. Gen eksepsyon. Yon demann alè pa vin anreta lè ane pase.",
      cancellation10:
        "Dis ane isit se yon sèl règ pou yon kalite èd tribinal. Difikilte fanmi, istorik ak lòt règ enpòtan tou.",
      cancellation_short:
        "Repons ou pa montre dis ane isit. Sa ka limite yon kalite èd, pa tout opsyon.",
      prior: "Yon lòd kite bezwen revizyon rapid. Li poukont li pa pwouve tout opsyon fèmen.",
      prior_unknown: "Si ou pa konnen si gen lòd, avoka dwe tcheke dosye yo.",
      immediate:
        "Mari, madanm oswa pitit granmoun sitwayen ka mande pou ou. Sa poukont li pa bay kat vèt.",
      lpr: "Yon fanmi ak kat vèt ka mande pou ou. Laj, maryaj, tan tann ak lòt règ enpòtan.",
      no_family:
        "Pa gen fanmi sa yo pa elimine tout èd. Mande sou laperèz, mal, lòt fanmi ak travay.",
      entry:
        "Kijan ou antre enpòtan. Antre ak pèmisyon ak antre san tcheke gen règ diferan. Avoka bezwen papye ou.",
      missed:
        "Rate tribinal oswa ICE bezwen revizyon rapid. Pa rate lòt dat. Rate tribinal ka lakòz yon lòd kite.",
      fear: "Di avoka poukisa ou pè tounen. Laperèz sèlman pa pwouve azil, men lòt pwoteksyon ka egziste.",
      changed:
        "Yon chanjman oswa gwo reta ka afekte azil anreta. Avoka dwe revize rezon, dat ak prèv. Sa pa menm ak chanje estati viza.",
      filed: "Kenbe prèv dat ou mande azil. Yon demann alè pa vin anreta paske ou rete plis ane.",
      returned:
        "Kite epi tounen ka chanje opsyon ou. Depòtasyon epi antre san pèmisyon ka lakòz gwo limit.",
      hardship: "Gwo mal pou sèten fanmi ka enpòtan. Avoka dwe revize kiyès, mal la ak lòt règ.",
      crime:
        "Pote papye arestasyon ak tribinal bay avoka. Arestasyon pa vle di koupab, men gen krim ki limite opsyon.",
      departure:
        "Pa kite poutèt ti tès sa a. Mande sou dosye, papye, antre nan lòt peyi ak limit pou tounen Etazini.",
      valid_status: "Viza oswa kat vèt bezwen revizyon pa yo. So viza pa dat ou ka rete jouk li.",
      status_unknown: "Pote papye imigrasyon bay avoka pou verifye pèmisyon ou.",
      family_unknown: "Mande fanmi konfime sitwayènte oswa kat vèt. Pa devine.",
    },
  },
} satisfies Record<
  "en" | "es" | "ht",
  {
    questions: string[];
    options: string[][];
    local: string[];
    result: string[];
    findings: Record<ScreeningFinding, string>;
  }
>;
