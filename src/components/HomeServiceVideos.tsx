import { useRef, useState } from "react";
import { Phone, Play } from "lucide-react";
import { BUSINESS_PARALEGAL_PHONE, BUSINESS_PARALEGAL_PHONE_DISPLAY } from "@/lib/business-config";
import { Button } from "@/components/ui/button";
import { useLang, type Lang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
import { FIRM } from "@/lib/firm-info";
import homePoster from "@/assets/home-property-poster.jpg.asset.json";
import businessPoster from "@/assets/business-owner-hero.jpg";
import homeEn from "@/assets/videos/protect-what-you-built-en.mp4.asset.json";
import homeEs from "@/assets/videos/protect-what-you-built-es.mp4.asset.json";
import homeHt from "@/assets/videos/protect-what-you-built-ht.mp4.asset.json";
import businessEn from "@/assets/videos/save-my-business-en-v2.mp4.asset.json";
import businessEs from "@/assets/videos/save-my-business-es-v2.mp4.asset.json";
import businessHt from "@/assets/videos/save-my-business-ht-v2.mp4.asset.json";

const VIDEOS = {
  home: { en: homeEn.url, es: homeEs.url, ht: homeHt.url },
  business: { en: businessEn.url, es: businessEs.url, ht: businessHt.url },
};
const COPY = {
  en: { home: "Save My Home", business: "Do Not Forget Your Business", start: "Start Now", play: "Play video with sound" },
  es: { home: "Salve su casa", business: "No olvide su negocio", start: "Comience ahora", play: "Ver el video con sonido" },
  ht: { home: "Sove kay ou", business: "Pa bliye biznis ou", start: "Kòmanse kounye a", play: "Jwe videyo a ak son" },
};

function ServiceVideo({ kind, lang }: { kind: "home" | "business"; lang: Lang }) {
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const copy = COPY[lang];
  const play = () => {
    const video = player.current;
    if (!video) return;
    video.muted = false;
    void video.play().catch(() => setStarted(false));
  };
  return <section id={kind === "home" ? "homeowner-video" : "business-video"}>
    <div className="mx-auto text-center">
      <h2>{copy[kind]}</h2>
      <div className="relative aspect-video w-full overflow-hidden">
        <video ref={player} src={VIDEOS[kind][lang]} poster={kind === "home" ? homePoster.url : businessPoster}
          aria-label={copy[kind]} controls playsInline preload="none" className="block h-full w-full object-contain"
          onPlay={() => {
            setStarted(true);
            document.querySelectorAll("video").forEach(video => { if (video !== player.current) video.pause(); });
          }} />
        {!started && <Button type="button" variant="ghost" className="home-play-overlay" aria-label={copy.play} onClick={play}>
          <span><Play size={32} aria-hidden="true" /></span>
        </Button>}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg"><a href={kind === "home" ? withLang("https://savemyhometrust.com/trust", lang) : `/?lang=${lang}#assessment`}>{copy.start}</a></Button>
        <Button asChild size="lg" variant="outline"><a href={`tel:${BUSINESS_PARALEGAL_PHONE}`}><Phone />{lang === "es" ? `Llame al ${BUSINESS_PARALEGAL_PHONE_DISPLAY}` : lang === "ht" ? `Rele ${BUSINESS_PARALEGAL_PHONE_DISPLAY}` : `Call ${BUSINESS_PARALEGAL_PHONE_DISPLAY}`}</a></Button>
        <Button asChild size="lg" variant="outline"><a href="#schedule-call">{lang === "es" ? "Chatee con nosotros" : lang === "ht" ? "Chat avèk nou" : "Chat with us"}</a></Button>
      </div>
      {kind === "home" && <p className="home-business-disclosure">{FIRM.legalName} · {FIRM.city}</p>}
    </div>
  </section>;
}

export default function HomeServiceVideos() {
  const { lang } = useLang();
  return <div className="home-video-section">
    <ServiceVideo key={`home-${lang}`} kind="home" lang={lang} />
    <ServiceVideo key={`business-${lang}`} kind="business" lang={lang} />
  </div>;
}