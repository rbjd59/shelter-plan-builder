import { useState } from "react";
import { Menu, X, Play, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import haitianFamily from "@/assets/home-family-haitian.jpg";
import spanishFamily from "@/assets/home-family-spanish.jpg";
import unitedFamilies from "@/assets/home-families-united.jpg";
import { PREPAREDNESS_COPY } from "@/lib/preparedness-content";
import { HOME_PLAIN } from "@/lib/home-plain-content";
import { HomePoints } from "@/components/HomePoints";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    wasPrice: "$199",
    freeText: "Gratis — pro bono por la crisis comunitaria.",
    tagline: "Alerta de emergencia de un clic y plan de defensa legal revisado por un abogado",
    crisisTitle: "Proteja el Sueño Americano",
    screenBtn: "Evaluar mi preparación",
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
    crisisTitle: "Protect the American Dream",
    screenBtn: "Check my readiness",
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
    crisisTitle: "Pwoteje Rèv Ameriken an",
    screenBtn: "Verifye preparasyon mwen",
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
  { plan: string; wasPrice: string; freeText: string; tagline: string; crisisTitle: string; screenBtn: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; secBoxBtn: string; employerHeading: string; appBoxHeading: string; appBoxBody: string; appBoxBtn: string; homeBox: string; homeBoxHeading: string; homeBoxBody: string; privilegeNotice: string; disclaimer: string }
>;



export default function HeroIntro() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const t = COPY[lang];
  const preparedness = PREPAREDNESS_COPY[lang];
  const refined = HOME_PLAIN[lang];
  const familyPhoto = lang === "ht" ? haitianFamily : lang === "es" ? spanishFamily : unitedFamilies;
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
          <h1>{t.crisisTitle}</h1>
          <p className="home-hero-subheading">{preparedness.subheading} {lang === "en" ? "Create a plan. Don’t get ripped off." : lang === "es" ? "Haga un plan. No se deje estafar." : "Fè yon plan. Pa kite yo twonpe ou."}</p>
          <div className="home-hero-tagline"><HomePoints items={preparedness.body[0].split(/(?<=[.!?])\s+/)} /></div>
          <div className="home-price" id="precio"><del>{t.wasPrice}</del><strong>{lang === "en" ? "Free app. Free check." : lang === "es" ? "App gratis. Revisión gratis." : "App gratis. Ti tès gratis."}</strong></div>
          <div className="home-actions">
            <Button asChild className="home-primary"><a href={`/intake?lang=${lang}`}>{start}</a></Button>
            <Button asChild variant="outline" className="home-video-action"><a href="#readiness-screener">{lang === "en" ? "Take the free check" : lang === "es" ? "Hacer la revisión gratis" : "Fè ti tès gratis la"}<ArrowRight size={18} /></a></Button>
            <Button asChild variant="outline" className="home-video-action"><a href="#how-it-works-video"><Play />{t.appBoxBtn}</a></Button>
          </div>
          <p className="home-hero-languages"><ShieldCheck size={20} /> Español · English · Kreyòl</p>
        </div>
      </section>
      <div className="home-notices home-container"><ShieldCheck className="home-notice-icon" /><div><HomePoints items={refined.firmPoints.slice(0, 2)} /><details><summary>{refined.details}</summary><p>{t.privilegeNotice}</p><p>{t.disclaimer}</p></details></div></div>
    </main>
  </>;
}

