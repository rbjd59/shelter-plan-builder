import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, RotateCcw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assessScreening } from "@/lib/legal-screening.functions";
import {
  screeningSchema,
  type ScreeningAnswers,
  type ScreeningAssessment,
} from "@/lib/legal-screening";
import { SCREENING_COPY } from "@/lib/legal-screening-content";
import { withLang } from "@/lib/outbound-lang";
import { PREPAREDNESS_COPY } from "@/lib/preparedness-content";
import { HOME_PLAIN } from "@/lib/home-plain-content";
import { HomePoints } from "@/components/HomePoints";
import { Input } from "@/components/ui/input";
import { SCREENING_SIMPLE, SCREENING_STEPS } from "@/lib/screening-simple-content";

const SOURCES = [
  ["INA § 248", "https://www.law.cornell.edu/uscode/text/8/1258"],
  ["INA § 245", "https://www.law.cornell.edu/uscode/text/8/1255"],
  ["INA § 208", "https://www.law.cornell.edu/uscode/text/8/1158"],
  ["INA § 240A", "https://www.law.cornell.edu/uscode/text/8/1229b"],
  ["INA § 241", "https://www.law.cornell.edu/uscode/text/8/1231"],
  [
    "USCIS · TPS / § 245",
    "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20220701-TPSAndAOS.pdf",
  ],
];

