import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SECTIONS, type Answers, type Q } from "@/lib/assessment/questions";
import { score, type Results } from "@/lib/assessment/score";
import { scheduleAssessment, submitAssessment } from "@/lib/assessment/assessment.functions";
import { zillowSearchUrl, type PropertyEstimate } from "@/lib/assessment/property";
import { useLang } from "@/context/LanguageContext";
import homeVideo from "@/assets/videos/protect-what-you-built-en.mp4.asset.json";
import homeVideoEs from "@/assets/videos/protect-what-you-built-es.mp4.asset.json";
import homeVideoHt from "@/assets/videos/protect-what-you-built-ht.mp4.asset.json";

const HOME_VIDEO: Record<string, string> = { en: homeVideo.url, es: homeVideoEs.url, ht: homeVideoHt.url };
const money = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

type Phase = "q" | "homeVideo" | "homeSchedule" | "bizVideo" | "bizSchedule" | "report";
type Saved = {
  assessmentId: string;
  accessToken: string;
  results: Results;
  callAt: string;
  propertyEstimate: PropertyEstimate;
  familyPacketReady: boolean;
};

export default function AssessmentSection() {
  const { lang } = useLang();
  const [step, setStep] = useState(-1);
  const [a, setA] = useState<Answers>({});
  const [help, setHelp] = useState<string[]>([]);
  const [contacts, setContacts] = useState([{ n: "", p: "" }, { n: "", p: "" }, { n: "", p: "" }]);
  const [signed, setSigned] = useState("");
  const [agree, setAgree] = useState(false);
  const [phase, setPhase] = useState<Phase>("q");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [appointments, setAppointments] = useState<Partial<Record<"home" | "business", string>>>({});
  const [busy, setBusy] = useState(false);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = useServerFn(submitAssessment);
  const schedule = useServerFn(scheduleAssessment);

  const section = SECTIONS[step];
  const visible = useMemo(() => section?.questions.filter((q) => !q.show || q.show(a)) ?? [], [section, a]);
  const last = step === SECTIONS.length - 1;

  const pick = (q: Q, v: string) => setA((p) => {
    if (!q.multi) {
      const next = { ...p, [q.id]: v };
      if (q.id === "mortgages" && v === "0") next.owed = "0";
      return next;
    }
    const cur = Array.isArray(p[q.id]) ? (p[q.id] as string[]) : [];
    const next = v === "none" ? ["none"] : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur.filter((x) => x !== "none"), v];
    return { ...p, [q.id]: next };
  });
  const toggleHelp = (id: string) => setHelp((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const scrollTop = () => document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });

  const finish = async () => {
    setErr("");
    setBusy(true);
    try {
      const answers = { ...a, contacts: contacts.filter((c) => c.n || c.p).map((c) => `${c.n} — ${c.p}`) };
      const r = await submit({ data: { language: lang, answers, help, signedName: signed } });
      setSaved(r);
      setPhase(r.results.home === "save_my_home" ? "homeVideo" : r.results.business ? "bizVideo" : "report");
      scrollTop();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const chooseAppointment = async (kind: "home" | "business", appointmentAt: string) => {
    if (!saved) return;
    setErr("");
    setScheduleBusy(true);
    try {
      const result = await schedule({ data: { assessmentId: saved.assessmentId, accessToken: saved.accessToken, kind, appointmentAt } });
      setAppointments((p) => ({ ...p, [kind]: result.appointmentAt }));
      if (kind === "home") setPhase(saved.results.business ? "bizVideo" : "report");
      else setPhase("report");
      scrollTop();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the appointment.");
    } finally {
      setScheduleBusy(false);
    }
  };

  const r = saved?.results ?? score(a);

  return (
    <section id="assessment" className="asmt">
      <div className="asmt-wrap">
        <h2 className="asmt-h">Step 1: Answer the questions</h2>
        {phase === "q" && step === -1 && (
          <div className="asmt-card">
            <p className="asmt-big">Just tap your answers. It takes about 15 minutes.</p>
            <p className="asmt-big"><b>If you don't know the answer, guess. If you can't guess, don't worry — we'll help you.</b></p>
            <p>Tap <b>"I need help with this"</b> on any question you are not sure about.</p>
            <button className="asmt-go" onClick={() => setStep(0)}>Start →</button>
          </div>
        )}
        {phase === "q" && section && (
          <div className="asmt-card">
            <p className="asmt-progress">Part {step + 1} of {SECTIONS.length}</p>
            <h3 className="asmt-title">{section.title}</h3>
            {section.intro && <p className="asmt-intro">{section.intro}</p>}
            {visible.map((q) => (
              <fieldset key={q.id} className="asmt-q">
                <legend>{q.q}</legend>
                {q.hint && <p className="asmt-hint">{q.hint}</p>}
                {q.opts && <div className={`asmt-opts${q.grid ? " asmt-grid" : ""}`}>{q.opts.map((o) => {
                  const on = q.multi ? Array.isArray(a[q.id]) && (a[q.id] as string[]).includes(o.v) : a[q.id] === o.v;
                  return <button type="button" key={o.v} aria-pressed={on} className={`asmt-opt${on ? " on" : ""}`} onClick={() => pick(q, o.v)}><span className="asmt-box">{on ? "✓" : ""}</span>{o.l}</button>;
                })}</div>}
                {q.text === "contacts" && contacts.map((c, i) => (
                  <div key={i} className="asmt-row">
                    <input aria-label={`Contact ${i + 1} name`} placeholder={`Person ${i + 1} name`} value={c.n} onChange={(e) => setContacts((cs) => cs.map((x, j) => (j === i ? { ...x, n: e.target.value } : x)))} />
                    <input aria-label={`Contact ${i + 1} phone`} placeholder="Phone" inputMode="tel" value={c.p} onChange={(e) => setContacts((cs) => cs.map((x, j) => (j === i ? { ...x, p: e.target.value } : x)))} />
                  </div>
                ))}
                {q.text && q.text !== "contacts" && (
                  <input
                    aria-label={q.q}
                    className="asmt-input"
                    type={q.text === "number" ? "number" : q.text === "email" ? "email" : q.text === "phone" ? "tel" : "text"}
                    min={q.text === "number" ? 0 : undefined}
                    inputMode={q.text === "phone" ? "tel" : q.text === "email" ? "email" : q.text === "number" ? "decimal" : "text"}
                    autoComplete={q.text === "address" ? "street-address" : q.text === "email" ? "email" : q.text === "phone" ? "tel" : undefined}
                    placeholder={q.placeholder}
                    value={(a[q.id] as string) ?? ""}
                    onChange={(e) => setA((p) => ({ ...p, [q.id]: e.target.value }))}
                  />
                )}
                <button type="button" className={`asmt-help${help.includes(q.id) ? " on" : ""}`} onClick={() => toggleHelp(q.id)}>
                  {help.includes(q.id) ? "✓ We will help you with this" : "🙋 I need help with this"}
                </button>
              </fieldset>
            ))}
            {last && (
              <div className="asmt-q">
                <label className="asmt-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  I let Sorrentino Law Firm PLLC get my documents for me (birth certificates, court papers, home papers, and records).</label>
                <input aria-label="Sign your name" className="asmt-input" placeholder="Type your name to sign" value={signed} onChange={(e) => setSigned(e.target.value)} />
              </div>
            )}
            {err && <p className="asmt-err" role="alert">{err}</p>}
            <div className="asmt-nav">
              <button type="button" className="asmt-back" onClick={() => setStep((s) => s - 1)}>← Back</button>
              {!last ? <button type="button" className="asmt-go" onClick={() => { setStep((s) => s + 1); scrollTop(); }}>Next →</button>
                : <button type="button" className="asmt-go" disabled={busy || !agree || signed.trim().length < 2} onClick={finish}>{busy ? "Checking home prices and saving…" : "See my results →"}</button>}
            </div>
          </div>
        )}

        {phase === "homeVideo" && (
          <div className="asmt-card">
            <h3 className="asmt-title">Good news: you qualify for Save My Home</h3>
            <p>Watch this short video first.</p>
            <video src={HOME_VIDEO[lang] ?? HOME_VIDEO.en} controls autoPlay playsInline onEnded={() => setPhase("homeSchedule")} className="asmt-video" />
            <button className="asmt-go" onClick={() => setPhase("homeSchedule")}>Next: choose a home call →</button>
          </div>
        )}
        {phase === "homeSchedule" && (
          <Scheduler
            title="Save My Home: choose your call"
            intro="Pick a day and time to talk about your home trust and home loan. We will also send you a list of home papers to gather."
            documents={["Home deed", "Latest statement for every home loan", "Home insurance and property tax bills", "HOA bill, if you have one", "Photos of the home and anything that needs repair"]}
            busy={scheduleBusy}
            error={err}
            onChoose={(iso) => chooseAppointment("home", iso)}
          />
        )}
        {phase === "bizVideo" && (
          <div className="asmt-card">
            <h3 className="asmt-title">Good news: you qualify for Save My Business</h3>
            <p>We can put your business in a trust and make it a company you can sell, run from another country, or have your family run.</p>
            <p>The Save My Business video is being made. You can learn more now at <a href="https://savemybusiness.com" target="_blank" rel="noopener noreferrer">savemybusiness.com</a>.</p>
            <button className="asmt-go" onClick={() => setPhase("bizSchedule")}>Next: choose a business call →</button>
          </div>
        )}
        {phase === "bizSchedule" && (
          <Scheduler
            title="Save My Business: choose your call"
            intro="Pick a day and time to talk with a paralegal about selling your business, running it from another country, or having your family run it."
            documents={["A list of customers and repeat jobs", "A list of workers and what they do", "Money records, receipts, or bank statements", "LLC or corporation papers, if you have them", "A list of vehicles, tools, and equipment"]}
            busy={scheduleBusy}
            error={err}
            onChoose={(iso) => chooseAppointment("business", iso)}
          />
        )}

        {phase === "report" && saved && (
          <div className="asmt-card">
            <h3 className="asmt-title">Your results</h3>
            <Row t="Can I stay?" v={r.stayBand === "high" ? "Over 15% chance" : "0% – 15% chance"} reasons={r.stayReasons} />
            <Row t="Can I come back later?" v={{ none: "Usually no waiting time", "3yr": "3-year wait", "5yr": "5-year wait", "10yr": "10-year wait", "20yr": "20-year wait", permanent: "Cannot come back (permanent bar)", unknown: "We need to check" }[r.reentryBar]} reasons={r.reentryReasons} />
            <Row t="If ICE holds me — habeas corpus" v={{ prequalified: "Yes, you pre-qualify. We will prepare it for free.", not_eligible: "Not eligible", review: "Attorney must check" }[r.habeas]} reasons={r.habeasReasons} />
            <Row t="My home" v={{ save_my_home: "Save My Home trust + home loan (HELOC)", trust_899: "$899 home trust", none: "Not needed" }[r.home]} reasons={r.homeReasons} />
            {a.ownHome === "yes" && <PropertyResult estimate={saved.propertyEstimate} address={typeof a.homeAddress === "string" ? a.homeAddress : ""} />}
            <Row t="My business" v={r.business ? "Save My Business trust + company" : "Not now"} reasons={r.businessReasons} />
            <div className="asmt-q"><b>Yes, we can help you.</b>
              <ul>
                {r.home !== "none" && <li>We can set up a trust so your family keeps your home.</li>}
                {r.home !== "none" && <li>We can help you rent, sell, or get a home loan through independent licensed people.</li>}
                {r.business && <li>We can make your business a company owned by a trust.</li>}
                <li>We can make your family papers and give you the free emergency app.</li>
              </ul>
            </div>
            <div className="asmt-q asmt-next">
              <b>Your family forms</b>
              <p>{saved.familyPacketReady ? "We prepared your family-form packet and put the draft in your file for attorney review." : "We saved your answers. Our team will prepare your family-form packet for attorney review."}</p>
              <p>After review, we will email the forms. Download and print them. Sign them in front of a notary. Keep the signed papers in a safe place and tell your trusted person where they are.</p>
            </div>
            <div className="asmt-q"><b>Please gather these documents:</b><ul>{r.documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <p>Don't have them? That's okay. We can find them for you.</p></div>
            {(appointments.home || appointments.business) && <div className="asmt-q"><b>Your calls</b><ul>
              {appointments.home && <li>Home: {new Date(appointments.home).toLocaleString()}</li>}
              {appointments.business && <li>Business: {new Date(appointments.business).toLocaleString()}</li>}
            </ul></div>}
            <div className="asmt-q asmt-next">
              <p>📧 Attorney Rosario Sorrentino will review your answers. Your full report will be emailed to you in the next <b>24 hours</b> with your next steps.</p>
              <p>📞 A paralegal will call you on <b>{new Date(saved.callAt).toLocaleDateString(lang === "en" ? "en-US" : lang === "es" ? "es-US" : "fr-HT", { weekday: "long", month: "long", day: "numeric" })}</b> to help you get your documents.</p>
            </div>
            <div className="asmt-q">
              <b>Last step: get the emergency app</b>
              <ol><li>Open the app download page.</li><li>Follow the steps for your phone.</li><li>Keep your activation code and private PIN safe.</li><li>Test the app before there is an emergency.</li></ol>
              <p><a className="asmt-link-button" href={`/get-app?lang=${lang}`}>Get the app →</a></p>
            </div>
            <Disclosures />
          </div>
        )}
      </div>
    </section>
  );
}

function Scheduler({ title, intro, documents, busy, error, onChoose }: { title: string; intro: string; documents: string[]; busy: boolean; error: string; onChoose: (iso: string) => void }) {
  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    while (out.length < 6) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
    }
    return out;
  }, []);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return <div className="asmt-card">
    <h3 className="asmt-title">{title}</h3><p>{intro}</p>
    <div className="asmt-q"><b>1. Pick a day</b><div className="asmt-opts asmt-grid">{days.map((d) => <button type="button" className={`asmt-opt${day === key(d) ? " on" : ""}`} key={key(d)} onClick={() => setDay(key(d))}>{d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</button>)}</div></div>
    {day && <div className="asmt-q"><b>2. Pick a time</b><div className="asmt-opts asmt-grid">{["09:00", "11:00", "14:00", "16:00"].map((t) => <button type="button" className={`asmt-opt${time === t ? " on" : ""}`} key={t} onClick={() => setTime(t)}>{new Date(`${day}T${t}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</button>)}</div></div>}
    <div className="asmt-q"><b>Please gather:</b><ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul><p>Missing something? That's okay. We can help you find it.</p></div>
    {error && <p className="asmt-err" role="alert">{error}</p>}
    <button type="button" className="asmt-go" disabled={!day || !time || busy} onClick={() => onChoose(new Date(`${day}T${time}:00`).toISOString())}>{busy ? "Saving…" : "Save my call →"}</button>
  </div>;
}

function PropertyResult({ estimate, address }: { estimate: PropertyEstimate; address: string }) {
  return <div className="asmt-res"><div className="asmt-res-top"><span>Current home price check</span><b>{estimate.value !== null ? money(estimate.value) : "Our team will check"}</b></div>
    {estimate.rent !== null && <p>Estimated monthly rent: <b>{money(estimate.rent)}</b></p>}
    <p>{estimate.message}</p>
    {(estimate.saleComps.length > 0 || estimate.rentComps.length > 0) && <details><summary>See similar nearby homes</summary><ul>{[...estimate.saleComps.slice(0, 3).map((c) => ({ ...c, kind: "Sale" })), ...estimate.rentComps.slice(0, 3).map((c) => ({ ...c, kind: "Rent / month" }))].map((c) => <li key={`${c.kind}-${c.address}`}>{c.kind}: {c.address}{c.price !== null ? ` — ${money(c.price)}` : ""}</li>)}</ul></details>}
    {address && <p><a href={zillowSearchUrl(address)} target="_blank" rel="noopener noreferrer">Check this address on Zillow ↗</a></p>}
  </div>;
}

function Row({ t, v, reasons }: { t: string; v: string; reasons: string[] }) {
  return (
    <div className="asmt-res"><div className="asmt-res-top"><span>{t}</span><b>{v}</b></div>
      {reasons.length > 0 && <ul>{reasons.map((x) => <li key={x}>{x}</li>)}</ul>}</div>
  );
}

function Disclosures() {
  return (
    <div className="asmt-disc">
      <b>Important information</b>
      <p>These results are an early estimate from your answers, not a final legal opinion and not a promise of any result. Attorney Rosario Sorrentino reviews every report before it is sent. Using this website does not make Sorrentino Law Firm PLLC your lawyer until you sign an engagement letter.</p>
      <p>DetencionDefensa.com, Inc. is a technology company. It is not a law firm and does not give legal advice. Legal services are provided by Sorrentino Law Firm PLLC, a separate Florida law firm owned by Rosario Sorrentino, Esq. Rosario Sorrentino has an interest in both companies.</p>
      <p>Real estate services: affiliated realtors through United Realty (Joe Mondelli). Mortgage and home loan (HELOC) services are provided by independent licensed mortgage brokers. These are separate businesses and may be paid commissions.</p>
      <p>Home values and rents are automatic estimates, not appraisals, loan approvals, or promises of a sale or rental price. Trust and company documents are drafted with AI technology and reviewed by a licensed attorney before use. Trust, company and structuring services are paid services, separate from the free app and this screening.</p>
      <p>Attorney advertising. The hiring of a lawyer is an important decision that should not be based only on advertisements. Sorrentino Law Firm PLLC is located in Florida.</p>
    </div>
  );
}
