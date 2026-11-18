import type { Lang } from "@/context/LanguageContext";
import { VEHICLE_PROGRAM_COPY } from "./vehicle-program-content";

export function parseVehicleLang(value: unknown): Lang | undefined {
  return value === "en" || value === "es" || value === "ht" ? value : undefined;
}

export function validateVehicleSearch(search: Record<string, unknown>): { lang?: Lang } {
  const lang = parseVehicleLang(search.lang);
  return lang ? { lang } : {};
}

export function vehicleHead(lang: Lang, path: string) {
  const c = VEHICLE_PROGRAM_COPY[lang];
  const url = `https://www.detenciondefensa.com${path}`;
  return {
    meta: [
      { title: c.metaTitle },
      { name: "description", content: c.metaDescription },
      { property: "og:title", content: c.metaTitle },
      { property: "og:description", content: c.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: c.metaTitle },
      { name: "twitter:description", content: c.metaDescription },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