export default function LegalScreening({
  lang,
  inIntake = false,
}: {
  lang: "en" | "es" | "ht";
  inIntake?: boolean;
}) {
  const t = SCREENING_COPY[lang];
  const p = PREPAREDNESS_COPY[lang];
  const plain = HOME_PLAIN[lang];
  const simple = SCREENING_SIMPLE[lang];
  const questions = simple.questions;
  const optionLabels = simple.options;
  const [local, setLocal] = useState<Record<string, string>>({});
  const assess = useServerFn(assessScreening);
  const [answers, setAnswers] = useState<Partial<ScreeningAnswers>>({ assets: [] });
  const [step, setStep] = useState(0);

  const [result, setResult] = useState<ScreeningAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const currentStep = SCREENING_STEPS[step];
  const key = currentStep.key;
  const [owned, setOwned] = useState<Record<string, string>>({});
  const isOwned = key === "home" || key === "business" || key === "equipment";
  const canContinue = isOwned ? Boolean(owned[key]) : Boolean(answers[key]);
  const focusPanel = () => {
    panel.current?.focus();
  };
  const reset = () => {
    setAnswers({ assets: [] });
    setOwned({});
    setLocal({});
    setStep(0);
    setResult(null);
    setError(false);
    focusPanel();
  };

  return (
    <section
      id="readiness-screener"
      className="legal-screening"
      aria-labelledby="legal-screening-heading"
    >
      <div className="legal-screening-inner">
        <header>
          <Scale aria-hidden="true" />
          <h2 id="legal-screening-heading">{inIntake ? t.heading : plain.screeningHeading}</h2>
          {<HomePoints items={plain.screeningPoints} />}
          <p className="legal-screening-note">{plain.screeningNote}</p>
        </header>
        <div ref={panel} tabIndex={-1} className="legal-screening-panel">
          {!result ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy || !canContinue) return;
                if (step < SCREENING_STEPS.length - 1) {
                  setStep(step + 1);
                  focusPanel();
                  return;
                }
                const parsed = screeningSchema.safeParse(answers);
                if (!parsed.success) {
                  setError(true);
                  return;
                }
                setBusy(true);
                setError(false);
                try {
                  setResult(await assess({ data: parsed.data }));
                  focusPanel();
                } catch {
                  setError(true);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <p className="legal-screening-step" aria-live="polite">
                {step + 1} / {SCREENING_STEPS.length}
              </p>
              <fieldset disabled={busy}>
                <legend>{questions[step]}</legend>
                <div className="legal-screening-options">
                  {currentStep.values.map((value, i) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name={`legal-${step}`}
                        value={value}
                        checked={isOwned ? owned[key] === value : answers[key] === value}
                        onChange={() => {
                          setError(false);
                          if (isOwned) {
                            setOwned((current) => ({ ...current, [key]: value }));
                            setAnswers((current) => ({
                              ...current,
                              assets:
                                value === "yes"
                                  ? [...(current.assets ?? []).filter((a) => a !== key), key]
                                  : (current.assets ?? []).filter((a) => a !== key),
                            }));
                          } else setAnswers((current) => ({ ...current, [key]: value }));
                        }}
                      />
                      <span>{optionLabels[step][i]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {[0, 7, 10, 11, 18].includes(step) && (
                <div className="space-y-3">
                  {(step === 0
                    ? [0]
                    : step === 7
                      ? [1]
                      : step === 10
                        ? [3]
                        : step === 11
                          ? [2]
                          : [4]
                  ).map((index) => (
                    <label key={index} className="block space-y-2">
                      <span>{simple.local[index]}</span>
                      <Input
                        type={index === 0 || index === 4 ? "text" : "date"}
                        maxLength={80}
                        value={local[index] ?? ""}
                        onChange={(e) =>
                          setLocal((current) => ({ ...current, [index]: e.target.value }))
                        }
                      />
                    </label>
                  ))}
                  <p className="legal-screening-note">
                    {simple.local[step === 0 || step === 18 ? 5 : 6]} {simple.local[7]}
                  </p>
                </div>
              )}
              <div className="legal-screening-actions">
                {step > 0 && (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setStep(step - 1);
                      setError(false);
                      focusPanel();
                    }}
                  >
                    <ArrowLeft />
                    {t.back}
                  </Button>
                )}
                <Button type="submit" disabled={!canContinue || busy}>
                  {busy ? t.busy : step === SCREENING_STEPS.length - 1 ? t.submit : t.next}
                  <ArrowRight />
                </Button>
              </div>
              {error && <p role="alert">{t.error}</p>}
            </form>
          ) : (
            <div className="legal-screening-results" aria-live="polite">
              <h3>{simple.result[0]}</h3>
              <p className="legal-screening-note">{simple.result[1]}</p>
              <HomePoints items={result.findings.map((finding) => simple.findings[finding])} />
              <details>
                <summary>{plain.details}</summary>
                <ul>
                  {result.findings.map((finding) => (
                    <li key={finding}>{t.findings[finding]}</li>
                  ))}
                </ul>
              </details>
              <p className="legal-screening-warning">{simple.result[2]}</p>
              <p>{simple.result[7]}</p>
              {result.departurePlanning && <p>{simple.result[8]}</p>}
              {Object.values(local).some(Boolean) && (
                <div>
                  <p>{simple.local[7]}</p>
                  <ul>
                    {Object.entries(local)
                      .filter(([, value]) => value)
                      .map(([index, value]) => (
                        <li key={index}>
                          {simple.local[Number(index)]} {value}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {(result.childDocuments || result.vehicleDocument) && (
                <p>
                  <strong>{p.packetHeading}</strong>
                  <br />
                  {p.packetNote}
                </p>
              )}
              {!inIntake && (
                <Button asChild>
                  <a href={`/intake?lang=${lang}`}>
                    {t.counsel}
                    <ArrowRight />
                  </a>
                </Button>
              )}
              {inIntake && (
                <p>
                  <strong>{t.counsel}</strong>
                </p>
              )}
              {(result.home || result.business || result.equipment) && (
                <div className="legal-screening-economic">
                  <h4>{simple.result[3]}</h4>
                  {result.home && (
                    <p>
                      {simple.result[4]}
                      <br />
                      <a
                        href={withLang("https://savemyhometrust.com/trust", lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Save My Home Trust <ArrowRight size={16} />
                      </a>
                    </p>
                  )}
                  {result.business && (
                    <p>
                      {simple.result[5]}
                      <br />
                      <a
                        href={withLang("https://savemybusiness.com", lang)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Save My Business <ArrowRight size={16} />
                      </a>
                    </p>
                  )}
                  {result.equipment && <p>{simple.result[6]}</p>}
                </div>
              )}
              <Button type="button" variant="outline" onClick={reset}>
                <RotateCcw />
                {t.reset}
              </Button>
            </div>
          )}
        </div>
        {inIntake ? (
          <p className="legal-screening-disclaimer">{t.disclaimer}</p>
        ) : (
          <details>
            <summary>{plain.details}</summary>
            <p className="legal-screening-disclaimer">{t.disclaimer}</p>
          </details>
        )}
        <details>
          <summary>{t.sources}</summary>
          <ul>
            {SOURCES.map(([label, href]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}
