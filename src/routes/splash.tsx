import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const HOST_ID = "staff-access-host";

function SplashPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { setLang } = useLang();
  const navigate = useNavigate();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    document.body.classList.add("splash-active");
    return () => document.body.classList.remove("splash-active");
  }, []);

  useEffect(() => {
    const root = ref.current;
    console.log("[splash effect]", { hasRoot: !!root, grid: !!root?.querySelector(".lang-grid") });
    if (!root) return;

    // Idempotently insert a host node right after the .lang-grid so the tile
    // visually appears inside the splash hero, not below the fold.
    let h = root.querySelector<HTMLElement>(`#${HOST_ID}`);
    if (!h) {
      const grid = root.querySelector(".lang-grid");
      console.log("[splash effect] creating host", { grid: !!grid });
      if (grid && grid.parentNode) {
        h = document.createElement("div");
        h.id = HOST_ID;
        h.style.cssText =
          "width:100%;max-width:980px;margin:1.25rem auto 0;padding:0;display:block;";
        grid.parentNode.insertBefore(h, grid.nextSibling);
      }
    }
    setHost(h ?? null);

    const onClick = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLAnchorElement>(".lang-tile");
      if (!tile || !tile.hasAttribute("data-lang")) return;
      e.preventDefault();
      const lang = (tile.getAttribute("data-lang") as Lang) || "es";
      setLang(lang);
      navigate({ to: "/", search: { lang } as never });
    };
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
    };
  }, [navigate, setLang]);

  return (
    <>
      <div id="splash-view" ref={ref} dangerouslySetInnerHTML={{ __html: SPLASH_HTML }} />
      {host && createPortal(<StaffAccessTile />, host)}
    </>
  );
}
