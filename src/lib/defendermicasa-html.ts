/**
 * Sentinel Trust marketing site (defendermicasa.com) — full HTML.
 * Mirrors the uploaded Sentinel Trust design. English-only.
 * Anchor links are in-page (#problem, #solution, #process, #app, #contact).
 */

export type DefenderLang = "en" | "es" | "ht";

const STYLE = `
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
    scroll-behavior: smooth;
  }
  .dm-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .dm-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(14,26,43,0.04) 1px, transparent 0);
    background-size: 4px 4px;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: multiply;
  }

  .dm-root .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 1.4rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(244, 239, 230, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
  }
  .dm-root .logo {
    font-family: 'Fraunces', serif;
    font-weight: 500;
    font-size: 1.35rem;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .dm-root .logo-mark {
    width: 26px; height: 26px;
    border: 1.5px solid var(--ink);
    position: relative;
    transform: rotate(45deg);
  }
  .dm-root .logo-mark::after {
    content: ''; position: absolute; inset: 4px; background: var(--accent);
  }
  .dm-root .nav-links {
    display: flex; gap: 2.4rem; list-style: none;
    font-size: 0.85rem; letter-spacing: 0.02em; text-transform: uppercase;
  }
  .dm-root .nav-links a {
    color: var(--ink); text-decoration: none; font-weight: 500;
    transition: opacity 0.2s;
  }
  .dm-root .nav-links a:hover { opacity: 0.6; }
  .dm-root .nav-cta {
    background: var(--ink); color: var(--paper);
    padding: 0.7rem 1.4rem; text-decoration: none;
    font-size: 0.82rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase;
    transition: background 0.2s;
  }
  .dm-root .nav-cta:hover { background: var(--accent); }

  .dm-root .hero {
    min-height: 100vh;
    padding: 9rem 3rem 4rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .dm-root .hero-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--accent-deep);
    margin-bottom: 2rem;
    display: flex; align-items: center; gap: 0.8rem;
  }
  .dm-root .hero-eyebrow::before {
    content: ''; width: 32px; height: 1px; background: var(--accent-deep);
  }
  .dm-root .hero h1 {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: clamp(2.8rem, 5.5vw, 5.4rem);
    line-height: 0.98; letter-spacing: -0.025em;
    margin-bottom: 2rem;
  }
  .dm-root .hero h1 em {
    font-style: italic; color: var(--accent-deep); font-weight: 300;
  }
  .dm-root .hero p.lede {
    font-size: 1.15rem; line-height: 1.6; max-width: 30rem;
    color: var(--ink-soft); margin-bottom: 2.5rem;
  }
  .dm-root .hero-actions { display: flex; gap: 1.2rem; align-items: center; }
  .dm-root .btn-primary {
    background: var(--ink); color: var(--paper);
    padding: 1.05rem 2rem; text-decoration: none;
    font-size: 0.9rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.25s;
    display: inline-flex; align-items: center; gap: 0.7rem;
  }
  .dm-root .btn-primary:hover { background: var(--accent); transform: translateY(-1px); }
  .dm-root .btn-primary span { transition: transform 0.25s; }
  .dm-root .btn-primary:hover span { transform: translateX(4px); }
  .dm-root .btn-ghost {
    color: var(--ink); text-decoration: none;
    font-size: 0.9rem; font-weight: 500;
    border-bottom: 1px solid var(--ink); padding-bottom: 2px;
    transition: color 0.2s;
  }
  .dm-root .btn-ghost:hover { color: var(--accent-deep); border-color: var(--accent-deep); }

  .dm-root .hero-visual {
    position: relative; height: 580px;
    display: flex; justify-content: center; align-items: center;
  }
  .dm-root .doc {
    position: absolute; background: #fbf8f1;
    box-shadow: 0 1px 2px rgba(14,26,43,0.08), 0 20px 40px rgba(14,26,43,0.18);
    padding: 2.2rem 1.8rem; width: 320px;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .dm-root .doc-1 { transform: rotate(-6deg) translate(-60px, -20px); z-index: 1; }
  .dm-root .doc-2 { transform: rotate(2deg) translate(20px, 30px); z-index: 2; }
  .dm-root .doc-3 { transform: rotate(8deg) translate(80px, -40px); z-index: 3; }
  .dm-root .hero-visual:hover .doc-1 { transform: rotate(-9deg) translate(-80px, -30px); }
  .dm-root .hero-visual:hover .doc-3 { transform: rotate(11deg) translate(100px, -50px); }
  .dm-root .doc-header {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--accent-deep);
    border-bottom: 1px solid var(--rule);
    padding-bottom: 0.7rem; margin-bottom: 1rem;
  }
  .dm-root .doc-title {
    font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 500;
    line-height: 1.2; margin-bottom: 1rem;
  }
  .dm-root .doc-line { height: 6px; background: var(--rule); margin-bottom: 0.5rem; border-radius: 2px; }
  .dm-root .doc-line.short { width: 60%; }
  .dm-root .doc-line.med { width: 85%; }
  .dm-root .doc-seal {
    margin-top: 1.5rem; width: 50px; height: 50px;
    border: 2px solid var(--accent); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-style: italic; color: var(--accent);
    font-size: 1.4rem; transform: rotate(-12deg);
  }

  .dm-root .statbar {
    background: var(--ink); color: var(--paper);
    padding: 3.5rem 3rem;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
    position: relative; z-index: 2;
  }
  .dm-root .stat { border-left: 1px solid rgba(244,239,230,0.2); padding-left: 1.5rem; }
  .dm-root .stat:first-child { border-left: none; padding-left: 0; }
  .dm-root .stat-num {
    font-family: 'Fraunces', serif; font-size: 3rem; font-weight: 300;
    letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.6rem; color: var(--gold);
  }
  .dm-root .stat-label {
    font-size: 0.82rem; color: rgba(244,239,230,0.7);
    line-height: 1.5; letter-spacing: 0.01em;
  }

  .dm-root .section { padding: 8rem 3rem; position: relative; z-index: 2; }
  .dm-root .section-header {
    display: grid; grid-template-columns: 1fr 2fr; gap: 4rem;
    margin-bottom: 5rem; align-items: end;
  }
  .dm-root .section-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--accent-deep);
  }
  .dm-root .section-title {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: clamp(2.2rem, 4.5vw, 4rem);
    line-height: 1.02; letter-spacing: -0.02em;
  }
  .dm-root .section-title em { font-style: italic; color: var(--accent-deep); }

  .dm-root .problem-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
    border-top: 1px solid var(--rule-strong);
  }
  .dm-root .problem {
    padding: 2.5rem 2rem 2.5rem 0;
    border-right: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }
  .dm-root .problem:last-child { border-right: none; }
  .dm-root .problem:not(:first-child) { padding-left: 2rem; }
  .dm-root .problem-num {
    font-family: 'Fraunces', serif; font-style: italic;
    font-size: 1.5rem; color: var(--accent); margin-bottom: 1rem;
  }
  .dm-root .problem h3 {
    font-family: 'Fraunces', serif; font-weight: 500;
    font-size: 1.5rem; margin-bottom: 1rem; line-height: 1.2;
  }
  .dm-root .problem p { color: var(--ink-soft); font-size: 0.98rem; line-height: 1.6; }

  .dm-root .solution { background: var(--ink); color: var(--paper); }
  .dm-root .solution .section-tag { color: var(--gold); }
  .dm-root .solution .section-title em { color: var(--gold); }
  .dm-root .pillars {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 1px; background: rgba(244,239,230,0.15);
    border: 1px solid rgba(244,239,230,0.15);
  }
  .dm-root .pillar { background: var(--ink); padding: 3rem 2.5rem; transition: background 0.3s; }
  .dm-root .pillar:hover { background: var(--ink-soft); }
  .dm-root .pillar-icon {
    width: 48px; height: 48px; border: 1px solid var(--gold);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.8rem;
    font-family: 'Fraunces', serif; font-style: italic;
    font-size: 1.3rem; color: var(--gold);
  }
  .dm-root .pillar h3 {
    font-family: 'Fraunces', serif; font-weight: 500;
    font-size: 1.7rem; margin-bottom: 1rem; line-height: 1.15;
  }
  .dm-root .pillar p {
    color: rgba(244,239,230,0.75); font-size: 0.98rem;
    line-height: 1.65; margin-bottom: 1.5rem;
  }
  .dm-root .pillar-list {
    list-style: none; border-top: 1px solid rgba(244,239,230,0.15); padding-top: 1.2rem;
  }
  .dm-root .pillar-list li {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem; color: rgba(244,239,230,0.6);
    padding: 0.4rem 0; letter-spacing: 0.02em;
  }
  .dm-root .pillar-list li::before { content: '→ '; color: var(--accent); }

  .dm-root .process-steps {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; position: relative;
  }
  .dm-root .process-steps::before {
    content: ''; position: absolute; top: 24px; left: 24px; right: 24px;
    height: 1px; background: var(--rule-strong); z-index: 0;
  }
  .dm-root .step { position: relative; z-index: 1; }
  .dm-root .step-num {
    width: 48px; height: 48px; background: var(--paper);
    border: 1.5px solid var(--ink); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-size: 1.2rem; font-weight: 500;
    margin-bottom: 1.5rem;
  }
  .dm-root .step h4 {
    font-family: 'Fraunces', serif; font-weight: 500;
    font-size: 1.25rem; margin-bottom: 0.7rem; line-height: 1.25;
  }
  .dm-root .step p { color: var(--ink-soft); font-size: 0.92rem; line-height: 1.55; }

  .dm-root .trigger {
    background: var(--paper-warm);
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 5rem; align-items: center;
  }
  .dm-root .trigger-text .section-tag { margin-bottom: 1.5rem; display: block; }
  .dm-root .trigger-text h2 {
    font-family: 'Fraunces', serif; font-weight: 400;
    font-size: clamp(2rem, 3.8vw, 3.2rem);
    line-height: 1.05; letter-spacing: -0.02em; margin-bottom: 1.8rem;
  }
  .dm-root .trigger-text h2 em { font-style: italic; color: var(--accent-deep); }
  .dm-root .trigger-text p {
    color: var(--ink-soft); font-size: 1.05rem; line-height: 1.65;
    margin-bottom: 1.5rem; max-width: 32rem;
  }
  .dm-root .phone-mockup {
    width: 280px; height: 560px; background: var(--ink);
    border-radius: 38px; padding: 14px; margin: 0 auto;
    position: relative; box-shadow: 0 30px 60px rgba(14,26,43,0.25);
  }
  .dm-root .phone-screen {
    background: linear-gradient(160deg, #1a2940 0%, #0e1a2b 100%);
    border-radius: 26px; height: 100%; padding: 2rem 1.4rem;
    display: flex; flex-direction: column; position: relative; overflow: hidden;
  }
  .dm-root .phone-screen::before {
    content: ''; position: absolute; top: 14px; left: 50%;
    transform: translateX(-50%); width: 90px; height: 22px;
    background: #000; border-radius: 12px;
  }
  .dm-root .phone-time {
    color: var(--paper); font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem; text-align: right;
    margin-top: 0.5rem; margin-bottom: 2.5rem;
  }
  .dm-root .phone-status {
    color: var(--gold); font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 0.8rem;
  }
  .dm-root .phone-title {
    color: var(--paper); font-family: 'Fraunces', serif;
    font-size: 1.3rem; line-height: 1.2; margin-bottom: 2.5rem;
  }
  .dm-root .panic-btn {
    width: 180px; height: 180px; margin: auto;
    background: radial-gradient(circle, var(--accent) 0%, var(--accent-deep) 100%);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--paper); font-family: 'Fraunces', serif;
    font-size: 1.1rem; text-align: center;
    box-shadow: 0 0 0 0 rgba(184, 85, 31, 0.6);
    animation: dm-pulse 2.4s infinite; cursor: pointer;
  }
  @keyframes dm-pulse {
    0% { box-shadow: 0 0 0 0 rgba(184, 85, 31, 0.5); }
    70% { box-shadow: 0 0 0 30px rgba(184, 85, 31, 0); }
    100% { box-shadow: 0 0 0 0 rgba(184, 85, 31, 0); }
  }
  .dm-root .phone-footer {
    color: rgba(244,239,230,0.5); font-family: 'JetBrains Mono', monospace;
    font-size: 0.6rem; text-align: center;
    margin-top: auto; letter-spacing: 0.1em;
  }

  .dm-root .cta {
    background: var(--ink); color: var(--paper);
    text-align: center; padding: 7rem 3rem;
  }
  .dm-root .cta-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 1.8rem;
  }
  .dm-root .cta h2 {
    font-family: 'Fraunces', serif; font-weight: 300;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    line-height: 1.05; letter-spacing: -0.02em;
    margin-bottom: 1.5rem; max-width: 24ch;
    margin-left: auto; margin-right: auto;
  }
  .dm-root .cta h2 em { font-style: italic; color: var(--gold); }
  .dm-root .cta p {
    color: rgba(244,239,230,0.7); font-size: 1.1rem;
    max-width: 32rem; margin: 0 auto 3rem; line-height: 1.6;
  }
  .dm-root .cta-btn {
    background: var(--paper); color: var(--ink);
    padding: 1.2rem 2.4rem; text-decoration: none;
    font-size: 0.92rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase;
    transition: all 0.25s;
    display: inline-flex; align-items: center; gap: 0.8rem;
  }
  .dm-root .cta-btn:hover { background: var(--gold); transform: translateY(-2px); }

  .dm-root footer {
    background: var(--ink); color: rgba(244,239,230,0.6);
    padding: 3rem 3rem 2rem;
    border-top: 1px solid rgba(244,239,230,0.1);
    font-size: 0.85rem;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
  }
  .dm-root footer a { color: rgba(244,239,230,0.8); text-decoration: none; }
  .dm-root footer .languages {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.05em;
  }

  @media (max-width: 900px) {
    .dm-root .nav { padding: 1rem 1.5rem; }
    .dm-root .nav-links { display: none; }
    .dm-root .hero { grid-template-columns: 1fr; padding: 7rem 1.5rem 3rem; gap: 2rem; }
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
    .dm-root footer { flex-direction: column; }
  }

  .dm-root .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.8s, transform 0.8s; }
  .dm-root .reveal.in { opacity: 1; transform: translateY(0); }
</style>
`;

