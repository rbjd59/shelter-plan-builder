import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useLang } from "@/context/LanguageContext";
import { FIRM } from "@/lib/firm-info";
import { RETAINER, RETAINER_VERSION, type RetainerLang } from "@/lib/retainer-content";
import { signRetainer } from "@/lib/retainer.functions";
import { supabase } from "@/integrations/supabase/client";
import { LegalDisclaimerFooter } from "@/components/LegalDisclaimerFooter";

const searchSchema = z.object({
  next: z.string().optional(),
  session: z.string().optional(),
});

export const Route = createFileRoute("/retainer")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Limited-Scope Legal Services Agreement — Sign before intake" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RetainerPage,
});

function buildBodySnapshot(lang: RetainerLang): string {
  const c = RETAINER[lang];
  const lines: string[] = [
    `=== ${c.title} ===`,
    `Version: ${RETAINER_VERSION}  Language: ${lang}`,
    "",
    c.intro,
    "",
    c.scopeHeading,
    ...c.scope.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    c.outOfScopeHeading,
    ...c.outOfScope.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    c.feeHeading,
    c.fee,
    "",
    c.terminationHeading,
    c.termination,
    "",
    c.noGuaranteeHeading,
    c.noGuarantee,
    "",
    c.consentHeading,
    c.consent,
  ];
  return lines.join("\n");
}

function RetainerPage() {
  const { lang } = useLang() as { lang: RetainerLang };
  const { next, session } = Route.useSearch();
  const navigate = useNavigate();
  const c = RETAINER[lang] ?? RETAINER.en;
  const body = useMemo(() => buildBodySnapshot(lang), [lang]);

  const [signedName, setSignedName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acknowledged) {
      setError(c.acknowledgeLabel);
      return;
    }
    if (signedName.trim().length < 2) {
      setError("Please type your full legal name.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      await signRetainer({
        data: {
          version: RETAINER_VERSION,
          language: lang,
          signedName: signedName.trim(),
          bodySnapshot: body,
          intakeSessionId: session,
          userId: userData.user?.id,
        },
      });
      const target = next || "/intake";
      navigate({ to: target as never, search: { lang } as never });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record signature.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fafaf9", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: "#1c1917" }}>
      <header style={{ background: "#0b0b0e", color: "#e4e4e7", padding: "20px", borderBottom: `3px solid ${FIRM.accentColor}` }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p style={{ margin: 0, fontSize: 12, color: FIRM.accentColor, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
            {FIRM.legalName} · {FIRM.attorney}
          </p>
          <h1 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 28, margin: "6px 0 0", color: "#fff" }}>
            {c.title}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
        {c.translationNotice && (
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 20 }}>
            {c.translationNotice}
          </div>
        )}

        <article style={{ background: "#fff", border: "1px solid #e7e5e4", borderRadius: 12, padding: 28, fontSize: 15, lineHeight: 1.7 }}>
          <p>{c.intro}</p>

          <h2 style={H2}>{c.scopeHeading}</h2>
          <ol>{c.scope.map((s, i) => <li key={i}>{s}</li>)}</ol>

          <h2 style={H2}>{c.outOfScopeHeading}</h2>
          <ol>{c.outOfScope.map((s, i) => <li key={i}>{s}</li>)}</ol>

          <h2 style={H2}>{c.feeHeading}</h2>
          <p>{c.fee}</p>

          <h2 style={H2}>{c.terminationHeading}</h2>
          <p>{c.termination}</p>

          <h2 style={H2}>{c.noGuaranteeHeading}</h2>
          <p>{c.noGuarantee}</p>

          <h2 style={H2}>{c.consentHeading}</h2>
          <p>{c.consent}</p>

          <p style={{ marginTop: 24, fontSize: 12, color: "#78716c" }}>
            Version: <code>{RETAINER_VERSION}</code>
          </p>
        </article>

        <form onSubmit={onSign} style={{
          marginTop: 24,
          background: "#fff",
          border: `2px solid ${FIRM.accentColor}`,
          borderRadius: 12,
          padding: 24,
        }}>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={{ marginTop: 4, width: 18, height: 18 }}
            />
            <span style={{ fontSize: 14 }}>{c.acknowledgeLabel}</span>
          </label>

          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            {c.signaturePrompt}
          </label>
          <input
            type="text"
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            autoComplete="name"
            placeholder="Full legal name"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #d6d3d1",
              fontSize: 18,
              fontFamily: "Libre Baskerville, Georgia, serif",
              fontStyle: "italic",
            }}
            required
          />
          <p style={{ fontSize: 12, color: "#78716c", marginTop: 8 }}>{c.signatureNote}</p>

          {error && (
            <p role="alert" style={{ color: "#b91c1c", fontSize: 13, marginTop: 12 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "14px 20px",
              borderRadius: 8,
              background: submitting ? "#a8a29e" : FIRM.accentColor,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: submitting ? "wait" : "pointer",
            }}
          >
            {submitting ? "Recording signature…" : c.signButton}
          </button>
        </form>
      </main>

      <LegalDisclaimerFooter />
    </div>
  );
}

const H2: React.CSSProperties = {
  fontFamily: "Libre Baskerville, Georgia, serif",
  fontSize: 18,
  marginTop: 24,
  marginBottom: 8,
  color: "#292524",
};
