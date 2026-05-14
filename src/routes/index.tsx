import { createFileRoute } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    lang: typeof search.lang === "string" ? search.lang : undefined,
  }),
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
