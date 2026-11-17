import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useLang, type Lang } from "@/context/LanguageContext";

export function parseBusinessLang(value: unknown): Lang | undefined {
  return value === "en" || value === "es" || value === "ht" ? value : undefined;
}

/** Business pages: ?lang= is the source of truth so SSR, first frame and button switches agree. */
export function useBusinessLang() {
  const { lang: stored, setLang: setStored } = useLang();
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const urlLang = parseBusinessLang(search.lang);
  const lang = urlLang ?? stored;
  const navigate = useNavigate();
  useEffect(() => {
    if (urlLang && urlLang !== stored) setStored(urlLang);
  }, [urlLang, stored, setStored]);
  const setLang = (next: Lang) => {
    setStored(next);
    void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, lang: next }), replace: true, resetScroll: false } as never);
  };
  return { lang, setLang };
}
