import { createFileRoute } from "@tanstack/react-router";

const search = z.object({
  code: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/firmar")({
  validateSearch: search,
  component: SignFormsPage,
  head: () => ({
    meta: [
      { title: "Firma electrónica de formularios | DetencionDefensa" },
      {
        name: "description",
        content:
          "Firma electrónica de formularios de autorización. Próximamente disponible.",
      },
      { property: "og:title", content: "Firma electrónica de formularios" },
      {
        property: "og:description",
        content:
          "Firme sus formularios de autorización en blanco y envíelos a su contacto principal. Próximamente disponible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
