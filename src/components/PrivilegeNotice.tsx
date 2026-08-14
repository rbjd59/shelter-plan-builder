import { useLang } from "@/context/LanguageContext";
import {
  PRIVILEGE_NOTICE,
  PRIVILEGE_HEADING,
  PRIVILEGE_SCOPE,
  type DiscLang,
} from "@/lib/operating-disclosure";

/**
 * Attorney-client privilege panel (disclosed-agent / Kovel model).
 *
 * The Company collects intake only as the Firm's disclosed agent, under the
 * Firm's supervision and confidentiality obligations, so case communications
 * are the Firm's client information and privilege attaches through the Firm.
 * Scope line keeps the claim accurate: privilege covers case communications,
 * not general browsing or marketing pages.
 */
export function PrivilegeNotice({
  lang,
  variant = "dark",
}: {
  lang?: DiscLang;
  variant?: "dark" | "light";
}) {
  const ctx = useLang();
  const L = (lang ?? ctx.lang) as DiscLang;
  const dark = variant === "dark";

  return (
    <section
      aria-label={PRIVILEGE_HEADING[L] ?? PRIVILEGE_HEADING.en}
      style={{
        background: dark ? "rgba(107,79,79,0.18)" : "#f6f2f2",
        border: "2px solid #6B4F4F",
        borderRadius: 14,
        padding: "1.1rem 1.25rem",
        margin: "1.25rem 0",
        color: dark ? "rgba(255,255,255,0.95)" : "#27272a",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h2
        style={{
          margin: "0 0 0.5rem",
          fontSize: "1.05rem",
          fontWeight: 800,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: dark ? "#e8a04a" : "#6B4F4F",
        }}
      >
        {PRIVILEGE_HEADING[L] ?? PRIVILEGE_HEADING.en}
      </h2>
      <p style={{ margin: "0 0 0.6rem", fontSize: 14, lineHeight: 1.6 }}>
        {PRIVILEGE_NOTICE[L] ?? PRIVILEGE_NOTICE.en}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          lineHeight: 1.55,
          fontStyle: "italic",
          color: dark ? "rgba(255,255,255,0.75)" : "#52525b",
        }}
      >
        {PRIVILEGE_SCOPE[L] ?? PRIVILEGE_SCOPE.en}
      </p>
    </section>
  );
}

export default PrivilegeNotice;
