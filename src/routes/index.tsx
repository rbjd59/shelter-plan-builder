import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRequestHeader } from "@tanstack/react-start/server";
import SiteShell from "@/components/SiteShell";

/**
 * Hosts that should be redirected to the Defender Mi Casa coming-soon page
 * instead of seeing the DetencionDefensa marketing site. Both apex and www
 * variants are matched.
 */
const DEFENDER_HOSTS = new Set([
  "defendermicasa.com",
  "www.defendermicasa.com",
]);

function isDefenderHost(): boolean {
  // Client navigation
  if (typeof window !== "undefined") {
    return DEFENDER_HOSTS.has(window.location.hostname.toLowerCase());
  }
  // SSR — read Host header
  try {
    const host = (getRequestHeader("host") || "").toLowerCase();
    return DEFENDER_HOSTS.has(host);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: typeof search.lang === "string" ? search.lang : undefined,
  }),
  beforeLoad: () => {
    if (isDefenderHost()) {
      throw redirect({ to: "/coming-soon" });
    }
  },
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $199" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3. NOT a law firm.",
      },
    ],
  }),
  component: SiteShell,
});
