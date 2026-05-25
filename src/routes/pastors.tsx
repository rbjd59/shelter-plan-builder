import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { PASTORS, STATION_NUMBERS, type StationKey } from "@/lib/pastors-content";

export const Route = createFileRoute("/pastors")({
  validateSearch: (search: Record<string, unknown>) => ({
    src: typeof search.src === "string" ? search.src : undefined,
    lang: typeof search.lang === "string" ? search.lang : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Para Pastores — DetencionDefensa | Antes de la tormenta" },
      {
        name: "description",
        content:
          "Pastores y sacerdotes: prepare a las familias trabajadoras de su congregación antes de una detención de ICE. Becas para su iglesia, sin exposición legal.",
      },
      { property: "og:title", content: "Para Pastores — DetencionDefensa" },
      {
        property: "og:description",
        content:
          "Antes de la tormenta, prepare a su rebaño. Becas por cada 20 inscripciones. Sin riesgo legal.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/pastors" }],
  }),
  component: PastorsPage,
});

const LANGS: { id: Lang; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
  { id: "ht", label: "HT" },
];

function PastorsPage() {
  const { lang, setLang } = useLang();
  const { src } = Route.useSearch();
  const t = PASTORS[lang];

  const station = useMemo<StationKey>(() => {
    const key = (src ?? "").toLowerCase();
    if (key === "radiopaz" || key === "wrhc" || key === "woir" || key === "wmbm" || key === "lzm") {
      return key;
    }
    return "default";
  }, [src]);

  const number = STATION_NUMBERS[station];

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f5f1ea]">
      <header className="sticky top-0 z-40 backdrop-blur bg-[#0b0b0e]/85 border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-sm tracking-wide text-[#e8a04a] hover:opacity-80">
            {t.nav.back}
          </Link>
          <div className="flex gap-1 text-xs font-mono">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-3 py-1.5 rounded-full border transition ${
                  lang === l.id
                    ? "bg-[#e8a04a] text-[#0b0b0e] border-[#e8a04a]"
                    : "border-white/15 text-white/70 hover:border-white/40"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 lg:pt-28 lg:pb-24">
        <div className="text-xs tracking-[0.22em] uppercase text-[#e8a04a] mb-6 font-mono">
          {t.eyebrow}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-[1.02] tracking-tight max-w-4xl">
          {t.title}
        </h1>
        <p className="mt-8 text-lg lg:text-xl text-white/70 max-w-2xl leading-relaxed">{t.lede}</p>

        {/* Station-aware call card */}
        <div className="mt-10 rounded-2xl border border-[#e8a04a]/40 bg-[#e8a04a]/5 p-6 lg:p-8 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.18em] text-[#e8a04a]/90 font-mono mb-3">
            {t.fromStation(number.name)}
          </div>
          <a
            href={`tel:${number.tel}`}
            className="block font-serif text-3xl lg:text-4xl text-[#f5f1ea] hover:text-[#e8a04a] transition"
          >
            {number.display}
          </a>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${number.tel}`}
              className="inline-flex items-center gap-2 bg-[#e8a04a] text-[#0b0b0e] font-medium px-6 py-3 rounded-full hover:scale-[1.02] transition"
            >
              📞 {t.callCta}
            </a>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 border border-white/20 text-white/85 px-6 py-3 rounded-full hover:border-white/50 transition"
            >
              {t.packetCta} →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {t.stats.map((s) => (
            <div key={s.value}>
              <div className="font-serif text-5xl lg:text-6xl text-[#e8a04a]">{s.value}</div>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pastor's word */}
      <section className="max-w-3xl mx-auto px-6 py-20 lg:py-28">
        <h2 className="font-serif text-3xl lg:text-5xl tracking-tight mb-8">{t.pastorTitle}</h2>
        <div className="space-y-6 text-lg leading-relaxed text-white/80">
          {t.pastorBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/8 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <h2 className="font-serif text-3xl lg:text-5xl tracking-tight mb-12">{t.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.how.map((step) => (
              <div key={step.h} className="rounded-xl border border-white/10 p-6 bg-[#0b0b0e]">
                <h3 className="font-serif text-xl text-[#e8a04a] mb-3">{step.h}</h3>
                <p className="text-white/70 leading-relaxed text-sm">{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost table */}
      <section className="max-w-3xl mx-auto px-6 py-20 lg:py-24">
        <h2 className="font-serif text-3xl lg:text-5xl tracking-tight mb-10">{t.costTitle}</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {t.cost.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between py-5 gap-6">
              <span className="text-white/80">{row.label}</span>
              <span className="font-mono text-[#e8a04a] text-right whitespace-nowrap">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-white/8 bg-gradient-to-b from-[#e8a04a]/10 to-transparent">
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="font-serif text-3xl lg:text-5xl tracking-tight mb-6">{t.closingTitle}</h2>
          <p className="text-lg text-white/75 leading-relaxed mb-10">{t.closingBody}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`tel:${number.tel}`}
              className="inline-flex items-center gap-2 bg-[#e8a04a] text-[#0b0b0e] font-medium px-7 py-4 rounded-full hover:scale-[1.02] transition"
            >
              📞 {number.display}
            </a>
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 border border-white/25 text-white px-7 py-4 rounded-full hover:border-white/60 transition"
            >
              {t.packetCta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-10 text-xs text-white/40 leading-relaxed">
          {t.footer}
          <div className="mt-2 font-mono">
            src: <span className="text-white/60">{station}</span> · {number.name}
          </div>
        </div>
      </footer>
    </div>
  );
}
