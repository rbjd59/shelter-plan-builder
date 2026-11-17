import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusiness, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Lang } from "@/context/LanguageContext";
import { useBusinessLang } from "@/lib/business-lang";
import { BUSINESS_INTAKE_COPY, businessIntakeSchema } from "@/lib/business-intake";
import { submitBusinessIntake } from "@/lib/business-intake.functions";
import { BUSINESS_PARALEGAL_PHONE, BUSINESS_PARALEGAL_PHONE_DISPLAY } from "@/lib/business-config";

export default function BusinessIntake() {
  const { lang, setLang } = useBusinessLang();
  const c = BUSINESS_INTAKE_COPY[lang];
  const submit = useServerFn(submitBusinessIntake);
  const [requestId, setRequestId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  return (
    <main className="business-site business-intake">
      <header className="business-header">
        <Link to="/business" className="business-brand" search={{ lang }}>
          <BriefcaseBusiness aria-hidden="true" />
          <span>
            Do Not Forget
            <br />
            Your Business
          </span>
        </Link>
        <div className="business-languages">
          {(["en", "es", "ht"] as Lang[]).map((l) => (
            <Button key={l} variant="outline" aria-pressed={lang === l} onClick={() => setLang(l)}>
              {l === "en" ? "English" : l === "es" ? "Español" : "Kreyòl"}
            </Button>
          ))}
        </div>
      </header>
      <section className="business-band business-intake-layout">
        <div>
          <h1>{c.title}</h1>
          <p>{c.body}</p>
          <div className="business-actions">
            <Button asChild variant="outline">
              <a href={`tel:${BUSINESS_PARALEGAL_PHONE}`}>
                <Phone />
                {c.call} · {BUSINESS_PARALEGAL_PHONE_DISPLAY}
              </a>
            </Button>
          </div>
          <p className="business-note">{c.privacy}</p>
          <p className="business-note">{c.note}</p>
          <Link to="/business" search={{ lang }}>
            {c.back} →
          </Link>
        </div>
        {saved ? (
          <div className="business-intake-result" role="status">
            <Check aria-hidden="true" />
            <h2>{c.saved}</h2>
            <p>{c.assigned}</p>
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError(false);
              const fields = new FormData(event.currentTarget);
              const id = requestId ?? crypto.randomUUID();
              setRequestId(id);
              const result = businessIntakeSchema.safeParse({
                requestId: id,
                language: lang,
                fullName: fields.get("fullName"),
                phone: fields.get("phone"),
                email: fields.get("email"),
                businessName: fields.get("businessName"),
                work: fields.get("work"),
                city: fields.get("city"),
                bestTime: fields.get("bestTime"),
                message: fields.get("message"),
                consent: fields.get("consent") === "on",
              });
              if (!result.success) {
                setError(true);
                return;
              }
              setBusy(true);
              try {
                await submit({ data: result.data });
                setSaved(true);
              } catch {
                setError(true);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              {c.name}
              <input name="fullName" autoComplete="name" required minLength={2} maxLength={120} />
            </label>
            <label>
              {c.phone}
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                minLength={7}
                maxLength={40}
              />
            </label>
            <label>
              {c.email}
              <input name="email" type="email" autoComplete="email" maxLength={200} />
            </label>
            <label>
              {c.business}
              <input name="businessName" autoComplete="organization" maxLength={160} />
            </label>
            <label>
              {c.work}
              <input name="work" required minLength={2} maxLength={200} />
            </label>
            <label>
              {c.city}
              <input name="city" maxLength={120} />
            </label>
            <label>
              {c.time}
              <input name="bestTime" maxLength={200} />
            </label>
            <label>
              {c.message}
              <textarea name="message" rows={3} maxLength={2000} />
            </label>
            <label className="business-intake-consent">
              <input name="consent" type="checkbox" required />
              {c.consent}
            </label>
            {error && <p role="alert">{c.error}</p>}
            <Button type="submit" disabled={busy}>
              {busy ? c.sending : c.send}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
