import { CarFront, Check, Clock3, FileCheck2, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessLang } from "@/lib/business-lang";
import { VEHICLE_PROGRAM_COPY } from "@/lib/vehicle-program-content";
import { FIRM } from "@/lib/firm-info";
import { OPERATING_NOTICE } from "@/lib/operating-disclosure";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import VehicleProgramVideo from "./VehicleProgramVideo";

function VehicleCta({ compact = false }: { compact?: boolean }) {
  const { lang } = useBusinessLang();
  const c = VEHICLE_PROGRAM_COPY[lang];
  return (
    <div className={`vehicle-cta ${compact ? "vehicle-cta-compact" : ""}`}>
      <div className="vehicle-actions">
        <Button asChild size="lg"><a href={`/intake?lang=${lang}&vehicle=1`}><CarFront aria-hidden="true" />{c.primaryCta}</a></Button>
        {!compact && <Button asChild size="lg" variant="outline"><a href="#vehicle-video"><Play aria-hidden="true" />{c.watchCta}</a></Button>}
      </div>
      <p className="vehicle-referral-disclosure">{c.disclosure}</p>
    </div>
  );
}

export default function VehicleProgramPage() {
  const { lang, setLang } = useBusinessLang();
  const c = VEHICLE_PROGRAM_COPY[lang];
  return (
    <main className="vehicle-site">
      <a className="vehicle-skip" href="#vehicle-content">{lang === "es" ? "Ir al contenido" : lang === "ht" ? "Ale nan kontni an" : "Skip to content"}</a>
      <header className="vehicle-header">
        <a href={`/?lang=${lang}`} className="vehicle-brand"><img src={logoAsset.url} alt="" width="46" height="46" /><span><strong>DetencionDefensa.com</strong><small>{c.heroTitle}</small></span></a>
        <nav aria-label="Vehicle program"><a href={`/?lang=${lang}`}>{c.navHome}</a><a href="#vehicle-how">{c.navHow}</a><a href="#vehicle-protections">{c.navProtections}</a><a href="#vehicle-faq">{c.navFaq}</a></nav>
        <div className="vehicle-languages" role="group" aria-label="Language">{(["en", "es", "ht"] as const).map((language) => <button type="button" key={language} aria-pressed={lang === language} onClick={() => setLang(language)}>{language === "en" ? "English" : language === "es" ? "Español" : "Kreyòl"}</button>)}</div>
      </header>

      <div id="vehicle-content">
        <section className="vehicle-hero">
          <div><p className="vehicle-eyebrow"><CarFront aria-hidden="true" />DetencionDefensa · {lang === "es" ? "Plan gratis" : lang === "ht" ? "Plan gratis" : "Free plan"}</p><h1>{c.heroTitle}</h1><p className="vehicle-hero-sub">{c.heroSub}</p><VehicleCta /></div>
        </section>
        <p className="vehicle-status" role="status"><Clock3 aria-hidden="true" />{c.status}</p>

        <section id="vehicle-video" className="vehicle-band vehicle-video-section"><div className="vehicle-section-heading"><h2>{c.videoTitle}</h2><p>{c.videoNote}</p></div><VehicleProgramVideo key={lang} lang={lang} /></section>

        <section className="vehicle-band"><div className="vehicle-section-heading"><h2>{c.clockTitle}</h2><p>{c.clockBody}</p></div><div className="vehicle-card-grid vehicle-three">{c.clockCards.map((card, index) => <article key={card.title}><Clock3 aria-hidden="true" /><span>{String(index + 1).padStart(2, "0")}</span><h3>{card.title}</h3><p>{card.body}</p></article>)}</div></section>

        <section id="vehicle-how" className="vehicle-band vehicle-tint"><div className="vehicle-section-heading"><h2>{c.howTitle}</h2></div><ol className="vehicle-steps">{c.howSteps.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol></section>

        <section className="vehicle-band"><div className="vehicle-section-heading"><h2>{c.situationsTitle}</h2></div><div className="vehicle-card-grid vehicle-three">{c.situations.map((situation) => <article key={situation.title}><CarFront aria-hidden="true" /><h3>{situation.title}</h3><p>{situation.body}</p></article>)}</div></section>

        <section id="vehicle-protections" className="vehicle-band vehicle-protections"><div className="vehicle-section-heading"><h2>{c.protectionsTitle}</h2></div><div className="vehicle-protection-grid">{c.protections.map((protection) => <article key={protection.title}><ShieldCheck aria-hidden="true" /><div><h3>{protection.title}</h3><p>{protection.body}</p></div></article>)}</div></section>

        <section className="vehicle-band vehicle-tint"><div className="vehicle-section-heading"><h2>{c.signingTitle}</h2><p>{c.signingIntro}</p></div><div className="vehicle-signing">{c.signing.map((document) => <article key={document.title}><FileCheck2 aria-hidden="true" /><div><h3>{document.title}</h3><p>{document.body}</p></div></article>)}</div></section>

        <section id="vehicle-documents" className="vehicle-band">
          <div className="vehicle-section-heading"><h2>{lang === "es" ? "Vea los documentos" : lang === "ht" ? "Gade dokiman yo" : "See the documents"}</h2><p>{lang === "es" ? "Descargue una muestra en blanco con la marca de agua de borrador. El acuerdo para concesionarios también está en revisión." : lang === "ht" ? "Telechaje yon egzanp vid avèk mak BOUYON. Akò pou konsesyonè a an revizyon tou." : "Download a blank DRAFT-watermarked sample. The dealer agreement is also under attorney review."}</p></div>
          <div className="vehicle-actions">
            <Button asChild size="lg"><a href="/forms/vehicle/vehicle-rescue-packet-sample.pdf" download><FileCheck2 aria-hidden="true" />{lang === "es" ? "Descargar paquete de muestra" : lang === "ht" ? "Telechaje egzanp pakè a" : "Download sample Vehicle Rescue Packet"}</a></Button>
            <Button asChild size="lg" variant="outline"><a href="/forms/vehicle/dealer-participation-agreement"><FileCheck2 aria-hidden="true" />{lang === "es" ? "Acuerdo para concesionarios (borrador)" : lang === "ht" ? "Akò konsesyonè (bouyon)" : "Dealer Participation Agreement (draft)"}</a></Button>
          </div>
        </section>

        <section id="vehicle-faq" className="vehicle-band"><div className="vehicle-section-heading"><h2>{c.faqTitle}</h2></div><div className="vehicle-faqs">{c.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div></section>

        <section className="vehicle-band vehicle-final"><h2>{c.finalTitle}</h2><p>{c.finalBody}</p><VehicleCta compact /><a className="vehicle-dealer-link" href={`/dealers?lang=${lang === "ht" ? "en" : lang}`}>{c.dealerLink} →</a></section>

        <section className="vehicle-legal"><h2>{FIRM.legalName} · {FIRM.city}</h2><p>{OPERATING_NOTICE[lang]}</p><p>{FIRM.attorney} · {FIRM.flBarNumber} · {FIRM.address}</p><p><Check aria-hidden="true" />{c.status}</p></section>
      </div>
    </main>
  );
}