const BODY = `
<nav class="nav">
  <div class="logo">
    <span class="logo-mark"></span>
    <span>Sentinel Trust</span>
  </div>
  <ul class="nav-links">
    <li><a href="#problem">The Problem</a></li>
    <li><a href="#solution">Our Method</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#app">The App</a></li>
  </ul>
  <a href="#contact" class="nav-cta">Consult →</a>
</nav>

<section class="hero">
  <div class="hero-text reveal in">
    <div class="hero-eyebrow">A legal shield for uncertain times</div>
    <h1>When you can't be there to <em>protect what you built</em>, the law can.</h1>
    <p class="lede">For families facing detention or removal, Sentinel Trust establishes a legal vehicle that takes custody of your home, your vehicle, and your assets — managing them, renting them, or selling them on your direction, wherever in the world you are.</p>
    <div class="hero-actions">
      <a href="#contact" class="btn-primary">Schedule a Consultation <span>→</span></a>
      <a href="#solution" class="btn-ghost">How it works</a>
    </div>
  </div>
  <div class="hero-visual reveal in">
    <div class="doc doc-1">
      <div class="doc-header">Article I — Trust Declaration</div>
      <div class="doc-title">Revocable Living Trust</div>
      <div class="doc-line"></div><div class="doc-line med"></div><div class="doc-line"></div><div class="doc-line short"></div>
      <div class="doc-seal">S</div>
    </div>
    <div class="doc doc-2">
      <div class="doc-header">Schedule A — Real Property</div>
      <div class="doc-title">Title &amp; Deed Transfer</div>
      <div class="doc-line med"></div><div class="doc-line"></div><div class="doc-line short"></div><div class="doc-line med"></div>
    </div>
    <div class="doc doc-3">
      <div class="doc-header">Exhibit C — Trigger Protocol</div>
      <div class="doc-title">Successor Trustee Authorization</div>
      <div class="doc-line"></div><div class="doc-line short"></div><div class="doc-line med"></div>
      <div class="doc-seal">✓</div>
    </div>
  </div>
</section>

<section class="statbar">
  <div class="stat reveal"><div class="stat-num">5M+</div><div class="stat-label">Non-citizens projected to face removal in coming years</div></div>
  <div class="stat reveal"><div class="stat-num">∞</div><div class="stat-label">Vehicles abandoned roadside daily during detention events</div></div>
  <div class="stat reveal"><div class="stat-num">3</div><div class="stat-label">Average days before an unattended home faces real risk</div></div>
  <div class="stat reveal"><div class="stat-num">0</div><div class="stat-label">Tolerance for losing what you spent decades building</div></div>
</section>

<section class="section" id="problem">
  <div class="section-header reveal">
    <div class="section-tag">— 01 / The Problem</div>
    <h2 class="section-title">A handshake with a neighbor is <em>not</em> a legal plan.</h2>
  </div>
  <div class="problem-grid">
    <div class="problem reveal"><div class="problem-num">i.</div><h3>Powers of attorney often fail</h3><p>Banks, title companies, and county recorders frequently refuse to honor informal POAs — especially across state lines or after long delays. The document that felt like protection becomes paper.</p></div>
    <div class="problem reveal"><div class="problem-num">ii.</div><h3>Property goes dark fast</h3><p>Mortgages default. Insurance lapses. Squatters arrive. Tax liens accumulate. Within weeks of detention, decades of equity can quietly evaporate from a home no one can legally manage.</p></div>
    <div class="problem reveal"><div class="problem-num">iii.</div><h3>Vehicles disappear into impound</h3><p>A car left where ICE made the stop becomes an impound fee, then an auction, then a stranger's title — usually within 30 days. The owner is in another country and has no legal way to recover it.</p></div>
  </div>
</section>

<section class="section solution" id="solution">
  <div class="section-header reveal">
    <div class="section-tag">— 02 / Our Method</div>
    <h2 class="section-title">A trust structure built for the moment <em>you can't act.</em></h2>
  </div>
  <div class="pillars">
    <div class="pillar reveal"><div class="pillar-icon">I</div><h3>The Revocable Living Trust</h3><p>You retain full control while in the country — buy, sell, refinance, anything. Real property is titled into the trust. A successor trustee, vetted and bonded, has standby authority that activates only on a verified triggering event.</p><ul class="pillar-list"><li>Real property transfer</li><li>Standby successor trustee</li><li>Written instructions: hold, rent, or sell</li><li>International proceeds wiring</li></ul></div>
    <div class="pillar reveal"><div class="pillar-icon">II</div><h3>Vehicle Recovery Protocol</h3><p>A dedicated limited POA, notarized in advance, paired with a designated agent and pre-built relationships at impound networks. Your designated agent recovers the vehicle within the 30-day window before auction.</p><ul class="pillar-list"><li>Notarized vehicle authorization</li><li>Transfer-on-Death titling where available</li><li>Impound network coordination</li><li>Title transfer or sale on your direction</li></ul></div>
    <div class="pillar reveal"><div class="pillar-icon">III</div><h3>Verified Trigger Protocol</h3><p>Authority does not transfer on a button press. It transfers on certified verification — ICE detainee locator confirmation, a defined no-contact window, family attestation, attorney sign-off. Title companies and courts accept the chain because we built it to survive scrutiny.</p><ul class="pillar-list"><li>Multi-source verification</li><li>Attorney-certified authorization</li><li>Audit-ready documentation</li><li>Reversible if you return</li></ul></div>
    <div class="pillar reveal"><div class="pillar-icon">IV</div><h3>Cross-Border Distribution</h3><p>An attorney-administered client trust account holds proceeds. KYC and OFAC compliance is built in. Funds reach you in your destination country through licensed channels — not through a friend's Venmo.</p><ul class="pillar-list"><li>IOLTA-style client trust account</li><li>AML / OFAC compliance</li><li>Licensed international wire</li><li>Documented beneficiary designation</li></ul></div>
  </div>
</section>

<section class="section" id="process">
  <div class="section-header reveal">
    <div class="section-tag">— 03 / Process</div>
    <h2 class="section-title">Four steps. <em>Once.</em> Then it's there if you ever need it.</h2>
  </div>
  <div class="process-steps">
    <div class="step reveal"><div class="step-num">1</div><h4>Confidential Consultation</h4><p>An attorney-led intake in your language. We map your assets — home, vehicles, accounts — and your wishes. Free of charge, fully privileged.</p></div>
    <div class="step reveal"><div class="step-num">2</div><h4>Document Preparation</h4><p>Trust drafted, deed prepared, vehicle authorizations notarized. Beneficiary chosen. Successor trustee designated. Instructions encoded.</p></div>
    <div class="step reveal"><div class="step-num">3</div><h4>Funding &amp; Filing</h4><p>Title transferred. Records filed at the county. App linked. You receive a binder, a backup digital vault, and a card with the 24/7 line.</p></div>
    <div class="step reveal"><div class="step-num">4</div><h4>Standby. Forever, if needed.</h4><p>Nothing changes day-to-day. You live your life. The structure waits. If the moment comes, it activates within hours — not weeks.</p></div>
  </div>
</section>

<section class="section trigger" id="app">
  <div class="trigger-text reveal">
    <span class="section-tag">— 04 / The Companion App</span>
    <h2>One press. The chain <em>begins.</em></h2>
    <p>Our existing emergency app already alerts your family if you fear detention. Sentinel Trust extends that alert into legal action: it notifies your designated attorney, opens the verification window, and starts the clock on protecting your property — automatically, while your family is still calling everyone they know.</p>
    <p>The app does not replace human judgment. It triggers a documented protocol that human attorneys execute. That's what makes it hold up in court.</p>
    <a href="#contact" class="btn-primary" style="background:var(--accent);">Connect Your App <span>→</span></a>
  </div>
  <div class="reveal">
    <div class="phone-mockup"><div class="phone-screen">
      <div class="phone-time">9:41</div>
      <div class="phone-status">● Active · Protected</div>
      <div class="phone-title">Hold to alert<br>your sentinel</div>
      <div class="panic-btn">PRESS<br>&amp; HOLD</div>
      <div class="phone-footer">SENTINEL TRUST · v3</div>
    </div></div>
  </div>
</section>

<section class="cta" id="contact">
  <div class="cta-eyebrow">— Begin</div>
  <h2>You built a life here. <em>Don't leave it to chance.</em></h2>
  <p>Schedule a confidential consultation with a member of our legal team. Available in English, Spanish, Haitian Creole, Mandarin, and Arabic. No fee for the initial conversation.</p>
  <a href="mailto:hello@defendermicasa.com" class="cta-btn">Book a Consultation <span>→</span></a>
</section>

<footer>
  <div>
    <div style="margin-bottom:0.6rem;">© 2026 Sentinel Trust · Concept site for legal professionals</div>
    <div style="font-size:0.75rem; opacity:0.6;">Attorney advertising. Prior results do not guarantee similar outcomes.</div>
  </div>
  <div class="languages">EN · ES · HT · ZH · AR</div>
</footer>
`;

export function getDefenderHtml(_lang: DefenderLang = "en"): string {
  return STYLE + BODY;
}

export const DEFENDER_HTML = getDefenderHtml("en");
