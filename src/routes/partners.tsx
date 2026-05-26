import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, type Lang } from "@/context/LanguageContext";
import { PARTNERS } from "@/lib/partners-content";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partnership Program — DetencionDefensa for Churches & Nonprofits" },
      {
        name: "description",
        content:
          "Partner with DetencionDefensa to prepare working families before ICE detention. Scholarship credits for churches, employers, and nonprofits — zero legal exposure.",
      },
      { property: "og:title", content: "Partnership Program — DetencionDefensa" },
      {
        property: "og:description",
        content:
          "Churches, employers, and nonprofits: refer families, earn scholarship credits, no legal exposure.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/partners" }],
  }),
  component: PartnersPage,
});

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "es", label: "ES" },
  { id: "ht", label: "HT" },
];

function PartnersPage() {
  const { lang, setLang } = useLang();
  const t = PARTNERS[lang];

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-[#f5f1ea]">
      {/* Header */}
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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-20 lg:pt-32 lg:pb-28">
        <div className="text-xs tracking-[0.22em] uppercase text-[#e8a04a] mb-6 font-mono">
          {t.hero.eyebrow}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl leading-[1.02] tracking-tight max-w-4xl">
          {t.hero.title}
        </h1>
        <p className="mt-8 text-lg lg:text-xl text-white/70 max-w-2xl leading-relaxed">
          {t.hero.lede}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-[#e8a04a] text-[#0b0b0e] font-medium px-7 py-4 rounded-full hover:scale-[1.02] transition"
          >
            {t.hero.primary} <span>→</span>
          </a>
          <a
            href="#process"
            className="inline-flex items-center gap-2 border border-white/20 px-7 py-4 rounded-full hover:border-white/50 transition"
          >
            {t.hero.secondary}
          </a>
        </div>
      </section>

      {/* Context */}
      <Section title={t.context.title}>
        <Grid items={t.context.items} cols={3} />
      </Section>

      {/* Need */}
      <Section title={t.need.title} alt>
        <Grid items={t.need.items} cols={2} numbered />
      </Section>

      {/* Offers */}
      <Section title={t.offers.title} id="offers">
        <Grid items={t.offers.items} cols={3} />
      </Section>

      {/* Process */}
      <Section title={t.process.title} alt id="process">
        <div className="grid md:grid-cols-3 gap-6">
          {t.process.items.map((it, i) => (
            <div
              key={i}
              className="bg-white/4 border border-white/10 rounded-2xl p-7 hover:border-[#e8a04a]/50 transition"
            >
              <div className="text-[#e8a04a] font-serif text-3xl mb-3">{`0${i + 1}`}</div>
              <h3 className="font-serif text-xl mb-3">{it.h}</h3>
              <p className="text-white/65 leading-relaxed text-sm">{it.p}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Cost */}
      <Section title={t.cost.title}>
        <div className="grid md:grid-cols-3 gap-4">
          {t.cost.rows.map((r, i) => (
            <div
              key={i}
              className={`rounded-2xl p-7 border ${
                i === 0
                  ? "bg-[#e8a04a]/10 border-[#e8a04a]/40"
                  : "bg-white/4 border-white/10"
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-white/50 mb-3">
                {r.note}
              </div>
              <div className="font-serif text-3xl lg:text-4xl mb-3">{r.value}</div>
              <div className="text-sm text-white/70">{r.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Give-back */}
      <Section title={t.giveBack.title} alt>
        <Grid items={t.giveBack.items} cols={2} />
      </Section>

      {/* Steps */}
      <Section title={t.steps.title}>
        <div className="space-y-4">
          {t.steps.items.map((it, i) => (
            <div
              key={i}
              className="flex gap-6 border-l-2 border-[#e8a04a]/40 pl-6 py-3"
            >
              <div className="font-mono text-[#e8a04a] text-sm pt-1">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">{it.h}</h3>
                <p className="text-white/65 leading-relaxed">{it.p}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Hardship */}
      <Section title={t.hardship.title} alt>
        <Grid items={t.hardship.items} cols={3} />
      </Section>

      {/* Impact */}
      <Section title={t.impact.title}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.impact.items.map((it, i) => (
            <div key={i} className="text-center bg-white/4 rounded-2xl p-7 border border-white/10">
              <div className="font-serif text-4xl lg:text-5xl text-[#e8a04a] mb-3">
                {it.h}
              </div>
              <p className="text-sm text-white/65 leading-relaxed">{it.p}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Next steps */}
      <Section title={t.next.title} alt id="contact">
        <Grid items={t.next.items} cols={2} />
        <div className="mt-12 text-center">
          <a
            href="mailto:partners@detenciondefensa.com"
            className="inline-flex items-center gap-2 bg-[#e8a04a] text-[#0b0b0e] font-medium px-8 py-4 rounded-full hover:scale-[1.02] transition"
          >
            {t.next.contact} <span>→</span>
          </a>
          <div className="mt-4 text-sm text-white/50 font-mono">
            partners@detenciondefensa.com
          </div>
        </div>
      </Section>

      <footer className="border-t border-white/8 py-10 text-center text-xs text-white/40 font-mono">
        <div>DetencionDefensa · NOT a law firm · Pre-detention preparation only</div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
  alt,
  id,
}: {
  title: string;
  children: React.ReactNode;
  alt?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${alt ? "bg-white/[0.025]" : ""} border-t border-white/8`}
    >
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <h2 className="font-serif text-3xl lg:text-4xl tracking-tight mb-12 max-w-3xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function Grid({
  items,
  cols,
  numbered,
}: {
  items: { h: string; p: string }[];
  cols: 2 | 3;
  numbered?: boolean;
}) {
  const grid = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <div className={`grid gap-6 ${grid}`}>
      {items.map((it, i) => (
        <div key={i} className="bg-white/4 border border-white/10 rounded-2xl p-7">
          {numbered && (
            <div className="text-[#e8a04a] font-mono text-xs tracking-widest mb-3">
              {String(i + 1).padStart(2, "0")}
            </div>
          )}
          <h3 className="font-serif text-xl mb-3 leading-snug">{it.h}</h3>
          <p className="text-white/65 leading-relaxed text-sm">{it.p}</p>
        </div>
      ))}
    </div>
  );
}
