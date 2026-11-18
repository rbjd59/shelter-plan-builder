import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forms/vehicle/dealer-participation-agreement")({
  server: {
    handlers: {
      GET: () => new Response(null, {
        status: 302,
        headers: { Location: "/forms/vehicle/dealer-participation-agreement.pdf", "Cache-Control": "public, max-age=300" },
      }),
    },
  },
});
