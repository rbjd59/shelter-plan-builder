import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, RotateCcw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assessScreening } from "@/lib/legal-screening.functions";
import { screeningSchema, type ScreeningAnswers, type ScreeningAssessment } from "@/lib/legal-screening";
import { SCREENING_COPY } from "@/lib/legal-screening-content";
import { withLang } from "@/lib/outbound-lang";

const OPTIONS = [
  ["valid_tps", "expired_tps", "daca", "pending_asylum", "overstay", "undocumented"],
  ["under1", "1to10", "10plus"], ["yes", "no", "unknown"],
  ["usc_spouse", "usc_child21", "lpr_family", "none"], ["home", "business", "equipment"],
] as const;
const KEYS = ["status", "time", "prior", "family"] as const;
const SOURCES = [
  ["INA § 248", "https://www.law.cornell.edu/uscode/text/8/1258"],
  ["INA § 245", "https://www.law.cornell.edu/uscode/text/8/1255"],
  ["INA § 208", "https://www.law.cornell.edu/uscode/text/8/1158"],
  ["INA § 240A", "https://www.law.cornell.edu/uscode/text/8/1229b"],
  ["INA § 241", "https://www.law.cornell.edu/uscode/text/8/1231"],
  ["USCIS · TPS / § 245", "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20220701-TPSAndAOS.pdf"],
];

export default function LegalScreening({ lang, inIntake = false }: { lang: "en" | "es" | "ht"; inIntake?: boolean }) {
  const t = SCREENING_COPY[lang];
  const assess = useServerFn(assessScreening);
  const [answers, setAnswers] = useState<Partial<ScreeningAnswers>>({ assets: [] });
  const [step, setStep] = useState(0);
  const [assetsAnswered, setAssetsAnswered] = useState(false);
  const [result, setResult] = useState<ScreeningAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const key = KEYS[step];
  const canContinue = step === 4 ? assetsAnswered : key ? Boolean(answers[key]) : false;
  const focusPanel = () => { panel.current?.focus(); };
  const reset = () => { setAnswers({ assets: [] }); setAssetsAnswered(false); setStep(0); setResult(null); setError(false); focusPanel(); };

  return <section id="readiness-screener" className="legal-screening" aria-labelledby="legal-screening-heading">
    <div className="legal-screening-inner">
      <header><Scale aria-hidden="true" /><h2 id="legal-screening-heading">{t.heading}</h2><p>{t.intro}</p><p className="legal-screening-note">{t.privacy}</p></header>
      <div ref={panel} tabIndex={-1} className="legal-screening-panel">
        {!result ? <form onSubmit={async e => {
          e.preventDefault();
          if (busy || !canContinue) return;
          if (step < 4) { setStep(step + 1); focusPanel(); return; }
          const parsed = screeningSchema.safeParse(answers);
          if (!parsed.success) { setError(true); return; }
          setBusy(true); setError(false);
          try { setResult(await assess({ data: parsed.data })); focusPanel(); }
          catch { setError(true); }
          finally { setBusy(false); }
        }}>
          <p className="legal-screening-step" aria-live="polite">{step + 1} / 5</p>
          <fieldset disabled={busy}><legend>{t.questions[step]}</legend>
            <div className="legal-screening-options">
              {OPTIONS[step].map((value, i) => <label key={value}>
                <input type={step === 4 ? "checkbox" : "radio"} name={`legal-${step}`} value={value}
                  checked={step === 4 ? answers.assets?.some(a => a === value) ?? false : key ? answers[key] === value : false}
                  onChange={e => {
                    setError(false);
                    if (step === 4) {
                      if (value !== "home" && value !== "business" && value !== "equipment") return;
                      const asset = value;
                      const checked = e.target.checked;
                      setAssetsAnswered(true);
                      setAnswers(current => ({ ...current, assets: checked ? [...(current.assets ?? []), asset] : current.assets?.filter(a => a !== asset) ?? [] }));
                    } else if (key) setAnswers(current => ({ ...current, [key]: value }));
                  }} />
                <span>{t.options[step][i]}</span>
              </label>)}
              {step === 4 && <label><input type="checkbox" checked={assetsAnswered && answers.assets?.length === 0} onChange={e => { setAssetsAnswered(e.target.checked); setAnswers(current => ({ ...current, assets: [] })); }} /><span>{t.none}</span></label>}
            </div>
          </fieldset>
          <div className="legal-screening-actions">
            {step > 0 && <Button variant="outline" type="button" disabled={busy} onClick={() => { setStep(step - 1); setError(false); focusPanel(); }}><ArrowLeft />{t.back}</Button>}
            <Button type="submit" disabled={!canContinue || busy}>{busy ? t.busy : step === 4 ? t.submit : t.next}<ArrowRight /></Button>
          </div>
          {error && <p role="alert">{t.error}</p>}
        </form> : <div className="legal-screening-results" aria-live="polite">
          <h3>{t.indicators[result.indicator]}</h3>
          <p className="legal-screening-note">{t.odds}</p>
          <ul>{result.findings.map(finding => <li key={finding}>{t.findings[finding]}</li>)}</ul>
          <p className="legal-screening-warning">{t.fees}</p>
          {!inIntake && <Button asChild><a href={`/intake?lang=${lang}`}>{t.counsel}<ArrowRight /></a></Button>}
          {inIntake && <p><strong>{t.counsel}</strong></p>}
          {(result.home || result.business || result.equipment) && <div className="legal-screening-economic">
            <h4>{t.economic}</h4>
            {result.home && <p>{t.home}<br /><a href={withLang("https://savemyhometrust.com/trust", lang)} target="_blank" rel="noopener noreferrer">Save My Home Trust <ArrowRight size={16} /></a></p>}
            {result.business && <p>{t.business}<br /><a href={withLang("https://savemybusiness.com", lang)} target="_blank" rel="noopener noreferrer">Save My Business <ArrowRight size={16} /></a></p>}
            {result.equipment && <p>{t.equipment}</p>}
          </div>}
          <Button type="button" variant="outline" onClick={reset}><RotateCcw />{t.reset}</Button>
        </div>}
      </div>
      <p className="legal-screening-disclaimer">{t.disclaimer}</p>
      <details><summary>{t.sources}</summary><ul>{SOURCES.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul></details>
    </div>
  </section>;
}