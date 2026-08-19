export type EmailLanguage = "en" | "es" | "ht";

const LANGUAGE_ALIASES: Record<string, EmailLanguage> = {
  en: "en",
  eng: "en",
  english: "en",
  es: "es",
  spa: "es",
  spanish: "es",
  espanol: "es",
  español: "es",
  ht: "ht",
  hat: "ht",
  haitian: "ht",
  "haitian creole": "ht",
  creole: "ht",
  kreyol: "ht",
  kreyòl: "ht",
  fr: "ht",
};

export function normalizeEmailLanguage(value: unknown): EmailLanguage {
  const key = typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
  return LANGUAGE_ALIASES[key] ?? "en";
}