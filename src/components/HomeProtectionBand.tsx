import { useLang, type Lang } from "@/context/LanguageContext";

type Copy = {
  tag: string;
  heading: string;
  body: string;
  cta: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    tag: "Protect your home",
    heading: "Do you have a home? If so, you need to protect it.",
    body: "If you're forced to leave the U.S., you don't have to lose your home or your car. An attorney-supervised trust — set up in advance — can help keep your mortgage and car loan paid so nothing falls into default while you're away.",
    cta: "Protect my home →",
  },
  es: {
    tag: "Proteja su casa",
    heading: "¿Tiene casa? Si es así, necesita protegerla.",
    body: "Si se ve obligado a salir de EE.UU., no tiene que perder su casa ni su auto. Un fideicomiso supervisado por un abogado — establecido con anticipación — puede ayudar a mantener el pago de su hipoteca y de su préstamo de auto para que nada caiga en incumplimiento mientras usted no esté.",
    cta: "Proteger mi casa →",
  },
  ht: {
    tag: "Pwoteje kay ou",
    heading: "Èske ou gen yon kay? Si wi, ou bezwen pwoteje l.",
    body: "Si ou fòse pou kite Etazini, ou pa oblije pèdi kay ou oswa machin ou. Yon trust ki sipèvize pa yon avoka — ki mete an plas davans — kapab ede kenbe ipotèk ou ak prè machin ou peye pou anyen pa tonbe an defo pandan ou pa la.",
    cta: "Pwoteje kay mwen →",
  },
};

export default function HomeProtectionBand() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <section className="w-full bg-gradient-to-br from-[#6B4F4F] to-[#3d2a2a] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="inline-block uppercase tracking-widest text-xs font-bold text-amber-300 mb-3">
          {t.tag}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.heading}</h2>
        <p className="text-base md:text-lg opacity-95 mb-7 max-w-2xl mx-auto leading-relaxed">
          {t.body}
        </p>
        <a
          href="https://savemyhometrust.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-400 text-[#3d2a2a] font-bold px-8 py-4 rounded-lg text-lg hover:bg-amber-300 transition-colors shadow-lg"
        >
          {t.cta}
        </a>
        <p className="text-xs opacity-70 mt-4">
          savemyhometrust.com · <span data-en="">Attorney-supervised trust documents</span>
        </p>
      </div>
    </section>
  );
}
