import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { HOME_PLAIN } from "@/lib/home-plain-content";

/**
 * Homepage hero invariant: under the "Protect the American Dream" heading the
 * page must state that this is the one place a non-citizen at risk of detention
 * or deportation can go for everything they need — in all three languages.
 */
const LANGS = ["en", "es", "ht"] as const;

describe("Hero one-stop-shop line under the main heading", () => {
  for (const lang of LANGS) {
    it(`${lang.toUpperCase()}: states one place, non-citizen, detention and deportation`, () => {
      const line = HOME_PLAIN[lang].oneStop;
      expect(line.length).toBeGreaterThan(20);
      expect(line).toMatch(/one place|un solo lugar|yon sèl kote/i);
      expect(line).toMatch(/not a U\.S\. citizen|no es ciudadano|pa sitwayen ameriken/i);
      expect(line).toMatch(/detain|detener|detener|arete/i);
      expect(line).toMatch(/deport|deportar|depòte/i);
    });
  }

  it("the three languages are not copies of each other", () => {
    const lines = LANGS.map((l) => HOME_PLAIN[l].oneStop);
    expect(new Set(lines).size).toBe(3);
  });

  it("renders directly after the h1 and before the subheading", () => {
    const src = readFileSync("src/components/HeroIntro.tsx", "utf8");
    const h1 = src.indexOf("<h1>{t.crisisTitle}</h1>");
    const position = src.indexOf('className="home-hero-position"');
    const subheading = src.indexOf('className="home-hero-subheading"');
    expect(h1).toBeGreaterThan(-1);
    expect(position).toBeGreaterThan(h1);
    expect(subheading).toBeGreaterThan(position);
  });
});
