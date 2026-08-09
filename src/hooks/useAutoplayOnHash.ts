import { useEffect } from "react";

/**
 * When the page URL hash matches `id`, scroll that section into view and
 * start its video automatically (falling back to muted playback if the
 * browser blocks sound without a direct gesture).
 */
export function useAutoplayOnHash(id: string, play: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const run = () => {
      if (window.location.hash.replace("#", "") !== id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      // give the DOM a beat so the <video> element is mounted
      window.setTimeout(() => play(), 350);
    };

    const t = window.setTimeout(run, 120);
    window.addEventListener("hashchange", run);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}
