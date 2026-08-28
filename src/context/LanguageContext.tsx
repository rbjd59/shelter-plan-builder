import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { detectBrowserLang, detectHostLang } from "@/lib/site-lang";

export type Lang = "es" | "en" | "ht";
const LS_KEY = "dd_lang";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "es",
  setLang: () => {},
});

export { detectBrowserLang };

function readInitial(): Lang {
  if (typeof window === "undefined") return "es";
  const url = new URLSearchParams(window.location.search).get("lang");
  if (url === "es" || url === "en" || url === "ht") return url;
  // Alias domains (ListoAhora = es, PareKounya = ht) force their language.
  const host = detectHostLang();
  if (host) return host;
  let ls: string | null = null;
  try {
    ls = window.localStorage.getItem(LS_KEY);
  } catch { /* storage blocked */ }
  if (ls === "es" || ls === "en" || ls === "ht") return ls;
  return detectBrowserLang() ?? "es";
}



export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with the SSR default ("es") so server + first client render match.
  // Switch to the user's stored/URL preference after hydration.
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const initial = readInitial();
    setLangState(initial);
    document.documentElement.setAttribute("lang", initial);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    try {
      window.localStorage.setItem(LS_KEY, lang);
    } catch {}
  }, [lang]);

  const setLang = (l: Lang) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", l);
    }
    try {
      window.localStorage.setItem(LS_KEY, l);
    } catch {}
    setLangState(l);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
