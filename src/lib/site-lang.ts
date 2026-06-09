// Read site-wide language selection from localStorage (set by LanguageProvider).
// Used as a fallback when a route's `?lang=` is missing or invalid.
export type SiteLang = "es" | "en" | "ht";

export function readSiteLang(): SiteLang {
  if (typeof window === "undefined") return "es";
  try {
    const v = window.localStorage.getItem("dd_lang");
    if (v === "es" || v === "en" || v === "ht") return v;
  } catch { /* ignore */ }
  return "es";
}

// Returns the lang from the current URL if valid, else falls back to site lang.
export function urlLangOrSite(): SiteLang {
  if (typeof window === "undefined") return "es";
  const u = new URLSearchParams(window.location.search).get("lang");
  if (u === "es" || u === "en" || u === "ht") return u;
  return readSiteLang();
}

export function isValidLang(v: string | null | undefined): v is SiteLang {
  return v === "es" || v === "en" || v === "ht";
}
