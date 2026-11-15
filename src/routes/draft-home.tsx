import { createFileRoute } from "@tanstack/react-router";
import DraftHomeLayout from "@/components/DraftHomeLayout";

export const Route = createFileRoute("/draft-home")({
  head: () => ({
    meta: [
      { title: "Draft Homepage Layout — Detención Defensa" },
      { name: "description", content: "Brainstorm draft of the new Detención Defensa homepage flow: problem, solution, status check, next steps, home, business and partners." },
      { property: "og:title", content: "Draft Homepage Layout — Detención Defensa" },
      { property: "og:description", content: "Brainstorm draft of the new homepage flow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DraftHomeLayout,
});

