import { useState } from "react";
import { Menu, X, Play, Smartphone, Home, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import familyAsset from "@/assets/hero-family.jpg.asset.json";
import spanishFamily from "@/assets/home-family-spanish.jpg";
import unitedFamilies from "@/assets/home-families-united.jpg";
import howPoster from "@/assets/home-how-poster.jpg.asset.json";
import homePoster from "@/assets/home-property-poster.jpg.asset.json";
import securityPoster from "@/assets/home-security-poster.jpg.asset.json";
import employerPoster from "@/assets/home-employer-poster.jpg.asset.json";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    wasPrice: "$199",
    freeText: "Gratis — pro bono por la crisis comunitaria.",
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
    privilegeNotice:
      "Toda la información ingresada aquí está protegida por el privilegio abogado-cliente, exactamente como si hubiera contratado a un abogado de inmigración. Como este servicio es gratuito, usted sigue recibiendo la misma protección segura y confidencial de privacidad bajo la ley entre usted y su abogado.",
    disclaimer:
      "ListoAhora.org y PareKounya.org son nombres comerciales (DBA) de DetencionDefensa.com, Inc. Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio web; la Firma tiene el control exclusivo de todos los servicios legales, el asesoramiento legal y el contenido legal.",
  },
  en: {
    plan: "ICE detention protection plan ",
    wasPrice: "$199",
    freeText: "Free — pro bono due to the community crisis.",
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
    privilegeNotice:
      "All information entered here is protected under attorney-client privilege, exactly as if you had hired an immigration attorney. Because this service is free, you still receive the same secure and confidential privacy protection under the law between you and your attorney.",
    disclaimer:
      "ListoAhora.org and PareKounya.org are DBAs (trade names) of DetencionDefensa.com, Inc. Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. is strictly the technology developer and website operator; the Firm has sole control of all legal services, legal advice, and legal content.",
  },
  ht: {
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    wasPrice: "$199",
    freeText: "Gratis — pro bono akòz kriz kominotè a.",
    tagline: "Sijè a alèt dijans yon sèl kli epi plan defans legal revize pa yon avoka",
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
    privilegeNotice:
      "Tout enfòmasyon ou antre isit la pwoteje pa privilèj avoka-kliyan, menm jan si ou te anboche yon avoka imigrasyon. Paske sèvis sa a gratis, ou toujou resevwa menm pwoteksyon sekirite ak konfidansyalite anba lwa a ant ou menm ak avoka w.",
    disclaimer:
      "ListoAhora.org ak PareKounya.org se non komèsyal (DBA) DetencionDefensa.com, Inc. Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay. DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sit la; Kabinè a gen kontwòl total sou tout sèvis legal, konsèy legal, ak kontni legal.",
  },
} satisfies Record<
  Lang,
  { plan: string; wasPrice: string; freeText: string; tagline: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; secBoxBtn: string; employerHeading: string; appBoxHeading: string; appBoxBody: string; appBoxBtn: string; homeBox: string; homeBoxHeading: string; homeBoxBody: string; privilegeNotice: string; disclaimer: string }
>;



export default function HeroIntro() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const t = COPY[lang];
  const familyPhoto = lang === "ht" ? familyAsset.url : lang === "es" ? spanishFamily : unitedFamilies;
  const start = lang === "es" ? "Comience Ahora →" : lang === "en" ? "Start Now →" : "Kòmanse Kounye a →";
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
          <a href="#precio" onClick={() => setOpen(false)}>{lang === "es" ? "Precio" : lang === "en" ? "Price" : "Pri"}</a>
          <a href="#preguntas" onClick={() => setOpen(false)}>{lang === "es" ? "Preguntas" : lang === "en" ? "FAQ" : "Kesyon"}</a>
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
          <h1>{t.plan}</h1>
          <p className="home-hero-tagline">{t.tagline}</p>
          <div className="home-price" id="precio"><del>{t.wasPrice}</del><strong>{t.freeText}</strong></div>
          <div className="home-actions">
            <Button asChild className="home-primary"><a href={`/intake?lang=${lang}`}>{start}</a></Button>
            <Button asChild variant="outline" className="home-video-action"><a href="#how-it-works-video"><Play />{t.appBoxBtn}</a></Button>
          </div>
          <p className="home-hero-languages"><ShieldCheck size={20} /> Español · English · Kreyòl</p>
        </div>
      </section>
      <div className="home-notices home-container"><ShieldCheck className="home-notice-icon" /><div><p>{t.privilegeNotice}</p><p>{t.disclaimer}</p></div></div>
    </main>
  </>;
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
