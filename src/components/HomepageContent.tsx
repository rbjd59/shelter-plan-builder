import { useEffect, useRef } from "react";
import { HOMEPAGE_SECTIONS } from "@/lib/homepage-sections";
import { Building2, Scale, UserRound, Gavel, ShieldCheck, Zap, Wallet, Languages, Smartphone, BadgeCheck } from "lucide-react";
import { createRoot } from "react-dom/client";

export function HomepageSection({ section }: { section: keyof typeof HOMEPAGE_SECTIONS }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const roots: ReturnType<typeof createRoot>[] = [];
    const icons = section === "roles" ? [Building2, Scale, UserRound, Gavel] : section === "features" ? [ShieldCheck, Zap, Wallet, Languages, Smartphone, BadgeCheck] : [];
    root.querySelectorAll(section === "roles" ? ".who" : ".kf-icon").forEach((node, i) => {
      const Icon = icons[i]; if (!Icon) return;
      const host = document.createElement("span"); host.className = "home-line-icon";
      if (section === "features") node.replaceChildren(host); else node.prepend(host);
      const iconRoot = createRoot(host); iconRoot.render(<Icon size={26} aria-hidden="true" />); roots.push(iconRoot);
    });
    const click = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest<HTMLButtonElement>(".ddfaq-q");
      if (!button) return;
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.classList.toggle("active", !expanded);
      button.nextElementSibling?.classList.toggle("show", !expanded);
    };
    root.addEventListener("click", click);
    return () => { root.removeEventListener("click", click); roots.forEach(item => item.unmount()); };
  }, [section]);
  return <div className={`home-preserved home-preserved-${section}`} ref={ref} dangerouslySetInnerHTML={{ __html: HOMEPAGE_SECTIONS[section] }} />;
}
