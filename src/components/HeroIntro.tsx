import { OPERATING_NOTICE } from "@/lib/operating-disclosure";
import { useState } from "react";
import { Menu, X, Play, Smartphone, Home, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import haitianFamily from "@/assets/home-family-haitian.jpg";
import spanishFamily from "@/assets/home-family-spanish.jpg";
import unitedFamilies from "@/assets/home-families-united.jpg";
import howPoster from "@/assets/home-how-poster.jpg.asset.json";
import homePoster from "@/assets/home-property-poster.jpg.asset.json";
import securityPoster from "@/assets/home-security-poster.jpg.asset.json";
import employerPoster from "@/assets/home-employer-poster.jpg.asset.json";

const COPY = {
  es: {
    heroTitle: "Proteja su sueño americano.",
    heroPoints: ["Tenga un plan claro.", "Entienda sus opciones.", "Conozca los riesgos."],
    heroSub: "Lo arriesgó todo para venir a Estados Unidos, comprar una casa, crear un negocio y pagar los estudios de sus hijos. Y hoy, todo está en riesgo. Antes de gastar un centavo más en una estrategia... Sepa dónde está realmente hoy. No se deje engañar por notarios ni consultores que no son abogados.",
    watchVideoCta: "Vea el video.",
    startFree: "Comience su plan gratis",
    shortNotice: "DetencionDefensa es una plataforma de tecnología licenciada a Sorrentino Law Firm, PLLC, que presta todos los servicios legales.",
    readFullNotice: "Lea el aviso completo",
    plan: "Plan de protección ante detención ICE ",
    wasPrice: "$199",
    freeText: "Gratis",
    tagline: "Alerta de emergencia de un clic y plan de defensa legal revisado por un abogado",
    btn1: "Cómo funciona el plan de protección",
    btn2: "Si eres propietario de una vivienda",
    watchVideo: "Mira un video de un minuto",
    secBoxHeading: "Seguridad y privacidad integradas",
    secBoxBody: "Diseñada con la privacidad y la seguridad en su núcleo.",
    secBoxBtn: "Más sobre seguridad",
    employerHeading: "Empleadores e iglesias",
    appBoxHeading: "App gratuita para el teléfono",
    appBoxBody: "Notifica al instante a tus contactos y abogado si enfrentas un arresto.",
    appBoxBtn: "Mira el video",
    homeBox: "Video de Protección para Propietarios",
    homeBoxHeading: "Proteja su casa",
    homeBoxBody: "Protección de fideicomiso de bajo costo diseñada por un abogado para proteger su casa.",
    disclaimer: OPERATING_NOTICE.es,
  },
  en: {
    heroTitle: "Protect your American dream.",
    heroPoints: ["Get a clear plan.", "Understand your options.", "Know the risks."],
    heroSub: "You risked everything to come to America, to buy a home, to build a business, to put your kids through school. And today, it's all at risk. Before you spend another penny on a strategy... Know where you really stand today. Don't be fooled by notarios or consultants who are not lawyers.",
    watchVideoCta: "Watch the video.",
    startFree: "Start my free plan",
    shortNotice: "DetencionDefensa is a technology platform licensed to Sorrentino Law Firm, PLLC, which provides all legal services.",
    readFullNotice: "Read the full notice",
    plan: "ICE detention protection plan ",
    wasPrice: "$199",
    freeText: "Free",
    tagline: "One-click emergency alert and attorney-reviewed legal defense plan",
    btn1: "How Protection Plan Works",
    btn2: "If You're a Homeowner",
    watchVideo: "Watch a one-minute video",
    secBoxHeading: "Security and privacy built in",
    secBoxBody: "Designed with privacy and security at its very core.",
    secBoxBtn: "More on security",
    employerHeading: "Employers & churches",
    appBoxHeading: "Free app for phone",
    appBoxBody: "Instantly notify contacts and attorney if faced with arrest.",
    appBoxBtn: "Watch the video",
    homeBox: "Homeowner Protection Video",
    homeBoxHeading: "Protect your home",
    homeBoxBody: "Low-cost trust protection designed by an attorney to protect your home.",
    disclaimer: OPERATING_NOTICE.en,
  },
  ht: {
    heroTitle: "Pwoteje rèv ameriken ou.",
    heroPoints: ["Jwenn yon plan klè.", "Konprann opsyon ou yo.", "Konnen risk yo."],
    heroSub: "Ou te riske tout sa ou genyen pou vini Ozetazini, achte yon kay, bati yon biznis epi peye lekòl pou pitit ou yo. E jodi a, tout bagay an danje. Anvan ou depanse yon lòt kòb nan yon estrateji... Konnen ki kote ou kanpe toutbon jodi a. Pa kite notè oswa konsiltan ki pa avoka twonpe w.",
    watchVideoCta: "Gade videyo a.",
    startFree: "Kòmanse plan gratis ou",
    shortNotice: "DetencionDefensa se yon platfòm teknoloji ki gen lisans pou Sorrentino Law Firm, PLLC, epi se kabinè a ki bay tout sèvis legal yo.",
    readFullNotice: "Li avi a an konplè",
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    wasPrice: "$199",
    freeText: "Gratis",
    tagline: "Alèt dijans ak yon sèl klik, ak yon plan defans legal yon avoka revize",
    btn1: "Ki jan plan pwoteksyon an fonksyone",
    btn2: "Si w se yon pwopriyetè kay",
    watchVideo: "Gade yon videyo yon minit",
    secBoxHeading: "Sekirite ak konfidansyalite entegre",
    secBoxBody: "Fèt ak vi prive ak sekirite kòm nwayo li.",
    secBoxBtn: "Plis sou sekirite",
    employerHeading: "Anplwayè ak legliz",
    appBoxHeading: "App gratis pou telefòn",
    appBoxBody: "Fè kontak ak avoka w konnen imedyatman si yo arete w.",
    appBoxBtn: "Gade videyo a",
    homeBox: "Videyo Pwoteksyon Pwopriyetè Kay",
    homeBoxHeading: "Pwoteje kay ou",
    homeBoxBody: "Pwoteksyon fidisyè ki ba pri ki fèt pa yon avoka pou pwoteje kay ou.",
    disclaimer: OPERATING_NOTICE.ht,
  },
} satisfies Record<
  Lang,
  { heroTitle: string; heroPoints: string[]; heroSub: string; watchVideoCta: string; startFree: string; shortNotice: string; readFullNotice: string; plan: string; wasPrice: string; freeText: string; tagline: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; secBoxBtn: string; employerHeading: string; appBoxHeading: string; appBoxBody: string; appBoxBtn: string; homeBox: string; homeBoxHeading: string; homeBoxBody: string; disclaimer: string }
>;



export default function HeroIntro() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const t = COPY[lang];
  const familyPhoto = lang === "ht" ? haitianFamily : lang === "es" ? spanishFamily : unitedFamilies;
  return <>
    <a className="home-skip" href="#home-content">{lang === "es" ? "Ir al contenido" : lang === "en" ? "Skip to content" : "Ale nan kontni an"}</a>
    <header className="home-header">
      <div className="home-header-inner">
        <a href="/" className="home-brand" aria-label="DetencionDefensa.com home">
          <img src={logoAsset.url} alt="Community Service Program logo" width="48" height="48" />
          <span><strong>DetencionDefensa.com</strong><small>ListoAhora.org · PareKounya.org</small></span>
        </a>
        <nav className={`home-nav ${open ? "is-open" : ""}`} aria-label="Main">
          <a href="#how-it-works-video" onClick={() => setOpen(false)}>{lang === "es" ? "Cómo funciona" : lang === "en" ? "How it works" : "Kijan li mache"}</a>
          <a href="/videos">{lang === "ht" ? "Videyo" : "Videos"}</a>
          <a href="/attorney">{lang === "es" ? "Abogado" : lang === "en" ? "Attorney" : "Avoka"}</a>
        </nav>
        <div className="home-languages" role="group" aria-label="Language">
          {(["es", "en", "ht"] as Lang[]).map(code => <Button key={code} variant="ghost" aria-pressed={lang === code} onClick={() => setLang(code)}>{code === "es" ? "Español" : code === "en" ? "English" : "Kreyòl"}</Button>)}
        </div>
        <Button className="home-menu" variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
      </div>
    </header>
    <main id="home-content">
      <section className="home-hero">
        <img className="home-hero-background" src={familyPhoto} alt="" width="1536" height="1024" fetchPriority="high" />
        <div className="home-hero-shade" />
        <div className="home-container home-hero-content">
          <p className="home-eyebrow">DetencionDefensa.com · ListoAhora.org · PareKounya.org</p>
          <h1>
            <span className="home-hero-title-main">{t.heroTitle}</span>
            <span className="home-hero-title-points">{t.heroPoints.map(point => <span key={point}>{point}</span>)}</span>
          </h1>
          <p className="home-hero-tagline">{t.heroSub}</p>
          <p className="home-hero-free">{t.freeText}</p>
          <div className="home-hero-actions">
            <a className="home-hero-start" href={`/checkout?lang=${lang}`}>{t.startFree}</a>
            <a className="home-hero-watch" href="#how-it-works-video"><Play size={20} />{t.watchVideoCta}</a>
          </div>
          <p className="home-hero-languages"><ShieldCheck size={20} /> Español · English · Kreyòl</p>
        </div>
      </section>
      <div className="home-notices home-container"><ShieldCheck className="home-notice-icon" /><p>{t.shortNotice} <a href={`/legal-notices?lang=${lang}`}>{t.readFullNotice}</a></p></div>
    </main>
  </>;
}

