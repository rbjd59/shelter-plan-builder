import { createFileRoute } from "@tanstack/react-router";
import BusinessSite from "@/components/BusinessSite";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Do Not Forget Your Business — Keep, Run or Sell Your Business" },
      { name: "description", content: "Simple business value guidance, free planning tools, and help keeping, running or selling your business in English, Spanish and Haitian Creole." },
      { property: "og:title", content: "Do Not Forget Your Business" },
      { property: "og:description", content: "Your customers, tools and hard work may have value. Explore your choices and talk with our team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://donotforgetyourbusiness.com/business" }],
  }),
  component: BusinessSite,
});
