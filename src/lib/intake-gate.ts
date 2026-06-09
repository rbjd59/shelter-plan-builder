// Pure resolver for the /intake deep-link gate.
// Decides what should happen when a user lands on /intake, given:
//   - rawLang: the ?lang= query param from the URL (null/invalid if missing)
//   - siteLang: the site-wide preference read from dd_lang
//   - isAccepted: function returning true if the agreement has been accepted
//                 for a given language in localStorage
//
// Three possible outcomes:
//   - { kind: "rewrite",   lang } → URL needs ?lang=<lang> (replace nav to /intake)
//   - { kind: "agreement", lang } → redirect to /agreement?lang=<lang>
//   - { kind: "render",    lang } → render intake content in <lang>
export type Lang = "es" | "en" | "ht";

export type IntakeGateDecision =
  | { kind: "rewrite"; lang: Lang }
  | { kind: "agreement"; lang: Lang }
  | { kind: "render"; lang: Lang };

export function isValidLang(v: unknown): v is Lang {
  return v === "es" || v === "en" || v === "ht";
}

export function resolveIntakeGate(input: {
  rawLang: string | null | undefined;
  siteLang: Lang;
  isAccepted: (lang: Lang) => boolean;
}): IntakeGateDecision {
  const { rawLang, siteLang, isAccepted } = input;
  const target: Lang = isValidLang(rawLang) ? rawLang : siteLang;

  // URL must match the resolved target (missing or invalid → rewrite).
  if (rawLang !== target) {
    return { kind: "rewrite", lang: target };
  }
  if (!isAccepted(target)) {
    return { kind: "agreement", lang: target };
  }
  return { kind: "render", lang: target };
}
