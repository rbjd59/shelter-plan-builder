/**
 * Sentinel Trust marketing site (defendermicasa.com) — body markup only.
 * Returns translated HTML by language. CTA links point to `#notify`.
 */

export type DefenderLang = "en" | "es" | "ht";

const CSS = `
<style>
  .dm-root {
    --ink: #0e1a2b;
    --ink-soft: #1a2940;
    --paper: #f4efe6;
    --paper-warm: #ebe3d4;
    --accent: #b8551f;
    --accent-deep: #8a3c11;
    --gold: #c9a961;
    --rule: rgba(14, 26, 43, 0.15);
    --rule-strong: rgba(14, 26, 43, 0.4);
    background: var(--paper);
    color: var(--ink);
    font-family: 'Inter Tight', sans-serif;
    font-weight: 400;
    line-height: 1.55;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }
  .dm-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .dm-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(14,26,43,0.04) 1px, transparent 0);
    background-size: 4px 4px;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: multiply;
  }
  .dm-root .nav { position: sticky; top: 38px; z-index: 50; padding: 1.4rem 3rem; display: flex; justify-content: space-between; align-items: center; background: rgba(244,239,230,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--rule); }
  .dm-root .logo { font-family: 'Fraunces', serif; font-weight: 500; font-size: 1.35rem; letter-spacing: -0.01em; display: flex; align-items: center; gap: 0.6rem; }
  .dm-root .logo-mark { width: 26px; height: 26px; border: 1.5px solid var(--ink); position: relative; transform: rotate(45deg); }
  .dm-root .logo-mark::after { content: ''; position: absolute; inset: 4px; background: var(--accent); }
  .dm-root .nav-links { display: flex; gap: 2.4rem; list-style: none; font-size: 0.85rem; letter-spacing: 0.02em; text-transform: uppercase; }
  .dm-root .nav-links a { color: var(--ink); text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
  .dm-root .nav-links a:hover { opacity: 0.6; }
  .dm-root .nav-cta { background: var(--ink); color: var(--paper); padding: 0.7rem 1.4rem; text-decoration: none; font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; transition: background 0.2s; }
  .dm-root .nav-cta:hover { background: var(--accent); }
  .dm-root .hero { min-height: 90vh; padding: 6rem 3rem 4rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 2; }
  .dm-root .hero-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-deep); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.8rem; }
  .dm-root .hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--accent-deep); }
  .dm-root .hero h1 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(2.8rem, 5.5vw, 5.4rem); line-height: 0.98; letter-spacing: -0.025em; margin-bottom: 2rem; }
  .dm-root .hero h1 em { font-style: italic; color: var(--accent-deep); font-weight: 300; }
  .dm-root .hero p.lede { font-size: 1.15rem; line-height: 1.6; max-width: 30rem; color: var(--ink-soft); margin-bottom: 2.5rem; }
  .dm-root .hero-actions { display: flex; gap: 1.2rem; align-items: center; flex-wrap: wrap; }
  .dm-root .btn-primary { background: var(--ink); color: var(--paper); padding: 1.05rem 2rem; text-decoration: none; font-size: 0.9rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.25s; display: inline-flex; align-items: center; gap: 0.7rem; }
  .dm-root .btn-primary:hover { background: var(--accent); transform: translateY(-1px); }
  .dm-root .btn-primary span { transition: transform 0.25s; }
  .dm-root .btn-primary:hover span { transform: translateX(4px); }
  .dm-root .btn-ghost { color: var(--ink); text-decoration: none; font-size: 0.9rem; font-weight: 500; border-bottom: 1px solid var(--ink); padding-bottom: 2px; }
  .dm-root .hero-visual { position: relative; height: 580px; display: flex; justify-content: center; align-items: center; }
  .dm-root .doc { position: absolute; background: #fbf8f1; box-shadow: 0 1px 2px rgba(14,26,43,0.08), 0 20px 40px rgba(14,26,43,0.18); padding: 2.2rem 1.8rem; width: 320px; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .dm-root .doc-1 { transform: rotate(-6deg) translate(-60px, -20px); z-index: 1; }
  .dm-root .doc-2 { transform: rotate(2deg) translate(20px, 30px); z-index: 2; }
  .dm-root .doc-3 { transform: rotate(8deg) translate(80px, -40px); z-index: 3; }
  .dm-root .hero-visual:hover .doc-1 { transform: rotate(-9deg) translate(-80px, -30px); }
  .dm-root .hero-visual:hover .doc-3 { transform: rotate(11deg) translate(100px, -50px); }
  .dm-root .doc-header { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent-deep); border-bottom: 1px solid var(--rule); padding-bottom: 0.7rem; margin-bottom: 1rem; }
  .dm-root .doc-title { font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 500; line-height: 1.2; margin-bottom: 1rem; }
  .dm-root .doc-line { height: 6px; background: var(--rule); margin-bottom: 0.5rem; border-radius: 2px; }
  .dm-root .doc-line.short { width: 60%; }
  .dm-root .doc-line.med { width: 85%; }
  .dm-root .doc-seal { margin-top: 1.5rem; width: 50px; height: 50px; border: 2px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-style: italic; color: var(--accent); font-size: 1.4rem; transform: rotate(-12deg); }
  .dm-root .statbar { background: var(--ink); color: var(--paper); padding: 3.5rem 3rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; position: relative; z-index: 2; }
  .dm-root .stat { border-left: 1px solid rgba(244,239,230,0.2); padding-left: 1.5rem; }
  .dm-root .stat:first-child { border-left: none; padding-left: 0; }
  .dm-root .stat-num { font-family: 'Fraunces', serif; font-size: 3rem; font-weight: 300; letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.6rem; color: var(--gold); }
  .dm-root .stat-label { font-size: 0.82rem; color: rgba(244,239,230,0.7); line-height: 1.5; }
  .dm-root .section { padding: 8rem 3rem; position: relative; z-index: 2; }
  .dm-root .section-header { display: grid; grid-template-columns: 1fr 2fr; gap: 4rem; margin-bottom: 5rem; align-items: end; }
  .dm-root .section-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent-deep); }
  .dm-root .section-title { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(2.2rem, 4.5vw, 4rem); line-height: 1.02; letter-spacing: -0.02em; }
  .dm-root .section-title em { font-style: italic; color: var(--accent-deep); }
  .dm-root .problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid var(--rule-strong); }
  .dm-root .problem { padding: 2.5rem 2rem 2.5rem 0; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
  .dm-root .problem:last-child { border-right: none; }
  .dm-root .problem:not(:first-child) { padding-left: 2rem; }
  .dm-root .problem-num { font-family: 'Fraunces', serif; font-style: italic; font-size: 1.5rem; color: var(--accent); margin-bottom: 1rem; }
  .dm-root .problem h3 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 1.5rem; margin-bottom: 1rem; line-height: 1.2; }
  .dm-root .problem p { color: var(--ink-soft); font-size: 0.98rem; line-height: 1.6; }
  .dm-root .solution { background: var(--ink); color: var(--paper); }
  .dm-root .solution .section-tag { color: var(--gold); }
  .dm-root .solution .section-title em { color: var(--gold); }
  .dm-root .pillars { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(244,239,230,0.15); border: 1px solid rgba(244,239,230,0.15); }
  .dm-root .pillar { background: var(--ink); padding: 3rem 2.5rem; transition: background 0.3s; }
  .dm-root .pillar:hover { background: var(--ink-soft); }
  .dm-root .pillar-icon { width: 48px; height: 48px; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; margin-bottom: 1.8rem; font-family: 'Fraunces', serif; font-style: italic; font-size: 1.3rem; color: var(--gold); }
  .dm-root .pillar h3 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 1.7rem; margin-bottom: 1rem; line-height: 1.15; }
  .dm-root .pillar p { color: rgba(244,239,230,0.75); font-size: 0.98rem; line-height: 1.65; margin-bottom: 1.5rem; }
  .dm-root .pillar-list { list-style: none; border-top: 1px solid rgba(244,239,230,0.15); padding-top: 1.2rem; }
  .dm-root .pillar-list li { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: rgba(244,239,230,0.6); padding: 0.4rem 0; }
  .dm-root .pillar-list li::before { content: '→ '; color: var(--accent); }
  .dm-root .process-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; position: relative; }
  .dm-root .process-steps::before { content: ''; position: absolute; top: 24px; left: 24px; right: 24px; height: 1px; background: var(--rule-strong); z-index: 0; }
  .dm-root .step { position: relative; z-index: 1; }
  .dm-root .step-num { width: 48px; height: 48px; background: var(--paper); border: 1.5px solid var(--ink); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 500; margin-bottom: 1.5rem; }
  .dm-root .step h4 { font-family: 'Fraunces', serif; font-weight: 500; font-size: 1.25rem; margin-bottom: 0.7rem; line-height: 1.25; }
  .dm-root .step p { color: var(--ink-soft); font-size: 0.92rem; line-height: 1.55; }
  .dm-root .trigger { background: var(--paper-warm); display: grid; grid-template-columns: 1.2fr 1fr; gap: 5rem; align-items: center; }
  .dm-root .trigger-text .section-tag { margin-bottom: 1.5rem; display: block; }
  .dm-root .trigger-text h2 { font-family: 'Fraunces', serif; font-weight: 400; font-size: clamp(2rem, 3.8vw, 3.2rem); line-height: 1.05; margin-bottom: 1.8rem; }
  .dm-root .trigger-text h2 em { font-style: italic; color: var(--accent-deep); }
  .dm-root .trigger-text p { color: var(--ink-soft); font-size: 1.05rem; line-height: 1.65; margin-bottom: 1.5rem; max-width: 32rem; }
  .dm-root .phone-mockup { width: 280px; height: 560px; background: var(--ink); border-radius: 38px; padding: 14px; margin: 0 auto; position: relative; box-shadow: 0 30px 60px rgba(14,26,43,0.25); }
  .dm-root .phone-screen { background: linear-gradient(160deg, #1a2940 0%, #0e1a2b 100%); border-radius: 26px; height: 100%; padding: 2rem 1.4rem; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .dm-root .phone-screen::before { content: ''; position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 90px; height: 22px; background: #000; border-radius: 12px; }
  .dm-root .phone-time { color: var(--paper); font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; text-align: right; margin-top: 0.5rem; margin-bottom: 2.5rem; }
  .dm-root .phone-status { color: var(--gold); font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.8rem; }
  .dm-root .phone-title { color: var(--paper); font-family: 'Fraunces', serif; font-size: 1.3rem; line-height: 1.2; margin-bottom: 2.5rem; }
  .dm-root .panic-btn { width: 180px; height: 180px; margin: auto; background: radial-gradient(circle, var(--accent) 0%, var(--accent-deep) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--paper); font-family: 'Fraunces', serif; font-size: 1.1rem; text-align: center; animation: dm-pulse 2.4s infinite; cursor: pointer; }
  @keyframes dm-pulse { 0% { box-shadow: 0 0 0 0 rgba(184,85,31,0.5); } 70% { box-shadow: 0 0 0 30px rgba(184,85,31,0); } 100% { box-shadow: 0 0 0 0 rgba(184,85,31,0); } }
  .dm-root .phone-footer { color: rgba(244,239,230,0.5); font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; text-align: center; margin-top: auto; letter-spacing: 0.1em; }
  @media (max-width: 900px) {
    .dm-root .nav { padding: 1rem 1.5rem; }
    .dm-root .nav-links { display: none; }
    .dm-root .hero { grid-template-columns: 1fr; padding: 4rem 1.5rem 3rem; gap: 2rem; }
    .dm-root .hero-visual { height: 400px; }
    .dm-root .doc { width: 250px; padding: 1.5rem; }
    .dm-root .section { padding: 4rem 1.5rem; }
    .dm-root .section-header { grid-template-columns: 1fr; gap: 1.5rem; }
    .dm-root .statbar { grid-template-columns: repeat(2, 1fr); padding: 2.5rem 1.5rem; gap: 2rem 1rem; }
    .dm-root .stat { border-left: none; padding-left: 0; }
    .dm-root .problem-grid { grid-template-columns: 1fr; }
    .dm-root .problem { border-right: none; padding-left: 0 !important; padding-right: 0; }
    .dm-root .pillars { grid-template-columns: 1fr; }
    .dm-root .process-steps { grid-template-columns: 1fr; gap: 2rem; }
    .dm-root .process-steps::before { display: none; }
    .dm-root .trigger { grid-template-columns: 1fr; gap: 3rem; }
  }
</style>
`;

