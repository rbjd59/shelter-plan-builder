import { createFileRoute } from "@tanstack/react-router";
import HeroIntro from "@/components/HeroIntro";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa — Legal Protection Before Detention" },
      {
        name: "description",
        content:
          "Prepare your Habeas Corpus petition now for $199. If ICE detains you, press one button and we send your legal documents to the federal court.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main style={{ background: "#0f172a", minHeight: "100vh" }}>
      <HeroIntro />
      <section
        style={{
          background: "#000",
          padding: "2rem 1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <video
          src={esAsset.url}
          controls
          playsInline
          preload="metadata"
          style={{
            width: "100%",
            maxWidth: 960,
            height: "auto",
            display: "block",
            background: "#000",
          }}
        />
      </section>
    </main>
  );
}
