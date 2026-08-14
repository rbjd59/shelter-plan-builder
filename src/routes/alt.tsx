import { createFileRoute } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";

export const Route = createFileRoute("/alt")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Alt · Free pro bono program" },
      {
        name: "description",
        content:
          "Alternate variant of the DetencionDefensa.com landing page. Operated by Sorrentino Law Firm PLLC under license; DetencionDefensa.com, Inc. is the technology operator only.",
      },
    ],
  }),
  component: () => <SiteShell />,
});
