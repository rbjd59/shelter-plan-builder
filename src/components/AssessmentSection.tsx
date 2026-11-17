import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { SECTIONS, type Answers, type Q } from "@/lib/assessment/questions";
import { score, type Results } from "@/lib/assessment/score";
import { scheduleAssessment, submitAssessment } from "@/lib/assessment/assessment.functions";
import { loadAssessmentDraft, saveAssessmentDraft } from "@/lib/assessment/assessment-drafts.functions";
import { zillowSearchUrl, type PropertyEstimate } from "@/lib/assessment/property";
import { useLang } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import homeVideo from "@/assets/videos/protect-what-you-built-en.mp4.asset.json";
import homeVideoEs from "@/assets/videos/protect-what-you-built-es.mp4.asset.json";
import homeVideoHt from "@/assets/videos/protect-what-you-built-ht.mp4.asset.json";
import businessVideo from "@/assets/videos/save-my-business-en-v1.mp4.asset.json";
import businessVideoEs from "@/assets/videos/save-my-business-es-v1.mp4.asset.json";
import businessVideoHt from "@/assets/videos/save-my-business-ht-v1.mp4.asset.json";
import AssessmentVideo from "@/components/AssessmentVideo";
import AssessmentAccount, { type AccountDetails } from "@/components/AssessmentAccount";
import { Button } from "@/components/ui/button";
import { withLang } from "@/lib/outbound-lang";
import { firstResultPhase, afterHomeVideo, afterBusinessVideo, type Phase } from "@/lib/assessment/video-flow";

const HOME_VIDEO: Record<string, string> = { en: homeVideo.url, es: homeVideoEs.url, ht: homeVideoHt.url };
const BUSINESS_VIDEO = { en: businessVideo.url, es: businessVideoEs.url, ht: businessVideoHt.url };
const BUSINESS_COPY = {
  en: { title: "Good news: you qualify for Save My Business", intro: "We can help you plan to sell your business, run it from another country, or have your family run it.", more: "Save My Business", next: "Next: choose a business call →" },
  es: { title: "Buenas noticias: puede usar Save My Business", intro: "Podemos ayudarle a planear la venta de su negocio, manejarlo desde otro país o dejar que su familia lo maneje.", more: "Save My Business", next: "Siguiente: elija una llamada para su negocio →" },
  ht: { title: "Bon nouvèl: ou ka sèvi ak Save My Business", intro: "Nou ka ede w planifye pou vann biznis ou, dirije l depi yon lòt peyi, oswa kite fanmi w dirije l.", more: "Save My Business", next: "Apre sa: chwazi yon apèl pou biznis ou →" },
};
const money = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

type Saved = {
  assessmentId: string;
  accessToken: string;
  results: Results;
  callAt: string;
  propertyEstimate: PropertyEstimate;
  familyPacketReady: boolean;
  businessReportUrl?: string;
  businessEmailSent?: boolean;
  attorneyEmailSent?: boolean;
};

