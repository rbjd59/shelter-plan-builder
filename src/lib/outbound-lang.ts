import type { SiteLang } from "@/lib/site-lang";

/**
 * Append the visitor's language to an outbound partner link. Partner sites
 * use this canonical parameter to initialize their language before render.
 */
export function withLang(url: string, lang: SiteLang): string {
  try {
    const u = new URL(url);
    u.searchParams.set("lang", lang);
    u.hash = `lang=${lang}`;
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}lang=${lang}#lang=${lang}`;
  }
}
