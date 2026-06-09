import { describe, it, expect } from "vitest";
import { resolveIntakeGate, type Lang } from "./intake-gate";

const acceptAll = (_: Lang) => true;
const acceptNone = (_: Lang) => false;
const acceptOnly = (allowed: Lang) => (l: Lang) => l === allowed;

describe("resolveIntakeGate — direct /intake deep links", () => {
  describe("missing ?lang=", () => {
    it("rewrites to dd_lang (es) when no lang param", () => {
      expect(
        resolveIntakeGate({ rawLang: null, siteLang: "es", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "es" });
    });

    it("rewrites to dd_lang (en) when no lang param and site lang is en", () => {
      expect(
        resolveIntakeGate({ rawLang: null, siteLang: "en", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "en" });
    });

    it("rewrites to dd_lang (ht) when no lang param and site lang is ht", () => {
      expect(
        resolveIntakeGate({ rawLang: undefined, siteLang: "ht", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "ht" });
    });
  });

  describe("invalid ?lang=", () => {
    it("rewrites to site lang when ?lang=fr", () => {
      expect(
        resolveIntakeGate({ rawLang: "fr", siteLang: "en", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "en" });
    });

    it("rewrites when ?lang is empty string", () => {
      expect(
        resolveIntakeGate({ rawLang: "", siteLang: "es", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "es" });
    });

    it("rewrites when ?lang is garbage", () => {
      expect(
        resolveIntakeGate({ rawLang: "xx-YY", siteLang: "ht", isAccepted: acceptAll }),
      ).toEqual({ kind: "rewrite", lang: "ht" });
    });
  });

  describe("mismatched ?lang vs dd_lang", () => {
    it("honors the URL lang (en) even when dd_lang is es, and renders if accepted", () => {
      expect(
        resolveIntakeGate({ rawLang: "en", siteLang: "es", isAccepted: acceptOnly("en") }),
      ).toEqual({ kind: "render", lang: "en" });
    });

    it("redirects to /agreement in URL lang when URL lang not accepted, even if site lang is accepted", () => {
      expect(
        resolveIntakeGate({ rawLang: "ht", siteLang: "es", isAccepted: acceptOnly("es") }),
      ).toEqual({ kind: "agreement", lang: "ht" });
    });

    it("URL lang wins over site lang for the resolved target", () => {
      const decision = resolveIntakeGate({
        rawLang: "en",
        siteLang: "ht",
        isAccepted: acceptAll,
      });
      expect(decision.lang).toBe("en");
      expect(decision.kind).toBe("render");
    });
  });

  describe("valid ?lang= acceptance gate", () => {
    it("redirects to /agreement when lang not accepted", () => {
      expect(
        resolveIntakeGate({ rawLang: "es", siteLang: "es", isAccepted: acceptNone }),
      ).toEqual({ kind: "agreement", lang: "es" });
    });

    it("renders intake when lang is accepted", () => {
      expect(
        resolveIntakeGate({ rawLang: "es", siteLang: "es", isAccepted: acceptAll }),
      ).toEqual({ kind: "render", lang: "es" });
    });

    it("each language has independent acceptance", () => {
      const accepted = acceptOnly("en");
      expect(
        resolveIntakeGate({ rawLang: "en", siteLang: "en", isAccepted: accepted }).kind,
      ).toBe("render");
      expect(
        resolveIntakeGate({ rawLang: "es", siteLang: "es", isAccepted: accepted }).kind,
      ).toBe("agreement");
      expect(
        resolveIntakeGate({ rawLang: "ht", siteLang: "ht", isAccepted: accepted }).kind,
      ).toBe("agreement");
    });
  });
});