export default function AssessmentSection() {
  const { lang } = useLang();
  const [step, setStep] = useState(-1);
  const [resumeStep, setResumeStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [help, setHelp] = useState<string[]>([]);
  const [contacts, setContacts] = useState([{ n: "", p: "" }, { n: "", p: "" }, { n: "", p: "" }]);
  const [signed, setSigned] = useState("");
  const [agree, setAgree] = useState(false);
  const [phase, setPhase] = useState<Phase>("q");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [appointments, setAppointments] = useState<Partial<Record<"home" | "business", string>>>({});
  const [busy, setBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [details, setDetails] = useState<AccountDetails>({ fullName: "", email: "", phone: "", smsConsent: false });
  const [laterVideo, setLaterVideo] = useState<"home" | "business" | null>(null);
  const submit = useServerFn(submitAssessment);
  const schedule = useServerFn(scheduleAssessment);
  const loadDraft = useServerFn(loadAssessmentDraft);
  const saveDraft = useServerFn(saveAssessmentDraft);

  const section = SECTIONS[step];
  const visible = useMemo(() => section?.questions.filter((q) => !q.show || q.show(a)) ?? [], [section, a]);
  const last = step === SECTIONS.length - 1;

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user);
      setAuthChecked(true);
    });
    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    return () => { active = false; listener.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) {
      setDraftLoaded(true);
      setHasDraft(false);
      setA({}); setContacts([{ n: "", p: "" }, { n: "", p: "" }, { n: "", p: "" }]); setHelp([]);
      setDetails({ fullName: "", email: "", phone: "", smsConsent: false });
      setStep(-1); setResumeStep(0); setLaterVideo(null);
      return;
    }
    let active = true;
    setDraftLoaded(false); setErr("");
    const signup = (user.user_metadata?.intake_signup ?? {}) as Record<string, unknown>;
    void loadDraft().then((draft) => {
      if (!active) return;
      if (draft) {
        setA(draft.answers); setContacts(draft.contacts.length ? draft.contacts : [{ n: "", p: "" }, { n: "", p: "" }, { n: "", p: "" }]);
        setHelp(draft.help); setResumeStep(Math.min(draft.currentStep, SECTIONS.length - 1));
        setDetails({ fullName: draft.fullName, email: draft.email, phone: draft.phone, smsConsent: draft.smsConsent });
        setHasDraft(true);
        setNotice(lang === "es" ? "Encontramos sus respuestas guardadas." : lang === "ht" ? "Nou jwenn repons ou te sove yo." : "We found your saved answers.");
      } else {
        setDetails({
          fullName: typeof signup.full_name === "string" ? signup.full_name : "",
          email: user.email ?? (typeof signup.client_email === "string" ? signup.client_email : ""),
          phone: typeof signup.client_mobile === "string" ? signup.client_mobile : "",
          smsConsent: signup.assessment_sms_consent === true,
        });
        setHasDraft(false);
      }
    }).catch((cause) => { if (active) setErr(cause instanceof Error ? cause.message : "Could not load your saved answers."); })
      .finally(() => { if (active) setDraftLoaded(true); });
    return () => { active = false; };
  }, [user, loadDraft, lang]);

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

  const saveProgress = async (status: "in_progress" | "later") => {
    if (!user) { setErr(lang === "es" ? "Entre a su cuenta para guardar." : lang === "ht" ? "Konekte pou sove." : "Sign in to save your progress."); return false; }
    setSaveBusy(true); setErr(""); setNotice("");
    const currentStep = step >= 0 ? step : resumeStep;
    try {
      await saveDraft({ data: {
        language: lang, fullName: details.fullName, email: details.email || user.email || "", phone: details.phone,
        smsConsent: details.smsConsent, answers: a, contacts, help, currentStep, status,
      } });
      setResumeStep(currentStep); setHasDraft(true);
      setNotice(lang === "es" ? "Progreso guardado. Puede volver cuando quiera." : lang === "ht" ? "Pwogrè w sove. Ou ka tounen nenpòt lè." : "Progress saved. You can come back anytime.");
      return true;
    } catch (cause) {
      setErr(cause instanceof Error ? cause.message : "Could not save your progress.");
      return false;
    } finally { setSaveBusy(false); }
  };

  const begin = async (next: "questions" | "later") => {
    const ok = await saveProgress(next === "later" ? "later" : "in_progress");
    if (!ok) return;
    setNotice("");
    if (next === "questions") { setLaterVideo(null); setStep(resumeStep); }
    else { setStep(-1); setLaterVideo("home"); }
    scrollTop();
  };

  const answerLater = async () => {
    const ok = await saveProgress("later");
    if (ok) { setStep(-1); setLaterVideo("home"); setNotice(""); scrollTop(); }
  };

  const finish = async () => {
    if (!user) { setErr("Sign in before sending your answers."); return; }
    setErr(""); setBusy(true);
    try {
      const answers = {
        ...a, name: details.fullName, phone: details.phone, email: details.email || user.email || "",
        contacts: contacts.filter((c) => c.n || c.p).map((c) => `${c.n} — ${c.p}`),
      };
      const r = await submit({ data: { language: lang, answers, help, signedName: signed } });
      setSaved(r); setHasDraft(false); setPhase(firstResultPhase(r.results)); scrollTop();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  };

  const chooseAppointment = async (kind: "home" | "business", appointmentAt: string) => {
    if (!saved) return;
    setErr(""); setScheduleBusy(true);
    try {
      const result = await schedule({ data: { assessmentId: saved.assessmentId, accessToken: saved.accessToken, kind, appointmentAt } });
      setAppointments((p) => ({ ...p, [kind]: result.appointmentAt }));
      if (kind === "home") setPhase(saved.results.business ? "bizSchedule" : "report");
      else setPhase("report");
      scrollTop();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the appointment.");
    } finally { setScheduleBusy(false); }
  };

  const r = saved?.results ?? score(a);
  const businessCopy = BUSINESS_COPY[lang];
  const saveLabel = lang === "es" ? "Guardar mi progreso" : lang === "ht" ? "Sove pwogrè mwen" : "Save my progress";
  const laterLabel = lang === "es" ? "Responderé más tarde" : lang === "ht" ? "M ap reponn pita" : "I’ll answer later";

  return (
    <section id="assessment" className="asmt">
      <div className="asmt-wrap">
        <h2 className="asmt-h">{laterVideo ? "Save My Home + Save My Business" : !user ? (lang === "es" ? "Paso 1: Cree su cuenta" : lang === "ht" ? "Etap 1: Kreye kont ou" : "Step 1: Set up your account") : (lang === "es" ? "Paso 2: Responda las preguntas" : lang === "ht" ? "Etap 2: Reponn kesyon yo" : "Step 2: Answer the questions")}</h2>

        {phase === "q" && laterVideo && <div className="asmt-card">
          <p>{lang === "es" ? "Mire ambos videos. Sus respuestas están guardadas para cuando quiera continuar." : lang === "ht" ? "Gade tou de videyo yo. Repons ou yo sove pou lè ou vle kontinye." : "Watch both videos. Your answers are saved for when you want to continue."}</p>
          {laterVideo === "home" ? <>
            <h3 className="asmt-title">Save My Home</h3>
            <AssessmentVideo src={HOME_VIDEO[lang] ?? HOME_VIDEO.en} lang={lang} title="Save My Home" onEnded={() => setLaterVideo("business")} />
            <Button className="asmt-go h-auto whitespace-normal" onClick={() => setLaterVideo("business")}>{lang === "es" ? "Siguiente: Save My Business →" : lang === "ht" ? "Apre sa: Save My Business →" : "Next: Save My Business →"}</Button>
          </> : <>
            <h3 className="asmt-title">Save My Business</h3>
            <AssessmentVideo src={BUSINESS_VIDEO[lang]} lang={lang} title="Save My Business" onEnded={() => { setLaterVideo(null); setStep(-1); }} />
            <Button className="asmt-go h-auto whitespace-normal" onClick={() => { setLaterVideo(null); setStep(resumeStep); }}>{lang === "es" ? "Responder las preguntas ahora →" : lang === "ht" ? "Reponn kesyon yo kounye a →" : "Answer the questions now →"}</Button>
          </>}
        </div>}

        {phase === "q" && !laterVideo && step === -1 && <div className="asmt-card">
          {!authChecked || (user && !draftLoaded) ? <p role="status">{lang === "es" ? "Cargando…" : lang === "ht" ? "K ap chaje…" : "Loading…"}</p> : <>
            <p className="asmt-big"><b>{lang === "es" ? "Si no sabe una respuesta, adivine. Si no puede, no se preocupe: le ayudaremos." : lang === "ht" ? "Si ou pa konnen yon repons, devine. Si ou pa ka devine, pa enkyete w — n ap ede w." : "If you don't know the answer, guess. If you can't guess, don't worry — we'll help you."}</b></p>
            <AssessmentAccount lang={lang} user={user} onUser={setUser} details={details} onDetails={setDetails} onContinue={begin} beforeSignOut={() => saveProgress("in_progress").then(() => undefined)} busy={saveBusy} error={err} notice={notice} hasDraft={hasDraft} />
          </>}
        </div>}

        {phase === "q" && !laterVideo && section && user && (
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
                {q.text && q.text !== "contacts" && <input aria-label={q.q} className="asmt-input" type={q.text === "number" ? "number" : q.text === "email" ? "email" : q.text === "phone" ? "tel" : "text"} min={q.text === "number" ? 0 : undefined} inputMode={q.text === "phone" ? "tel" : q.text === "email" ? "email" : q.text === "number" ? "decimal" : "text"} autoComplete={q.text === "address" ? "street-address" : q.text === "email" ? "email" : q.text === "phone" ? "tel" : undefined} placeholder={q.placeholder} value={(a[q.id] as string) ?? ""} onChange={(e) => setA((p) => ({ ...p, [q.id]: e.target.value }))} />}
                <button type="button" className={`asmt-help${help.includes(q.id) ? " on" : ""}`} onClick={() => toggleHelp(q.id)}>{help.includes(q.id) ? "✓ We will help you with this" : "🙋 I need help with this"}</button>
              </fieldset>
            ))}
            {last && <div className="asmt-q">
              <label className="asmt-agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />I let Sorrentino Law Firm PLLC get my documents for me (birth certificates, court papers, home papers, and records).</label>
              <input aria-label="Sign your name" className="asmt-input" placeholder="Type your name to sign" value={signed} onChange={(e) => setSigned(e.target.value)} />
            </div>}
            {err && <p className="asmt-err" role="alert">{err}</p>}
            {notice && <p className="asmt-saved" role="status">{notice}</p>}
            <div className="asmt-save-row">
              <button type="button" className="asmt-back" disabled={saveBusy} onClick={() => void saveProgress("in_progress")}>{saveBusy ? "Saving…" : saveLabel}</button>
              <button type="button" className="asmt-skip" disabled={saveBusy} onClick={() => void answerLater()}>{laterLabel}</button>
            </div>
            <div className="asmt-nav">
              <button type="button" className="asmt-back" onClick={() => { setResumeStep(step); setStep((s) => s - 1); scrollTop(); }}>← Back</button>
              {!last ? <button type="button" className="asmt-go" onClick={() => { setResumeStep(step + 1); setStep((s) => s + 1); setNotice(""); scrollTop(); }}>Next →</button>
                : <button type="button" className="asmt-go" disabled={busy || !agree || signed.trim().length < 2} onClick={finish}>{busy ? "Checking home prices and saving…" : "See my results →"}</button>}
            </div>
          </div>
        )}

        {phase === "homeVideo" && <div className="asmt-card">
          <h3 className="asmt-title">Good news: you qualify for Save My Home</h3><p>Watch this short video first.</p>
          <AssessmentVideo src={HOME_VIDEO[lang] ?? HOME_VIDEO.en} lang={lang} title="Save My Home" onEnded={() => setPhase(afterHomeVideo(r))} />
          <Button className="asmt-go h-auto whitespace-normal" onClick={() => setPhase(afterHomeVideo(r))}>{r.business ? (lang === "es" ? "Siguiente: Save My Business →" : lang === "ht" ? "Apre sa: Save My Business →" : "Next: Save My Business →") : "Next: choose a home call →"}</Button>
        </div>}
        {phase === "homeSchedule" && <Scheduler title="Save My Home: choose your call" intro="Pick a day and time to talk about your home trust and home loan. We will also send you a list of home papers to gather." documents={["Home deed", "Latest statement for every home loan", "Home insurance and property tax bills", "HOA bill, if you have one", "Photos of the home and anything that needs repair"]} busy={scheduleBusy} error={err} onChoose={(iso) => chooseAppointment("home", iso)} />}
        {phase === "bizVideo" && <div className="asmt-card">
          <h3 className="asmt-title">{businessCopy.title}</h3><p>{businessCopy.intro}</p>
          <AssessmentVideo src={BUSINESS_VIDEO[lang]} lang={lang} title="Save My Business" onEnded={() => setPhase(afterBusinessVideo(r))} />
          <p><a href={withLang("https://savemybusiness.com", lang)} target="_blank" rel="noopener noreferrer">{businessCopy.more} ↗</a></p>
          <Button className="asmt-go h-auto whitespace-normal" onClick={() => setPhase(afterBusinessVideo(r))}>{r.home === "save_my_home" ? (lang === "es" ? "Siguiente: elija una llamada para su casa →" : lang === "ht" ? "Apre sa: chwazi yon apèl pou kay ou →" : "Next: choose a home call →") : businessCopy.next}</Button>
        </div>}
        {phase === "bizSchedule" && <Scheduler title="Save My Business: choose your call" intro="Pick a day and time to talk with a paralegal about selling your business, running it from another country, or having your family run it." documents={["A list of customers and repeat jobs", "A list of workers and what they do", "Money records, receipts, or bank statements", "LLC or corporation papers, if you have them", "A list of vehicles, tools, and equipment"]} busy={scheduleBusy} error={err} onChoose={(iso) => chooseAppointment("business", iso)} />}

        {phase === "report" && saved && <div className="asmt-card">
          <h3 className="asmt-title">Your results</h3>
          <Row t="Can I stay?" v={r.stayBand === "high" ? "Over 15% chance" : "0% – 15% chance"} reasons={r.stayReasons} />
          <Row t="Can I come back later?" v={{ none: "Usually no waiting time", "3yr": "3-year wait", "5yr": "5-year wait", "10yr": "10-year wait", "20yr": "20-year wait", permanent: "Cannot come back (permanent bar)", unknown: "We need to check" }[r.reentryBar]} reasons={r.reentryReasons} />
          <Row t="If ICE holds me — habeas corpus" v={{ prequalified: "Yes, you pre-qualify. We will prepare it for free.", not_eligible: "Not eligible", review: "Attorney must check" }[r.habeas]} reasons={r.habeasReasons} />
          <Row t="My home" v={{ save_my_home: "Save My Home trust + home loan (HELOC)", trust_899: "$899 home trust", none: "Not needed" }[r.home]} reasons={r.homeReasons} />
          {a.ownHome === "yes" && <PropertyResult estimate={saved.propertyEstimate} address={typeof a.homeAddress === "string" ? a.homeAddress : ""} />}
          <Row t="My business" v={r.business ? "Save My Business trust + company" : "Not now"} reasons={r.businessReasons} />
          {r.business && saved.businessReportUrl && <div className="asmt-q asmt-next"><b>Your business report</b><p>See your value range, marketing plan and document list.</p><p><a className="asmt-link-button" href={saved.businessReportUrl}>Open my business report →</a></p><p>{saved.businessEmailSent ? "✓ We emailed the report link to you." : "The report email is not confirmed. You can open the report here."}</p></div>}
          <div className="asmt-q"><b>Yes, we can help you.</b><ul>{r.home !== "none" && <li>We can set up a trust so your family keeps your home.</li>}{r.home !== "none" && <li>We can help you rent, sell, or get a home loan through independent licensed people.</li>}{r.business && <li>We can make your business a company owned by a trust.</li>}<li>We can make your family papers and give you the free emergency app.</li></ul></div>
          <div className="asmt-q asmt-next"><b>Your family forms</b><p>{saved.familyPacketReady ? "We prepared your family-form packet and put the draft in your file for attorney review." : "We saved your answers. Our team will prepare your family-form packet for attorney review."}</p><p>After review, we will email the forms. Download and print them. Sign them in front of a notary. Keep the signed papers in a safe place and tell your trusted person where they are.</p></div>
          <div className="asmt-q"><b>Please gather these documents:</b><ul>{r.documents.map((d) => <li key={d}>{d}</li>)}</ul><p>Don't have them? That's okay. We can find them for you.</p></div>
          {(appointments.home || appointments.business) && <div className="asmt-q"><b>Your calls</b><ul>{appointments.home && <li>Home: {new Date(appointments.home).toLocaleString()}</li>}{appointments.business && <li>Business: {new Date(appointments.business).toLocaleString()}</li>}</ul></div>}
          <div className="asmt-q asmt-next"><p>📧 Attorney Rosario Sorrentino will review your answers. Your full report will be emailed to you in the next <b>24 hours</b> with your next steps.</p><p>📞 A paralegal will call you on <b>{new Date(saved.callAt).toLocaleDateString(lang === "en" ? "en-US" : lang === "es" ? "es-US" : "fr-HT", { weekday: "long", month: "long", day: "numeric" })}</b> to help you get your documents.</p></div>
          {r.business && <div className="asmt-q"><b>Talk to the business team</b><p><a className="asmt-link-button" href={`/business-call?lang=${lang}`}>Call or text a paralegal →</a> <a className="asmt-link-button" href={`/business-chat?lang=${lang}`}>Ask the AI a question →</a></p></div>}
          <div className="asmt-q"><b>Last step: get the emergency app</b><ol><li>Open the app download page.</li><li>Follow the steps for your phone.</li><li>Keep your activation code and private PIN safe.</li><li>Test the app before there is an emergency.</li></ol><p><a className="asmt-link-button" href={`/get-app?lang=${lang}`}>Get the app →</a></p></div>
          <Disclosures />
        </div>}
      </div>
    </section>
  );
}

