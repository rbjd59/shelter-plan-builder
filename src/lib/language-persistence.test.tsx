/**
 * @vitest-environment jsdom
 *
 * Verifies that selecting a language via the LanguageProvider persists
 * across simulated page reloads on iPhone viewport widths. The provider
 * stores the choice in localStorage under "dd_lang" and rehydrates from
 * it on next mount.
 */
import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { LanguageProvider, useLang, type Lang } from "@/context/LanguageContext";

const IPHONE_VIEWPORTS = [
  { name: "iPhone SE", w: 320, h: 568 },
  { name: "iPhone 13 mini", w: 375, h: 812 },
  { name: "iPhone 14", w: 390, h: 844 },
  { name: "iPhone 14 Plus", w: 428, h: 926 },
];

function setViewport(w: number, h: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
  window.dispatchEvent(new Event("resize"));
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("Language persistence across reloads (iPhone widths)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Strip any ?lang= param so URL doesn't override storage
    window.history.replaceState({}, "", "/");
    document.documentElement.removeAttribute("lang");
  });

  afterEach(() => cleanup());

  for (const vp of IPHONE_VIEWPORTS) {
    for (const lang of ["es", "en", "ht"] as Lang[]) {
      it(`persists ${lang.toUpperCase()} after reload on ${vp.name} (${vp.w}x${vp.h})`, () => {
        setViewport(vp.w, vp.h);

        // First mount — simulate user selecting a language
        const first = renderHook(() => useLang(), { wrapper });
        act(() => first.result.current.setLang(lang));
        expect(first.result.current.lang).toBe(lang);
        expect(window.localStorage.getItem("dd_lang")).toBe(lang);
        expect(document.documentElement.getAttribute("lang")).toBe(lang);

        // Simulate reload: unmount provider, keep localStorage, remount
        first.unmount();

        const second = renderHook(() => useLang(), { wrapper });
        expect(second.result.current.lang).toBe(lang);
        expect(document.documentElement.getAttribute("lang")).toBe(lang);
      });
    }
  }

  it("defaults to ES when no prior selection exists", () => {
    setViewport(390, 844);
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe("es");
  });
});
