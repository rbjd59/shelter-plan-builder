import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, Calculator, Check, Phone, MessageSquareText } from "lucide-react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { BUSINESS_SITE_COPY, TRADES } from "@/lib/business-site-content";
import { BUSINESS_PARALEGAL_PHONE, BUSINESS_PARALEGAL_PHONE_DISPLAY } from "@/lib/business-config";
import { calculateBusinessValue } from "@/lib/assessment/business-report";
import { Button } from "@/components/ui/button";
import ownerImage from "@/assets/business-owner-hero.jpg";
import { BUSINESS_INTAKE_COPY } from "@/lib/business-intake";

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function BusinessSite() {
  const { lang, setLang } = useLang();
  const c = BUSINESS_SITE_COPY[lang];
  const [revenue, setRevenue] = useState("");
  const [costs, setCosts] = useState("");
  const [equipment, setEquipment] = useState("");
  const [repeat, setRepeat] = useState("yes");
  const [showValue, setShowValue] = useState(false);
  const value = calculateBusinessValue({
    monthlyRevenue: revenue === "" ? null : Number(revenue),
    monthlyCosts: costs === "" ? null : Number(costs),
    equipmentValue: equipment === "" ? null : Number(equipment),
    repeatCustomers: repeat === "yes",
    years: "dk",
    records: "dk",
    entity: "dk",
  });
  return (
    <main className="business-site">
      <a className="business-skip" href="#value">{c.skip}</a>
      <header className="business-header">
        <a href="/business" className="business-brand"><BriefcaseBusiness aria-hidden="true" /><span>Do Not Forget<br />Your Business</span></a>
        <nav aria-label="Business"><a href="#value">{c.navValue}</a><a href="#tools">{c.navTools}</a><a href="#help">{c.navHelp}</a><a href="#costs">{c.navCosts}</a><Link to="/business-intake" search={{ lang }}>{BUSINESS_INTAKE_COPY[lang].send}</Link></nav>
        <div className="business-languages" aria-label="Language">{(["en", "es", "ht"] as Lang[]).map((language) => <button key={language} type="button" aria-pressed={lang === language} onClick={() => setLang(language)}>{language === "en" ? "English" : language === "es" ? "Español" : "Kreyòl"}</button>)}</div>
      </header>
      <section className="business-hero">
        <div><p className="business-eyebrow">{c.eyebrow}</p><h1>{c.heroTitle}</h1><p className="business-hero-body">{c.heroBody}</p><div className="business-actions"><Button asChild size="lg"><a href="#value">{c.valueButton}</a></Button><Button asChild variant="outline" size="lg"><a href={`tel:${BUSINESS_PARALEGAL_PHONE}`}><Phone />{c.call} · {BUSINESS_PARALEGAL_PHONE_DISPLAY}</a></Button></div><p className="business-note">{c.freeNote}</p></div>
        <img src={ownerImage} alt={c.imageAlt} />
      </section>
      <section className="business-band business-centered"><h2>{c.tradesTitle}</h2><p>{c.tradesBody}</p><div className="business-goal-row"><span>{c.keep}</span><span>{c.sell}</span><span>{c.family}</span></div><div className="business-trades">{TRADES[lang].map((trade) => <span key={trade}>{trade}</span>)}</div><p>{c.cashNote}</p></section>
      <section id="value" className="business-band business-calculator">
        <div><Calculator aria-hidden="true" /><h2>{c.valueTitle}</h2><p>{c.valueBody}</p><h3>{c.exampleTitle}</h3><p>{c.exampleBody}</p></div>
        <form onSubmit={(event) => { event.preventDefault(); setShowValue(true); }}>
          <label>{lang === "es" ? "Dinero que entra cada mes" : lang === "ht" ? "Lajan ki antre chak mwa" : "Money coming in each month"}<input required type="number" min="0" inputMode="decimal" value={revenue} onChange={(event) => { setRevenue(event.target.value); setShowValue(false); }} placeholder="$5,000" /></label>
          <label>{lang === "es" ? "Costos del negocio cada mes" : lang === "ht" ? "Depans biznis chak mwa" : "Business costs each month"}<input required type="number" min="0" inputMode="decimal" value={costs} onChange={(event) => { setCosts(event.target.value); setShowValue(false); }} placeholder="$3,000" /></label>
          <label>{lang === "es" ? "Valor aproximado de herramientas y equipos" : lang === "ht" ? "Valè zouti ak ekipman yo" : "Estimated tools and equipment value"}<input required type="number" min="0" inputMode="decimal" value={equipment} onChange={(event) => { setEquipment(event.target.value); setShowValue(false); }} placeholder="$8,000" /></label>
          <label>{lang === "es" ? "¿Tiene clientes que vuelven?" : lang === "ht" ? "Èske ou gen kliyan ki tounen?" : "Do customers come back?"}<select value={repeat} onChange={(event) => { setRepeat(event.target.value); setShowValue(false); }}><option value="yes">{lang === "es" ? "Sí" : lang === "ht" ? "Wi" : "Yes"}</option><option value="no">{lang === "es" ? "No" : lang === "ht" ? "Non" : "No"}</option></select></label>
          <Button type="submit">{c.valueButton}</Button>
          {showValue && <div className="business-value-result" role="status">{value.status === "ready" ? <><span>{lang === "es" ? "Rango inicial" : lang === "ht" ? "Premye estimasyon" : "Starting range"}</span><strong>{money(value.low ?? 0)} – {money(value.high ?? 0)}</strong><p>{lang === "es" ? "No es una oferta ni una promesa. Una persona debe revisar sus registros." : lang === "ht" ? "Se pa yon òf ni yon pwomès. Yon moun dwe revize rejis ou yo." : "This is not an offer or a promise. A person must review your records."}</p></> : <p>{lang === "es" ? "Necesitamos revisar sus números con usted. Llámenos." : lang === "ht" ? "Nou bezwen revize chif yo avek ou. Rele nou." : "We need to review your numbers with you. Please call us."}</p>}</div>}
        </form>
      </section>
      <section id="tools" className="business-band"><div className="business-section-title"><h2>{c.planTitle}</h2><p>{c.planBody}</p></div><div className="business-steps">{c.steps.map((step, index) => <article key={step.title}><span>{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></section>
      <section className="business-band business-structure" aria-labelledby="business-structure-title"><div className="business-section-title"><h2 id="business-structure-title">{c.structureTitle}</h2></div><div className="business-steps">{c.structureSteps.map((step, index) => <article key={step.title}><span>{index + 1}</span><h3>{step.title}</h3><p>{step.body}</p></article>)}</div><p className="business-structure-note">{c.structureNote}</p></section>
      <section id="costs" className="business-band business-costs"><div className="business-section-title"><h2>{c.costsTitle}</h2><p>{c.costsBody}</p></div><div className="business-cost-grid"><article><strong>{c.monthlyPrice}</strong><h3>{c.monthlyLabel}</h3><ul>{c.included.map((item) => <li key={item}><Check />{item}</li>)}</ul></article><article><h3>{c.trustTitle}</h3><p>{c.trustBody}</p></article><article><h3>{c.directorTitle}</h3><p>{c.directorBody}</p></article><article><h3>{c.brokerTitle}</h3><p>{c.brokerBody}</p></article></div><p className="business-note">{c.costsNote}</p></section>
      <section id="help" className="business-help"><h2>{c.helpTitle}</h2><p>{c.helpBody}</p><div className="business-actions"><Button asChild size="lg"><a href={`tel:${BUSINESS_PARALEGAL_PHONE}`}><Phone />{c.call} · {BUSINESS_PARALEGAL_PHONE_DISPLAY}</a></Button><Button asChild variant="outline" size="lg"><a href={`sms:${BUSINESS_PARALEGAL_PHONE}`}><MessageSquareText />{c.text}</a></Button><Button asChild variant="outline" size="lg"><Link to="/business-intake" search={{ lang }}>{BUSINESS_INTAKE_COPY[lang].send}</Link></Button></div></section>
      <section className="business-disclosures"><h2>{c.disclosureTitle}</h2>{c.disclosures.map((item) => <p key={item}>{item}</p>)}<a href={`https://detenciondefensa.com/?lang=${lang}`}>{c.defenseLink} →</a></section>
    </main>
  );
}
