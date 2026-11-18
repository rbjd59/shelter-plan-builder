import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CarFront, Check, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessLang } from "@/lib/business-lang";
import { DEALER_INTEREST_COPY, dealerInterestSchema } from "@/lib/dealer-interest";
import { submitDealerInterest } from "@/lib/dealer-interest.functions";
import { FIRM } from "@/lib/firm-info";
import logoAsset from "@/assets/dd-logo.png.asset.json";

export default function DealerPage() {
  const { lang, setLang } = useBusinessLang();
  const dealerLang = lang === "es" ? "es" : "en";
  const c = DEALER_INTEREST_COPY[dealerLang];
  const submit = useServerFn(submitDealerInterest);
  const [requestId, setRequestId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  return (
    <main className="vehicle-site dealer-site">
      <header className="vehicle-header">
        <a href={`/no-pierdas-tu-carro?lang=${dealerLang}`} className="vehicle-brand"><img src={logoAsset.url} alt="" width="46" height="46" /><span><strong>DetencionDefensa.com</strong><small>{c.title}</small></span></a>
        <div className="vehicle-languages" role="group" aria-label="Language">{(["en", "es"] as const).map((language) => <button type="button" key={language} aria-pressed={dealerLang === language} onClick={() => setLang(language)}>{language === "en" ? "English" : "Español"}</button>)}</div>
      </header>
      <section className="dealer-hero"><p className="vehicle-eyebrow"><CarFront aria-hidden="true" />Don't Lose Your Car</p><h1>{c.title}</h1><p>{c.subtitle}</p></section>
      <section className="vehicle-band"><div className="vehicle-section-heading"><h2>{c.programTitle}</h2><p>{c.programBody}</p></div></section>
      <section className="vehicle-band vehicle-tint"><div className="vehicle-section-heading"><h2>{c.obligationsTitle}</h2></div><div className="dealer-obligations">{c.obligations.map((item) => <p key={item}><Check aria-hidden="true" />{item}</p>)}</div></section>
      <section className="vehicle-band dealer-two-column"><article><ShieldCheck aria-hidden="true" /><h2>{c.feeTitle}</h2><p>{c.feeBody}</p></article><article><h2>{c.reviewTitle}</h2><p>{c.reviewBody}</p><Button asChild variant="outline"><a href="/forms/vehicle/dealer-participation-agreement"><Download aria-hidden="true" />{c.download}</a></Button></article></section>
      <section className="vehicle-band dealer-form-section">
        <div><h2>{c.formTitle}</h2><p>{c.formBody}</p><p className="vehicle-referral-disclosure">{c.privacy}</p><a href={`/no-pierdas-tu-carro?lang=${dealerLang}`}>← {c.back}</a></div>
        {saved ? <div className="dealer-saved" role="status"><Check aria-hidden="true" /><h2>{c.saved}</h2></div> : <form className="dealer-form" onSubmit={async (event) => {
          event.preventDefault();
          setError(false);
          const fields = new FormData(event.currentTarget);
          const id = requestId ?? crypto.randomUUID();
          setRequestId(id);
          const parsed = dealerInterestSchema.safeParse({
            requestId: id,
            dealershipName: fields.get("dealershipName"),
            licenseNumber: fields.get("licenseNumber"),
            contactName: fields.get("contactName"),
            phone: fields.get("phone"),
            email: fields.get("email"),
            counties: fields.get("counties"),
            language: dealerLang,
            consent: fields.get("consent") === "on",
          });
          if (!parsed.success) { setError(true); return; }
          setBusy(true);
          try { await submit({ data: parsed.data }); setSaved(true); } catch { setError(true); } finally { setBusy(false); }
        }}>
          <label>{c.dealership}<input name="dealershipName" autoComplete="organization" required minLength={2} maxLength={160} /></label>
          <label>{c.license}<input name="licenseNumber" required minLength={2} maxLength={80} /></label>
          <label>{c.contact}<input name="contactName" autoComplete="name" required minLength={2} maxLength={120} /></label>
          <label>{c.phone}<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} /></label>
          <label>{c.email}<input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
          <label>{c.counties}<textarea name="counties" required minLength={2} maxLength={500} rows={3} /></label>
          <label className="dealer-consent"><input name="consent" type="checkbox" required />{c.consent}</label>
          {error && <p role="alert">{c.error}</p>}
          <Button type="submit" disabled={busy}>{busy ? c.sending : c.submit}</Button>
        </form>}
      </section>
      <section className="vehicle-legal"><h2>{FIRM.legalName} · {FIRM.city}</h2><p>{FIRM.attorney} · {FIRM.flBarNumber} · {FIRM.address}</p></section>
    </main>
  );
}