function Scheduler({ title, intro, documents, busy, error, onChoose }: { title: string; intro: string; documents: string[]; busy: boolean; error: string; onChoose: (iso: string) => void }) {
  const days = useMemo(() => {
    const out: Date[] = []; const d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d)); }
    return out;
  }, []);
  const [day, setDay] = useState(""); const [time, setTime] = useState("");
  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return <div className="asmt-card"><h3 className="asmt-title">{title}</h3><p>{intro}</p>
    <div className="asmt-q"><b>1. Pick a day</b><div className="asmt-opts asmt-grid">{days.map((d) => <button type="button" className={`asmt-opt${day === key(d) ? " on" : ""}`} key={key(d)} onClick={() => setDay(key(d))}>{d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</button>)}</div></div>
    {day && <div className="asmt-q"><b>2. Pick a time</b><div className="asmt-opts asmt-grid">{["09:00", "11:00", "14:00", "16:00"].map((t) => <button type="button" className={`asmt-opt${time === t ? " on" : ""}`} key={t} onClick={() => setTime(t)}>{new Date(`${day}T${t}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</button>)}</div></div>}
    <div className="asmt-q"><b>Please gather:</b><ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul><p>Missing something? That's okay. We can help you find it.</p></div>
    {error && <p className="asmt-err" role="alert">{error}</p>}<button type="button" className="asmt-go" disabled={!day || !time || busy} onClick={() => onChoose(new Date(`${day}T${time}:00`).toISOString())}>{busy ? "Saving…" : "Save my call →"}</button>
  </div>;
}

function PropertyResult({ estimate, address }: { estimate: PropertyEstimate; address: string }) {
  return <div className="asmt-res"><div className="asmt-res-top"><span>Current home price check</span><b>{estimate.value !== null ? money(estimate.value) : "Our team will check"}</b></div>{estimate.rent !== null && <p>Estimated monthly rent: <b>{money(estimate.rent)}</b></p>}<p>{estimate.message}</p>{(estimate.saleComps.length > 0 || estimate.rentComps.length > 0) && <details><summary>See similar nearby homes</summary><ul>{[...estimate.saleComps.slice(0, 3).map((c) => ({ ...c, kind: "Sale" })), ...estimate.rentComps.slice(0, 3).map((c) => ({ ...c, kind: "Rent / month" }))].map((c) => <li key={`${c.kind}-${c.address}`}>{c.kind}: {c.address}{c.price !== null ? ` — ${money(c.price)}` : ""}</li>)}</ul></details>}{address && <p><a href={zillowSearchUrl(address)} target="_blank" rel="noopener noreferrer">Check this address on Zillow ↗</a></p>}</div>;
}
function Row({ t, v, reasons }: { t: string; v: string; reasons: string[] }) { return <div className="asmt-res"><div className="asmt-res-top"><span>{t}</span><b>{v}</b></div>{reasons.length > 0 && <ul>{reasons.map((x) => <li key={x}>{x}</li>)}</ul>}</div>; }
function Disclosures() { return <div className="asmt-disc"><b>Important information</b><p>These results are an early estimate from your answers, not a final legal opinion and not a promise of any result. Attorney Rosario Sorrentino reviews every report before it is sent. Using this website does not make Sorrentino Law Firm PLLC your lawyer until you sign an engagement letter.</p><p>DETENCIONDEFENSACOM, INC. is a technology company. It is not a law firm and does not give legal advice. Legal services are provided by Sorrentino Law Firm PLLC, a separate Florida law firm owned by Rosario Sorrentino, Esq. Rosario Sorrentino has an interest in both companies.</p><p>Real estate services: affiliated realtors through United Realty (Joe Mondelli). Mortgage and home loan (HELOC) services are provided by independent licensed mortgage brokers. These are separate businesses and may be paid commissions.</p><p>Home values and rents are automatic estimates, not appraisals, loan approvals, or promises of a sale or rental price. Trust and company documents are drafted with AI technology and reviewed by a licensed attorney before use. Trust, company and structuring services are paid services, separate from the free app and this screening.</p><p>Attorney advertising. The hiring of a lawyer is an important decision that should not be based only on advertisements. Sorrentino Law Firm PLLC is located in Florida.</p></div>; }
