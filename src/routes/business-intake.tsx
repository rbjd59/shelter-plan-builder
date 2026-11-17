import { createFileRoute } from "@tanstack/react-router";
import BusinessIntake from "@/components/BusinessIntake";

export const Route = createFileRoute("/business-intake")({
  head: () => ({
    meta: [
      { title: "Request a Business Call — Do Not Forget Your Business" },
      {
        name: "description",
        content:
          "Ask our team for a business call in English, Spanish or Haitian Creole. Your request is saved and assigned to Ricky Bitelman-Behar JD.",
      },
      { property: "og:title", content: "Request a Business Call — Do Not Forget Your Business" },
      {
        property: "og:description",
        content:
          "Tell us about your work and request a call from our business team. No account needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusinessIntake,
});
