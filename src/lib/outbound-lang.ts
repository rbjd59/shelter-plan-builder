import type { SiteLang } from "@/lib/site-lang";

// Full locale tags most sites/CMSs recognize.
const LOCALE: Record<SiteLang, string> = {
  es: "es-ES",
  en: "en-US",
  ht: "ht-HT",
};

/**
 * Append the visitor's language to an outbound partner link using every
 * common parameter name (lang, hl, locale, lng, l, language) plus a hash,
 * so the destination site picks it up whichever convention it reads.
 */
export function withLang(url: string, lang: SiteLang): string {
  try {
    const u = new URL(url);
    const params: Record<string, string> = {
      lang,
      hl: lang,
      lng: lang,
      l: lang,
      language: lang,
      locale: LOCALE[lang],
    };
    for (const [k, v] of Object.entries(params)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    u.hash = `lang=${lang}`;
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}lang=${lang}&hl=${lang}&locale=${LOCALE[lang]}#lang=${lang}`;
  }
}