type Copy = {
  navProblem: string; navMethod: string; navProcess: string; navApp: string; navCta: string;
  heroEyebrow: string;
  heroH1a: string; heroH1em: string; heroH1b: string;
  heroLede: string;
  ctaPrimary: string; ctaGhost: string;
  docs: [string, string, string, string, string, string];
  stats: [string, string, string, string];
  s1tag: string; s1titleA: string; s1titleEm: string; s1titleB: string;
  problems: { h: string; p: string }[];
  s2tag: string; s2titleA: string; s2titleEm: string; s2titleB: string;
  pillars: { h: string; p: string; list: string[] }[];
  s3tag: string; s3titleA: string; s3titleEm: string; s3titleB: string;
  steps: { h: string; p: string }[];
  s4tag: string; s4titleA: string; s4titleEm: string; s4titleB: string;
  trigP1: string; trigP2: string;
  phoneStatus: string; phoneTitle: string; phoneBtn: string;
};

const COPY: Record<DefenderLang, Copy> = {
  en: {
    navProblem: "The Problem", navMethod: "Our Method", navProcess: "Process", navApp: "The App", navCta: "Notify Me →",
    heroEyebrow: "A legal shield for uncertain times",
    heroH1a: "When you can't be there to ", heroH1em: "protect what you built", heroH1b: ", the law can.",
    heroLede: "For families facing detention or removal, Sentinel Trust establishes a legal vehicle that takes custody of your home, your vehicle, and your assets — managing them, renting them, or selling them on your direction, wherever in the world you are.",
    ctaPrimary: "Advise Me When Open", ctaGhost: "How it works",
    docs: ["Article I — Trust Declaration", "Revocable Living Trust", "Schedule A — Real Property", "Title & Deed Transfer", "Exhibit C — Trigger Protocol", "Successor Trustee Authorization"],
    stats: ["Non-citizens projected to face removal in coming years", "Vehicles abandoned roadside daily during detention events", "Average days before an unattended home faces real risk", "Tolerance for losing what you spent decades building"],
    s1tag: "— 01 / The Problem", s1titleA: "A handshake with a neighbor is ", s1titleEm: "not", s1titleB: " a legal plan.",
    problems: [
      { h: "Powers of attorney often fail", p: "Banks, title companies, and county recorders frequently refuse to honor informal POAs — especially across state lines or after long delays. The document that felt like protection becomes paper." },
      { h: "Property goes dark fast", p: "Mortgages default. Insurance lapses. Squatters arrive. Tax liens accumulate. Within weeks of detention, decades of equity can quietly evaporate from a home no one can legally manage." },
      { h: "Vehicles disappear into impound", p: "A car left where ICE made the stop becomes an impound fee, then an auction, then a stranger's title — usually within 30 days. The owner is in another country and has no legal way to recover it." },
    ],
    s2tag: "— 02 / Our Method", s2titleA: "A trust structure built for the moment ", s2titleEm: "you can't act.", s2titleB: "",
    pillars: [
      { h: "The Revocable Living Trust", p: "You retain full control while in the country — buy, sell, refinance, anything. Real property is titled into the trust. A successor trustee, vetted and bonded, has standby authority that activates only on a verified triggering event.", list: ["Real property transfer", "Standby successor trustee", "Written instructions: hold, rent, or sell", "International proceeds wiring"] },
      { h: "Vehicle Recovery Protocol", p: "A dedicated limited POA, notarized in advance, paired with a designated agent and pre-built relationships at impound networks. Your designated agent recovers the vehicle within the 30-day window before auction.", list: ["Notarized vehicle authorization", "Transfer-on-Death titling where available", "Impound network coordination", "Title transfer or sale on your direction"] },
      { h: "Verified Trigger Protocol", p: "Authority does not transfer on a button press. It transfers on certified verification — ICE detainee locator confirmation, a defined no-contact window, family attestation, attorney sign-off. Title companies and courts accept the chain because we built it to survive scrutiny.", list: ["Multi-source verification", "Attorney-certified authorization", "Audit-ready documentation", "Reversible if you return"] },
      { h: "Cross-Border Distribution", p: "An attorney-administered client trust account holds proceeds. KYC and OFAC compliance is built in. Funds reach you in your destination country through licensed channels — not through a friend's Venmo.", list: ["IOLTA-style client trust account", "AML / OFAC compliance", "Licensed international wire", "Documented beneficiary designation"] },
    ],
    s3tag: "— 03 / Process", s3titleA: "Four steps. ", s3titleEm: "Once.", s3titleB: " Then it's there if you ever need it.",
    steps: [
      { h: "Confidential Consultation", p: "An attorney-led intake in your language. We map your assets — home, vehicles, accounts — and your wishes. Free of charge, fully privileged." },
      { h: "Document Preparation", p: "Trust drafted, deed prepared, vehicle authorizations notarized. Beneficiary chosen. Successor trustee designated. Instructions encoded." },
      { h: "Funding & Filing", p: "Title transferred. Records filed at the county. App linked. You receive a binder, a backup digital vault, and a card with the 24/7 line." },
      { h: "Standby. Forever, if needed.", p: "Nothing changes day-to-day. You live your life. The structure waits. If the moment comes, it activates within hours — not weeks." },
    ],
    s4tag: "— 04 / The Companion App", s4titleA: "One press. The chain ", s4titleEm: "begins.", s4titleB: "",
    trigP1: "Our existing emergency app already alerts your family if you fear detention. Sentinel Trust extends that alert into legal action: it notifies your designated attorney, opens the verification window, and starts the clock on protecting your property — automatically, while your family is still calling everyone they know.",
    trigP2: "The app does not replace human judgment. It triggers a documented protocol that human attorneys execute. That's what makes it hold up in court.",
    phoneStatus: "● Active · Protected", phoneTitle: "Hold to alert<br/>your sentinel", phoneBtn: "PRESS<br/>& HOLD",
  },
  es: {
    navProblem: "El Problema", navMethod: "Nuestro Método", navProcess: "Proceso", navApp: "La App", navCta: "Avísame →",
    heroEyebrow: "Un escudo legal para tiempos inciertos",
    heroH1a: "Cuando no puedas estar para ", heroH1em: "proteger lo que construiste", heroH1b: ", la ley puede hacerlo.",
    heroLede: "Para familias que enfrentan detención o deportación, Sentinel Trust establece un vehículo legal que toma custodia de tu casa, tu vehículo y tus bienes — administrándolos, alquilándolos o vendiéndolos según tus instrucciones, donde quiera que estés en el mundo.",
    ctaPrimary: "Avísame Cuando Abran", ctaGhost: "Cómo funciona",
    docs: ["Artículo I — Declaración de Fideicomiso", "Fideicomiso Revocable en Vida", "Anexo A — Bienes Raíces", "Transferencia de Título y Escritura", "Anexo C — Protocolo de Activación", "Autorización del Fideicomisario Sucesor"],
    stats: ["No ciudadanos proyectados a enfrentar deportación en los próximos años", "Vehículos abandonados a diario durante eventos de detención", "Días promedio antes de que una casa desatendida enfrente riesgo real", "Tolerancia a perder lo que pasaste décadas construyendo"],
    s1tag: "— 01 / El Problema", s1titleA: "Un apretón de manos con un vecino ", s1titleEm: "no", s1titleB: " es un plan legal.",
    problems: [
      { h: "Los poderes notariales suelen fallar", p: "Los bancos, las compañías de título y los registros del condado a menudo se niegan a reconocer poderes informales — especialmente entre estados o tras largos retrasos. El documento que parecía protección se convierte en papel." },
      { h: "La propiedad se hunde rápido", p: "Las hipotecas caen en mora. Los seguros expiran. Llegan los ocupas. Se acumulan gravámenes fiscales. En semanas de detención, décadas de patrimonio pueden evaporarse silenciosamente de una casa que nadie puede administrar legalmente." },
      { h: "Los vehículos desaparecen en el corralón", p: "Un auto dejado donde ICE hizo la parada se convierte en multa de corralón, luego subasta, luego título de un extraño — usualmente en 30 días. El dueño está en otro país y no tiene forma legal de recuperarlo." },
    ],
    s2tag: "— 02 / Nuestro Método", s2titleA: "Una estructura de fideicomiso construida para el momento ", s2titleEm: "en que no puedas actuar.", s2titleB: "",
    pillars: [
      { h: "El Fideicomiso Revocable en Vida", p: "Mantienes el control total mientras estás en el país — comprar, vender, refinanciar, lo que sea. Los bienes raíces se titulan al fideicomiso. Un fideicomisario sucesor, verificado y afianzado, tiene autoridad en espera que se activa solo con un evento de activación verificado.", list: ["Transferencia de bienes raíces", "Fideicomisario sucesor en espera", "Instrucciones escritas: retener, alquilar o vender", "Envío internacional de fondos"] },
      { h: "Protocolo de Recuperación Vehicular", p: "Un poder limitado dedicado, notarizado por adelantado, junto con un agente designado y relaciones preestablecidas con redes de corralones. Tu agente designado recupera el vehículo dentro de los 30 días antes de la subasta.", list: ["Autorización vehicular notarizada", "Título Transfer-on-Death donde aplique", "Coordinación con red de corralones", "Transferencia o venta según tus instrucciones"] },
      { h: "Protocolo de Activación Verificado", p: "La autoridad no se transfiere con un botón. Se transfiere con verificación certificada — confirmación del localizador de detenidos de ICE, ventana de no-contacto definida, atestación familiar, firma del abogado. Compañías de título y cortes aceptan la cadena porque la construimos para resistir escrutinio.", list: ["Verificación de múltiples fuentes", "Autorización certificada por abogado", "Documentación lista para auditoría", "Reversible si regresas"] },
      { h: "Distribución Transfronteriza", p: "Una cuenta fiduciaria administrada por abogados retiene los fondos. Cumplimiento KYC y OFAC integrado. Los fondos te llegan en tu país de destino por canales licenciados — no por el Venmo de un amigo.", list: ["Cuenta fiduciaria tipo IOLTA", "Cumplimiento AML / OFAC", "Transferencia internacional licenciada", "Designación de beneficiario documentada"] },
    ],
    s3tag: "— 03 / Proceso", s3titleA: "Cuatro pasos. ", s3titleEm: "Una vez.", s3titleB: " Luego está ahí si alguna vez lo necesitas.",
    steps: [
      { h: "Consulta Confidencial", p: "Una entrevista dirigida por abogado en tu idioma. Mapeamos tus bienes — casa, vehículos, cuentas — y tus deseos. Gratis, completamente privilegiado." },
      { h: "Preparación de Documentos", p: "Fideicomiso redactado, escritura preparada, autorizaciones vehiculares notarizadas. Beneficiario elegido. Fideicomisario sucesor designado. Instrucciones codificadas." },
      { h: "Financiamiento y Registro", p: "Título transferido. Registros archivados en el condado. App vinculada. Recibes una carpeta, una bóveda digital de respaldo y una tarjeta con la línea 24/7." },
      { h: "En espera. Para siempre, si es necesario.", p: "Nada cambia día a día. Vives tu vida. La estructura espera. Si llega el momento, se activa en horas — no semanas." },
    ],
    s4tag: "— 04 / La App Compañera", s4titleA: "Una pulsación. La cadena ", s4titleEm: "comienza.", s4titleB: "",
    trigP1: "Nuestra app de emergencia ya alerta a tu familia si temes una detención. Sentinel Trust extiende esa alerta a acción legal: notifica a tu abogado designado, abre la ventana de verificación e inicia el reloj para proteger tu propiedad — automáticamente, mientras tu familia aún está llamando a todos los que conoce.",
    trigP2: "La app no reemplaza el juicio humano. Activa un protocolo documentado que ejecutan abogados humanos. Eso es lo que la hace válida ante un tribunal.",
    phoneStatus: "● Activa · Protegida", phoneTitle: "Mantén presionado para<br/>alertar a tu sentinel", phoneBtn: "PRESIONA<br/>Y MANTÉN",
  },
  ht: {
    navProblem: "Pwoblèm Lan", navMethod: "Metòd Nou", navProcess: "Pwosesis", navApp: "App La", navCta: "Avize M →",
    heroEyebrow: "Yon pwoteksyon legal pou tan ki ensèten",
    heroH1a: "Lè ou pa ka la pou ", heroH1em: "pwoteje sa ou bati", heroH1b: ", lalwa ka fè l.",
    heroLede: "Pou fanmi k ap fè fas ak detansyon oswa depòtasyon, Sentinel Trust etabli yon veyikil legal ki pran gad kay ou, machin ou, ak byen ou — administre yo, lwe yo, oswa vann yo selon enstriksyon ou, kèlkeswa kote ou ye nan mond lan.",
    ctaPrimary: "Avize M Lè L Ouvè", ctaGhost: "Kijan li mache",
    docs: ["Atik I — Deklarasyon Fideyikomi", "Fideyikomi Revokab Vivan", "Anèks A — Pwopriyete Reyèl", "Transfè Tit ak Ak", "Anèks C — Pwotokòl Aktivasyon", "Otorizasyon Fideyikomisè Siksesè"],
    stats: ["Ki pa-sitwayen ki prevwa fè fas a depòtasyon nan ane k ap vini yo", "Machin abandone chak jou pandan evènman detansyon", "Jou an mwayèn anvan yon kay san sipèvizyon fè fas a risk reyèl", "Tolerans pou pèdi sa ou pase dekad ap bati"],
    s1tag: "— 01 / Pwoblèm Lan", s1titleA: "Yon kontra ak yon vwazen ", s1titleEm: "pa", s1titleB: " yon plan legal.",
    problems: [
      { h: "Pwokirasyon souvan echwe", p: "Bank, konpayi tit, ak rejis konte souvan refize onore pwokirasyon enfòmèl — espesyalman ant eta oswa apre reta long. Dokiman ki te sanble pwoteksyon vin papye." },
      { h: "Pwopriyete a sonbre vit", p: "Ipotèk yo defo. Asirans yo ekspire. Skwatè rive. Lyen taks akimile. Nan kèk semèn detansyon, dekad ekite ka evapore an silans nan yon kay pèsòn pa ka administre legalman." },
      { h: "Machin disparèt nan founyè", p: "Yon machin ki rete kote ICE te fè arè a vin yon frè founyè, apre sa ankan, apre sa tit yon etranje — anjeneral nan 30 jou. Pwopriyetè a nan yon lòt peyi epi pa gen okenn fason legal pou rekipere l." },
    ],
    s2tag: "— 02 / Metòd Nou", s2titleA: "Yon estrikti fideyikomi bati pou moman ", s2titleEm: "ou pa ka aji.", s2titleB: "",
    pillars: [
      { h: "Fideyikomi Revokab Vivan", p: "Ou kenbe kontwòl total pandan ou nan peyi a — achte, vann, refinanse, nenpòt bagay. Pwopriyete reyèl tit nan fideyikomi a. Yon fideyikomisè siksesè, verifye epi gen kosyon, gen otorite an atant ki aktive sèlman sou yon evènman aktivasyon verifye.", list: ["Transfè pwopriyete reyèl", "Fideyikomisè siksesè an atant", "Enstriksyon ekri: kenbe, lwe, oswa vann", "Voye pwodwi entènasyonal"] },
      { h: "Pwotokòl Rekiperasyon Machin", p: "Yon pwokirasyon limite dedye, notarize davans, ansanm ak yon ajan deziyen ak relasyon prebati nan rezo founyè. Ajan deziyen ou rekipere machin nan nan fenèt 30 jou anvan ankan.", list: ["Otorizasyon machin notarize", "Tit Transfer-on-Death kote ki disponib", "Kowòdinasyon ak rezo founyè", "Transfè tit oswa vann selon enstriksyon ou"] },
      { h: "Pwotokòl Aktivasyon Verifye", p: "Otorite pa transfere sou yon pousman bouton. Li transfere sou verifikasyon sètifye — konfimasyon lokatè detni ICE, fenèt san-kontak defini, atestasyon fanmi, siyen avoka. Konpayi tit ak tribinal aksepte chèn nan paske nou bati l pou siviv ekzamen.", list: ["Verifikasyon plizyè sous", "Otorizasyon avoka sètifye", "Dokiman pare pou odit", "Reversib si ou retounen"] },
      { h: "Distribisyon Transfwontalye", p: "Yon kont fideyikomi kliyan administre pa avoka kenbe pwodwi. Konfòmite KYC ak OFAC entegre. Lajan rive jwenn ou nan peyi destinasyon ou atravè kanal lisansye — pa atravè Venmo yon zanmi.", list: ["Kont fideyikomi kliyan tip IOLTA", "Konfòmite AML / OFAC", "Vire entènasyonal lisansye", "Designasyon benefisyè dokimante"] },
    ],
    s3tag: "— 03 / Pwosesis", s3titleA: "Kat etap. ", s3titleEm: "Yon fwa.", s3titleB: " Apre sa li la si w janm bezwen l.",
    steps: [
      { h: "Konsiltasyon Konfidansyèl", p: "Yon antrevi avoka mennen nan lang ou. Nou kat byen ou yo — kay, machin, kont — ak swè ou. Gratis, konplètman privilejye." },
      { h: "Preparasyon Dokiman", p: "Fideyikomi redije, ak prepare, otorizasyon machin notarize. Benefisyè chwazi. Fideyikomisè siksesè deziyen. Enstriksyon kode." },
      { h: "Finansman ak Anrejistreman", p: "Tit transfere. Rejis depoze nan konte. App lye. Ou resevwa yon kaye, yon kòf dijital backup, ak yon kat ak liy 24/7 la." },
      { h: "An atant. Pou tout tan, si nesesè.", p: "Anyen pa chanje jou pa jou. Ou viv lavi w. Estrikti a ap tann. Si moman an rive, li aktive nan kèk èdtan — pa semèn." },
    ],
    s4tag: "— 04 / App Konpayon", s4titleA: "Yon pousman. Chèn nan ", s4titleEm: "kòmanse.", s4titleB: "",
    trigP1: "App ijans nou egziste deja avèti fanmi ou si ou pè detansyon. Sentinel Trust elaji avètisman sa a nan aksyon legal: li avize avoka deziyen ou, ouvri fenèt verifikasyon an, epi kòmanse revèy la pou pwoteje pwopriyete ou — otomatikman, pandan fanmi ou toujou ap rele tout moun yo konnen.",
    trigP2: "App la pa ranplase jijman imen. Li aktive yon pwotokòl dokimante ke avoka imen egzekite. Sa fè li kenbe nan tribinal.",
    phoneStatus: "● Aktif · Pwoteje", phoneTitle: "Kenbe pou avèti<br/>sentinel ou", phoneBtn: "PRESE<br/>& KENBE",
  },
};

