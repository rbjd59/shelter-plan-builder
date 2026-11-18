import { createFileRoute } from "@tanstack/react-router";
import DealerPage from "@/components/DealerPage";
import { validateVehicleSearch } from "@/lib/vehicle-route";

const COPY = {
  en: { title: "For Licensed Florida Dealers — Don't Lose Your Car", description: "Learn the dealer participation rules and tell DetencionDefensa about your licensed Florida dealership." },
  es: { title: "Para concesionarios autorizados de Florida — No Pierdas Tu Carro", description: "Conozca las reglas de participación y presente su concesionario autorizado de Florida a DetencionDefensa." },
  ht: { title: "For Licensed Florida Dealers — Don't Lose Your Car", description: "Learn the dealer participation rules and tell DetencionDefensa about your licensed Florida dealership." },
};

export const Route = createFileRoute("/dealers")({
  validateSearch: validateVehicleSearch,
  loader: ({ location }) => ({ lang: validateVehicleSearch(location.search).lang ?? "en" }),
  head: ({ loaderData }) => {
    const c = COPY[loaderData?.lang ?? "en"];
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://www.detenciondefensa.com/dealers" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: "https://www.detenciondefensa.com/dealers" }],
    };
  },
  component: DealerPage,
});
