import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BriefcaseBusiness, Check, Compass, FileText, Home, Smartphone, X } from "lucide-react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { HOME_REVIEW } from "@/lib/home-review-content";
import { requestReviewSchema, type RequestReviewInput, type ReviewNeed } from "@/lib/review-request";
import { requestReview } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { HomePoints } from "@/components/HomePoints";

const CARD_ICONS = [Smartphone, Home, BriefcaseBusiness, FileText, Compass];
const LANGUAGE_NAMES: Record<Lang, string> = { en: "English", es: "Español", ht: "Kreyòl" };
type ReviewFormValues = Omit<RequestReviewInput, "website"> & { website: string };

export function RequestReviewSection() {
  const { lang } = useLang();
  const t = HOME_REVIEW[lang];
  const send = useServerFn(requestReview);
  const [values, setValues] = useState<ReviewFormValues>({ fullName: "", phone: "", email: "", language: lang, need: "legal", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setValues((current) => ({ ...current, language: lang }));
  }, [lang]);

  const update = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(false);
  };

  return (
    <section id="request-review" className="home-review-section" aria-labelledby="request-review-heading">
      <div className="home-container home-review-layout">
        <div className="home-review-intro">
          <p className="home-readiness-eyebrow">{t.reviewEyebrow}</p>
          <h2 id="request-review-heading">{t.reviewTitle}</h2>
          <p>{t.reviewIntro}</p>
          <HomePoints items={[...t.reviewPoints]} />
        </div>
        <div className="home-review-form-wrap">
          {complete ? (
            <div className="home-review-success" role="status" tabIndex={-1}>
              <Check aria-hidden="true" />
              <h3>{t.successTitle}</h3>
              <p>{t.successBody}</p>
              <Button asChild className="home-primary"><Link to="/qualify" search={{ lang }}>{t.needs.legal}<ArrowRight /></Link></Button>
            </div>
          ) : (
            <form className="home-review-form" noValidate onSubmit={async (event) => {
              event.preventDefault();
              const parsed = requestReviewSchema.safeParse(values);
              if (!parsed.success || busy) { setError(true); return; }
              setBusy(true);
              setError(false);
              try {
                await send({ data: parsed.data });
                setComplete(true);
              } catch {
                setError(true);
              } finally {
                setBusy(false);
              }
            }}>
              <div className="home-review-fields">
                <label><span>{t.fullName}</span><input required autoComplete="name" maxLength={120} value={values.fullName} onChange={(e) => update("fullName", e.target.value)} /></label>
                <label><span>{t.phone}</span><input required type="tel" inputMode="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(e) => update("phone", e.target.value)} /></label>
                <label><span>{t.email}</span><input required type="email" autoComplete="email" maxLength={254} value={values.email} onChange={(e) => update("email", e.target.value)} /></label>
                <label><span>{t.language}</span><select value={values.language} onChange={(e) => update("language", e.target.value as Lang)}>{(["en", "es", "ht"] as Lang[]).map((code) => <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>)}</select></label>
                <label className="home-review-need"><span>{t.need}</span><select value={values.need} onChange={(e) => update("need", e.target.value as ReviewNeed)}>{Object.entries(t.needs).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="home-review-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} /></label>
              </div>
              {error && <p className="home-review-error" role="alert">{t.error}</p>}
              <Button type="submit" className="home-primary home-review-submit" disabled={busy}>{busy ? t.busy : t.submit}<ArrowRight /></Button>
              <p className="home-review-note">{t.formNote}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function ProgramCardsSection() {
  const { lang } = useLang();
  const t = HOME_REVIEW[lang];
  return (
    <section className="home-band home-programs" aria-labelledby="home-programs-heading">
      <div className="home-container">
        <p className="home-readiness-eyebrow">{t.programsEyebrow}</p>
        <h2 id="home-programs-heading">{t.programsTitle}</h2>
        <p className="home-programs-intro">{t.programsIntro}</p>
        <div className="home-program-grid">
          {t.cards.map((card, index) => {
            const Icon = CARD_ICONS[index];
            return <article className="home-program-card" key={card.key}>
              <Icon aria-hidden="true" />
              <span className="home-program-number">0{index + 1}</span>
              <h3>{card.title}</h3>
              <HomePoints items={[...card.points]} />
              <Button asChild variant="outline" className="home-program-link"><Link to={card.href} search={{ lang }}>{card.cta}<ArrowRight /></Link></Button>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}

export function PlanComparisonSection() {
  const { lang } = useLang();
  const t = HOME_REVIEW[lang];
  return (
    <section className="home-band home-plan-comparison" aria-labelledby="plan-comparison-heading">
      <div className="home-container">
        <h2 id="plan-comparison-heading">{t.comparisonTitle}</h2>
        <div className="home-plan-grid">
          <article><X aria-hidden="true" /><h3>{t.withoutTitle}</h3><HomePoints items={[...t.without]} /></article>
          <article><Check aria-hidden="true" /><h3>{t.withTitle}</h3><HomePoints items={[...t.with]} /></article>
        </div>
        <p className="home-plan-note">{t.comparisonNote}</p>
      </div>
    </section>
  );
}

export default function HomeReviewSections() {
  return <><RequestReviewSection /><ProgramCardsSection /><PlanComparisonSection /></>;
}
