import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/context/LanguageContext";

const COPY = {
  en: { play: "Play video with sound", error: "The video could not load. Please try again." },
  es: { play: "Ver el video con sonido", error: "El video no cargó. Inténtelo de nuevo." },
  ht: { play: "Jwe videyo a ak son", error: "Videyo a pa chaje. Tanpri eseye ankò." },
};

export default function AssessmentVideo({ src, lang, title, onEnded }: {
  src: string;
  lang: Lang;
  title: string;
  onEnded: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [failed, setFailed] = useState(false);
  const copy = COPY[lang];

  useEffect(() => {
    let active = true;
    setNeedsPlay(false);
    setFailed(false);
    const player = video.current;
    if (player) {
      player.volume = 1;
      player.muted = false;
      player.play().catch(() => { if (active) setNeedsPlay(true); });
    }
    return () => { active = false; };
  }, [src]);

  const play = () => {
    const player = video.current;
    if (!player) return;
    if (failed) player.load();
    setFailed(false);
    player.muted = false;
    player.play().catch(() => setNeedsPlay(true));
  };

  return <>
    <video ref={video} src={src} aria-label={title} controls autoPlay playsInline
      preload="auto" className="asmt-video" onEnded={onEnded}
      onPlaying={() => { setNeedsPlay(false); setFailed(false); }}
      onError={() => { setFailed(true); setNeedsPlay(true); }} />
    {failed && <p role="alert">{copy.error}</p>}
    {needsPlay && <Button variant="outline" size="lg" onClick={play}><Play aria-hidden="true" />{copy.play}</Button>}
  </>;
}