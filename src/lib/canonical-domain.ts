export type AliasLanguage = "es" | "ht";

const CANONICAL_ORIGIN = "https://detenciondefensa.com";

const ALIAS_LANGUAGES: Readonly<Record<string, AliasLanguage>> = {
  "listoahora.org": "es",
  "www.listoahora.org": "es",
  "parekounya.org": "ht",
  "www.parekounya.org": "ht",
};

/**
 * Resolves public language-brand domains to the canonical site. The original
 * path and query string are retained, while the alias language always wins.
 */
export function canonicalAliasUrl(requestUrl: string): URL | null {
  const source = new URL(requestUrl);
  const lang = ALIAS_LANGUAGES[source.hostname.toLowerCase()];
  if (!lang) return null;

  const destination = new URL(`${source.pathname}${source.search}`, CANONICAL_ORIGIN);
  destination.searchParams.set("lang", lang);
  return destination;
}