export function HeroCallToAction() {
  const { lang } = useLang();
  const t = COPY[lang];
  const start = lang === "es" ? "Comience Ahora →" : lang === "en" ? "Start Now →" : "Kòmanse Kounye a →";
  return <section className="home-cta-band"><div className="home-container">
    <div className="home-price" id="precio"><del>{t.wasPrice}</del><strong>{t.freeText}</strong></div>
    <div className="home-actions">
      <Button asChild className="home-primary"><a href={`/intake?lang=${lang}`}>{start}</a></Button>
      <Button asChild variant="outline" className="home-video-action"><a href="#how-it-works-video"><Play size={18} />{t.watchVideoCta}</a></Button>
    </div>
  </div></section>;
}

export function VideoHub() {
  const { lang } = useLang(); const t = COPY[lang];
  const cards = [
    { title: t.appBoxHeading, body: t.appBoxBody, href: "#how-it-works-video", icon: Smartphone, poster: howPoster.url },
    { title: t.homeBoxHeading, body: t.homeBoxBody, href: "#homeowner-video", icon: Home, poster: homePoster.url },
    { title: t.secBoxHeading, body: t.secBoxBody, href: "#security-video", icon: ShieldCheck, poster: securityPoster.url },
    { title: t.employerHeading, body: "", href: "/videos#employer-video", icon: Building2, poster: employerPoster.url },
  ];
  return <section className="home-video-hub home-band"><div className="home-container">
    <div className="home-section-heading"><h2>{lang === "es" ? "Mira los videos" : lang === "en" ? "Watch the videos" : "Gade videyo yo"}</h2><a href="/videos">{lang === "es" ? "Mira Más Videos" : lang === "en" ? "Watch More Videos" : "Gade Plis Videyo"}<ArrowRight size={18} /></a></div>
    <div className="home-video-grid">{cards.map((card, i) => <article className="home-video-card" key={card.href}>
      <a className="home-video-thumb" href={card.href} aria-label={card.title}><img src={card.poster} alt={card.title} loading="lazy" width="640" height="360" /><span><Play size={28} /></span></a>
      <div className="home-video-card-text"><card.icon size={22} /><h3><a href={card.href}>{card.title}</a></h3><p>{card.body}</p><a href={card.href}>{i === 2 ? t.secBoxBtn : t.appBoxBtn}<ArrowRight size={16}/></a></div>
    </article>)}</div>
  </div></section>;
}
