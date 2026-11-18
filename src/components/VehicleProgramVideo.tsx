import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/context/LanguageContext";
import enVideo from "@/assets/videos/dont-lose-your-car-en.mp4.asset.json";
import esVideo from "@/assets/videos/dont-lose-your-car-es.mp4.asset.json";
import htVideo from "@/assets/videos/dont-lose-your-car-ht.mp4.asset.json";
import enPoster from "@/assets/vehicle-program-en-poster.jpg";
import esPoster from "@/assets/vehicle-program-es-poster.jpg";
import htPoster from "@/assets/vehicle-program-ht-poster.jpg";

const VIDEOS = { en: enVideo.url, es: esVideo.url, ht: htVideo.url };
const POSTERS = { en: enPoster, es: esPoster, ht: htPoster };
const COPY = {
  en: { title: "Don't Lose Your Car — program video", play: "Play vehicle program video with sound" },
  es: { title: "No Pierdas Tu Carro — video del programa", play: "Reproducir el video del programa con sonido" },
  ht: { title: "Pa Pèdi Machin Ou — videyo pwogram nan", play: "Jwe videyo pwogram machin nan ak son" },
};

export default function VehicleProgramVideo({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const copy = COPY[lang];
  const play = () => {
    const video = player.current;
    if (!video) return;
    video.muted = false;
    void video.play().catch(() => setStarted(false));
  };

  return (
    <div className={`vehicle-video ${compact ? "vehicle-video-compact" : ""}`}>
      <video
        ref={player}
        src={VIDEOS[lang]}
        poster={POSTERS[lang]}
        aria-label={copy.title}
        controls
        playsInline
        preload="none"
        onPlay={() => {
          setStarted(true);
          document.querySelectorAll("video").forEach((video) => {
            if (video !== player.current) video.pause();
          });
        }}
      />
      {!started && (
        <Button type="button" variant="ghost" className="vehicle-video-play" aria-label={copy.play} onClick={play}>
          <Play aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
