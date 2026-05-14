import { createFileRoute, redirect } from "@tanstack/react-router";
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

function getHost(): string | null {
  if (typeof window !== "undefined") return window.location.hostname.toLowerCase();
  // SSR: read from request headers via the global event context if available.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headers = (globalThis as any)?.process?.env ? null : null;
    return headers;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: typeof search.lang === "string" ? search.lang : undefined,
  }),
  beforeLoad: () => {
    const host = getHost();
    if (host && DEFENDER_HOSTS.has(host)) {
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
