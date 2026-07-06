import { Link } from "@tanstack/react-router";
import { useLang, type Lang } from "@/context/LanguageContext";

type Copy = {
  heading: string;
  body: React.ReactNode;
  cta: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    heading: "No-cost or low-cost program?",
    body: (
      <>
        For those with American children (or children in the U.S.) who are the
        household's primary income earner, you may qualify for a{" "}
        <strong>no-cost or low-cost program</strong>.
      </>
    ),
    cta: "See if I qualify →",
  },
  es: {
    heading: "¿Programa sin costo o de bajo costo?",
    body: (
      <>
        Para los que tienen hijos americanos (o hijos en EE.UU.) y son el
        principal sostén del hogar, pueden calificar para un{" "}
        <strong>programa sin costo o de bajo costo</strong>.
      </>
    ),
    cta: "Ver si califico →",
  },
  ht: {
    heading: "Pwogram san frè oswa a ba pri?",
    body: (
      <>
        Pou moun ki gen pitit ameriken (oswa pitit ki nan Etazini) e ki se
        sipò prensipal fanmi an, ou ka kalifye pou yon{" "}
        <strong>pwogram san frè oswa a ba pri</strong>.
      </>
    ),
    cta: "Gade si mwen kalifye →",
  },
};

export default function QualifyBand() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <section className="w-full bg-gradient-to-br from-red-700 to-red-900 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{t.heading}</h2>
        <p className="text-lg md:text-xl mb-6">{t.body}</p>
        <Link
          to="/qualify"
          className="inline-block bg-white text-red-800 font-bold px-8 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
