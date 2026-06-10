import { describe, it, expect } from "vitest";
import { SITE_HTML } from "@/lib/markup";

/**
 * Section order invariant: #about-attorney must render BEFORE #how-it-works.
 *
 * The language toggle only swaps visibility of <span data-es|en|ht> nodes —
 * it never mutates DOM order. We assert the invariant at the markup level
 * (single source of truth) and simulate the lang switch by stripping the
 * inactive translation spans, mirroring what the browser would render at
 * iPhone viewport widths (320–428px).
 */

const IPHONE_WIDTHS = [320, 375, 390, 414, 428];
const LANGS = ["es", "en", "ht"] as const;

function renderForLang(html: string, lang: (typeof LANGS)[number]): string {
  // Remove translation spans for the other two languages, leaving the
  // active language's content in place — matches the runtime CSS behavior.
  return LANGS.filter((l) => l !== lang).reduce(
    (acc, l) =>
      acc.replace(new RegExp(`<span data-${l}>[\\s\\S]*?</span>`, "g"), ""),
    html,
  );
}

describe("Section order: About Your Attorney above Key Features", () => {
  it("attorney section precedes key-features section in source markup", () => {
    const attorneyIdx = SITE_HTML.indexOf('id="about-attorney"');
    const keyFeaturesIdx = SITE_HTML.indexOf('id="how-it-works"');
    expect(attorneyIdx).toBeGreaterThan(-1);
    expect(keyFeaturesIdx).toBeGreaterThan(-1);
    expect(attorneyIdx).toBeLessThan(keyFeaturesIdx);
  });

  for (const lang of LANGS) {
    it(`order preserved after switching language to ${lang.toUpperCase()}`, () => {
      const rendered = renderForLang(SITE_HTML, lang);
      const attorneyIdx = rendered.indexOf('id="about-attorney"');
      const keyFeaturesIdx = rendered.indexOf('id="how-it-works"');
      expect(attorneyIdx).toBeGreaterThan(-1);
      expect(keyFeaturesIdx).toBeGreaterThan(-1);
      expect(attorneyIdx).toBeLessThan(keyFeaturesIdx);
    });
  }

  for (const width of IPHONE_WIDTHS) {
    it(`mobile order rule applies at iPhone width ${width}px (<=768px breakpoint)`, () => {
      // The defensive media query in markup pins order at <=768px.
      expect(width).toBeLessThanOrEqual(768);
      expect(SITE_HTML).toContain("@media (max-width:768px)");
      expect(SITE_HTML).toMatch(/#about-attorney\s*\{[^}]*order:\s*1/);
      expect(SITE_HTML).toMatch(/#how-it-works\s*\{[^}]*order:\s*2/);
    });
  }
});
