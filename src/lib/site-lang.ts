// Read site-wide language selection from localStorage (set by LanguageProvider).
// Used as a fallback when a route's `?lang=` is missing or invalid.
export type SiteLang = "es" | "en" | "ht";

// Marketing alias domains lock the site to their language.
// listoahora.org = Spanish brand, parekounya.org = Haitian Creole brand.
const HOST_LANG: Record<string, SiteLang> = {
  "listoahora.org": "es",
  "www.listoahora.org": "es",
  "listoahora.app": "es",
  "www.listoahora.app": "es",
  "parekounya.org": "ht",
  "www.parekounya.org": "ht",
  "parekounya.app": "ht",
  "www.parekounya.app": "ht",
  "parekounya.com": "ht",
  "www.parekounya.com": "ht",
};

export function detectHostLang(): SiteLang | null {
  if (typeof window === "undefined") return null;
  return HOST_LANG[window.location.hostname.toLowerCase()] ?? null;
}


// Detect a supported language from the visitor's browser/OS locale list.
// Matches on the primary subtag so "es-MX", "es-419", "ht-HT" all resolve.
export function detectBrowserLang(): SiteLang | null {
  if (typeof navigator === "undefined") return null;
  const tags = [
    ...(Array.isArray(navigator.languages) ? navigator.languages : []),
    navigator.language,
  ].filter(Boolean) as string[];
  for (const tag of tags) {
    const primary = tag.toLowerCase().split("-")[0];
    if (primary === "es") return "es";
    if (primary === "ht") return "ht";
    if (primary === "en") return "en";
    // French speakers from Haiti are far closer to Kreyòl than to Spanish.
    if (primary === "fr") return "ht";
  }
  return null;
}

export function readSiteLang(): SiteLang {
  if (typeof window === "undefined") return "es";
  // Alias domains (ListoAhora = es, PareKounya = ht) override stored prefs.
  const host = detectHostLang();
  if (host) return host;
  try {
    const v = window.localStorage.getItem("dd_lang");
    if (v === "es" || v === "en" || v === "ht") return v;
  } catch { /* ignore */ }
  return detectBrowserLang() ?? "es";
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
