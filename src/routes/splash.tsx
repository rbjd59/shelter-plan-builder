import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { SPLASH_HTML } from "@/lib/markup";
import { useLang, type Lang } from "@/context/LanguageContext";
import StaffAccessTile from "@/components/StaffAccessPinBox";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Bienvenidos · Welcome · Byenvini" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. $199 + $10/mo from month 3. NOT a law firm.",
      },
    ],
  }),
  component: SplashPage,
});

function SplashPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { setLang } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("splash-active", "splash-has-staff");
    return () => document.body.classList.remove("splash-active", "splash-has-staff");
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLAnchorElement>(".lang-tile");
      if (!tile || !tile.hasAttribute("data-lang")) return;
      e.preventDefault();
      const lang = (tile.getAttribute("data-lang") as Lang) || "es";
      setLang(lang);
      navigate({ to: "/", search: { lang } as never });
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [navigate, setLang]);

  return (
    <>
      <div id="splash-view" ref={ref} dangerouslySetInnerHTML={{ __html: SPLASH_HTML }} />
    </>
  );
}
