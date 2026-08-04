import { createFileRoute } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";

export const Route = createFileRoute("/alt")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Alt · $10/month" },
      {
        name: "description",
        content:
          "Alternate variant of the DetencionDefensa.com landing page. NOT a law firm.",
      },
    ],
  }),
  component: () => <SiteShell />,
});
