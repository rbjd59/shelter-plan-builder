import { createFileRoute, Navigate } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $199" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. $199 + $10/mo. NOT a law firm.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  // Always show the splash/language picker first unless ?lang= is in the URL.
  if (typeof window !== "undefined") {
    const url = new URLSearchParams(window.location.search).get("lang");
    if (!url) {
      return <Navigate to="/splash" />;
    }
  }
  return <SiteShell />;
}