export function getDefenderHtml(lang: DefenderLang): string {
  const c = COPY[lang];
  return `${CSS}
<nav class="nav">
  <div class="logo"><span class="logo-mark"></span><span>Sentinel Trust</span></div>
  <ul class="nav-links">
    <li><a href="#problem">${c.navProblem}</a></li>
    <li><a href="#solution">${c.navMethod}</a></li>
    <li><a href="#process">${c.navProcess}</a></li>
    <li><a href="#app">${c.navApp}</a></li>
  </ul>
  <a href="#notify" class="nav-cta">${c.navCta}</a>
</nav>

<section class="hero">
  <div class="hero-text">
    <div class="hero-eyebrow">${c.heroEyebrow}</div>
    <h1>${c.heroH1a}<em>${c.heroH1em}</em>${c.heroH1b}</h1>
    <p class="lede">${c.heroLede}</p>
    <div class="hero-actions">
      <a href="#notify" class="btn-primary">${c.ctaPrimary} <span>→</span></a>
      <a href="#solution" class="btn-ghost">${c.ctaGhost}</a>
    </div>
  </div>
  <div class="hero-visual">
    <div class="doc doc-1">
      <div class="doc-header">${c.docs[0]}</div>
      <div class="doc-title">${c.docs[1]}</div>
      <div class="doc-line"></div><div class="doc-line med"></div><div class="doc-line"></div><div class="doc-line short"></div>
      <div class="doc-seal">S</div>
    </div>
    <div class="doc doc-2">
      <div class="doc-header">${c.docs[2]}</div>
      <div class="doc-title">${c.docs[3]}</div>
      <div class="doc-line med"></div><div class="doc-line"></div><div class="doc-line short"></div><div class="doc-line med"></div>
    </div>
    <div class="doc doc-3">
      <div class="doc-header">${c.docs[4]}</div>
      <div class="doc-title">${c.docs[5]}</div>
      <div class="doc-line"></div><div class="doc-line short"></div><div class="doc-line med"></div>
      <div class="doc-seal">✓</div>
    </div>
  </div>
</section>

<section class="statbar">
  <div class="stat"><div class="stat-num">5M+</div><div class="stat-label">${c.stats[0]}</div></div>
  <div class="stat"><div class="stat-num">∞</div><div class="stat-label">${c.stats[1]}</div></div>
  <div class="stat"><div class="stat-num">3</div><div class="stat-label">${c.stats[2]}</div></div>
  <div class="stat"><div class="stat-num">0</div><div class="stat-label">${c.stats[3]}</div></div>
</section>

<section class="section" id="problem">
  <div class="section-header">
    <div class="section-tag">${c.s1tag}</div>
    <h2 class="section-title">${c.s1titleA}<em>${c.s1titleEm}</em>${c.s1titleB}</h2>
  </div>
  <div class="problem-grid">
    ${c.problems.map((p, i) => `<div class="problem"><div class="problem-num">${["i.", "ii.", "iii."][i]}</div><h3>${p.h}</h3><p>${p.p}</p></div>`).join("")}
  </div>
</section>

<section class="section solution" id="solution">
  <div class="section-header">
    <div class="section-tag">${c.s2tag}</div>
    <h2 class="section-title">${c.s2titleA}<em>${c.s2titleEm}</em>${c.s2titleB}</h2>
  </div>
  <div class="pillars">
    ${c.pillars.map((p, i) => `<div class="pillar"><div class="pillar-icon">${["I", "II", "III", "IV"][i]}</div><h3>${p.h}</h3><p>${p.p}</p><ul class="pillar-list">${p.list.map((l) => `<li>${l}</li>`).join("")}</ul></div>`).join("")}
  </div>
</section>

<section class="section" id="process">
  <div class="section-header">
    <div class="section-tag">${c.s3tag}</div>
    <h2 class="section-title">${c.s3titleA}<em>${c.s3titleEm}</em>${c.s3titleB}</h2>
  </div>
  <div class="process-steps">
    ${c.steps.map((s, i) => `<div class="step"><div class="step-num">${i + 1}</div><h4>${s.h}</h4><p>${s.p}</p></div>`).join("")}
  </div>
</section>

<section class="section trigger" id="app">
  <div class="trigger-text">
    <span class="section-tag">${c.s4tag}</span>
    <h2>${c.s4titleA}<em>${c.s4titleEm}</em>${c.s4titleB}</h2>
    <p>${c.trigP1}</p>
    <p>${c.trigP2}</p>
    <a href="#notify" class="btn-primary" style="background:var(--accent);">${c.ctaPrimary} <span>→</span></a>
  </div>
  <div>
    <div class="phone-mockup"><div class="phone-screen">
      <div class="phone-time">9:41</div>
      <div class="phone-status">${c.phoneStatus}</div>
      <div class="phone-title">${c.phoneTitle}</div>
      <div class="panic-btn">${c.phoneBtn}</div>
      <div class="phone-footer">SENTINEL TRUST · v3</div>
    </div></div>
  </div>
</section>
`;
}

// Backward-compat default export
export const DEFENDER_HTML = getDefenderHtml("en");
