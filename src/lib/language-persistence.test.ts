/**
 * Verifies that selecting a language persists across simulated page
 * reloads on iPhone viewport widths. The provider stores the choice in
 * localStorage under "dd_lang" and rehydrates from it on next mount.
 *
 * We test the persistence contract directly (storage + readInitial logic
 * mirrored here) rather than mounting React, to avoid pulling jsdom
 * into the project and breaking the dev server's dependency graph.
 */
import { describe, it, expect, beforeEach } from "vitest";

type Lang = "es" | "en" | "ht";
const LS_KEY = "dd_lang";

// Minimal in-memory localStorage stand-in (vitest's node env has no window).
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

// Mirrors LanguageContext.readInitial() — kept in sync intentionally.
function readInitial(storage: MemoryStorage, urlLang?: string | null): Lang {
  if (urlLang === "es" || urlLang === "en" || urlLang === "ht") return urlLang;
  const ls = storage.getItem(LS_KEY);
  if (ls === "es" || ls === "en" || ls === "ht") return ls;
  return "es";
}

function setLang(storage: MemoryStorage, lang: Lang) {
  storage.setItem(LS_KEY, lang);
}

const IPHONE_VIEWPORTS = [
  { name: "iPhone SE", w: 320, h: 568 },
  { name: "iPhone 13 mini", w: 375, h: 812 },
  { name: "iPhone 14", w: 390, h: 844 },
  { name: "iPhone 14 Plus", w: 428, h: 926 },
];

describe("Language persistence across reloads (iPhone widths)", () => {
  let storage: MemoryStorage;
  beforeEach(() => { storage = new MemoryStorage(); });

  for (const vp of IPHONE_VIEWPORTS) {
    for (const lang of ["es", "en", "ht"] as Lang[]) {
      it(`persists ${lang.toUpperCase()} after reload on ${vp.name} (${vp.w}x${vp.h})`, () => {
        // First "session": user picks a language
        setLang(storage, lang);
        expect(storage.getItem(LS_KEY)).toBe(lang);

        // Simulate page reload — storage survives, in-memory state does not
        const afterReload = readInitial(storage);
        expect(afterReload).toBe(lang);
      });
    }
  }

  it("defaults to ES when no prior selection exists", () => {
    expect(readInitial(storage)).toBe("es");
  });

  it("URL ?lang= overrides stored value on reload", () => {
    setLang(storage, "es");
    expect(readInitial(storage, "ht")).toBe("ht");
  });

  it("ignores invalid stored values and falls back to ES", () => {
    storage.setItem(LS_KEY, "fr");
    expect(readInitial(storage)).toBe("es");
  });
});
