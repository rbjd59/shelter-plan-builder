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
      <div
        id="splash-staff-strip"
        style={{
          background: "linear-gradient(180deg,#081d3a 0%,#0d2c54 100%)",
          padding: "0 1.25rem 3rem",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            width: "100%",
            margin: "0 auto",
            border: "1px solid rgba(232,160,74,0.3)",
            background: "rgba(14,26,43,0.55)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <StaffAccessTile />
        </div>
      </div>
    </>
  );
}
