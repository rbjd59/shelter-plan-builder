import { createFileRoute, Link } from "@tanstack/react-router";
import { PARTNERS } from "@/components/DraftHomeLayout";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise & Partner — Detención Defensa" },
      { name: "description", content: "Reach immigrant families planning ahead for ICE detention. Sponsorships, featured partner listings and flexible partnerships with Detención Defensa." },
      { property: "og:title", content: "Advertise & Partner with Detención Defensa" },
      { property: "og:description", content: "Sponsored options and flexible partnerships to reach families who are planning ahead." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdvertisePage,
});

const STATS = [
  ["[#]", "Families screened"],
  ["[#]", "Prepared case files"],
  ["3", "Languages: English, Español, Kreyòl"],
  ["[#]", "Church & radio partners"],
];

const OPTIONS = [
  { name: "Featured Partner", desc: "Your business listed in “Trusted providers” on the homepage, with your logo and one line about what you do.", points: ["Homepage listing", "Link to your site", "Shown in all 3 languages"] },
  { name: "Sponsored Service", desc: "You are the named provider inside one plan step — home, business, mortgage or legal.", points: ["Shown inside the matching check", "Families can ask for you by name", "Prepared file sent with permission"] },
  { name: "Sponsored Video", desc: "A short segment in one of our family videos explaining your service in plain words.", points: ["Video mention", "Radio and church campaign tie-in", "Script reviewed for accuracy"] },
];

const RESULTS = [
  { partner: "Sorrentino Law Firm", metric: "[#] family files reviewed" },
  { partner: "United Realty", metric: "[#] homes with pre-title files" },
  { partner: "Business Brokers", metric: "[#] routes valued" },
];

function AdvertisePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(([n, l]) => (
            <div key={l} className="rounded-lg border border-border p-4"><p className="text-3xl font-black text-primary">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>
          ))}
        </div>
        <h1 className="text-4xl font-black sm:text-5xl">Partner with Detención Defensa</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg">Reach immigrant families who are planning ahead — protecting their home, their business and their family before a crisis.</p>
        <div className="mx-auto mt-6 max-w-xl rounded-lg bg-muted p-5 text-left">
          <p className="font-bold">Our promise to families</p>
          <p>We only list partners we trust. Families can always choose any provider they want. Our families' trust is not for sale.</p>
        </div>
        <a href="#contact" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground">Let's work together</a>
      </section>

      <section className="bg-muted py-14"><div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-black">Sponsored options</h2>
        <p className="mt-2 text-muted-foreground">Anyone may apply to advertise. Today we work only with the partners below.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {OPTIONS.map((o) => (
            <article key={o.name} className="rounded-lg border border-border bg-background p-6">
              <h3 className="text-xl font-bold">{o.name}</h3><p className="mt-2">{o.desc}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5">{o.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-lg border-2 border-primary bg-background p-6">
          <h3 className="text-xl font-bold">Flexible partnership</h3>
          <p className="mt-2">Have a different idea? Lower fees for our families, a referral program, or a joint event at a church — let's build it together.</p>
        </div>
      </div></section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-3xl font-black">Current partners</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => (
            <div key={p.name} className="rounded-lg border border-border p-5"><p className="text-lg font-bold">{p.name}</p><p className="mt-1">{p.role}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-muted py-14"><div className="mx-auto max-w-5xl px-5">
        <h2 className="text-3xl font-black">Partner results</h2>
        <p className="mt-2 text-muted-foreground">Verified lifetime results from current partnerships. [Numbers to be filled in once verified.]</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {RESULTS.map((r) => (
            <div key={r.partner} className="rounded-lg bg-background p-6"><p className="text-2xl font-black text-primary">{r.metric}</p><p className="mt-1 font-bold">{r.partner}</p></div>
          ))}
        </div>
      </div></section>

      <section id="contact" className="mx-auto max-w-3xl px-5 py-14 text-center">
        <h2 className="text-3xl font-black">Let's work together</h2>
        <p className="mt-3">Tell us about your business and how you help families.</p>
        <a href="mailto:legal@detenciondefensa.com?subject=Advertising%20%2F%20Partnership" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground">Email us</a>
        <p className="mt-8 text-sm text-muted-foreground">Disclosure: partners pay Detención Defensa for advertising, leads and prepared files. Detención Defensa is a commercial service. Listing is not a recommendation by any lawyer. [Firm to review for Florida Bar Rule 4-7.]</p>
        <Link to="/" className="mt-4 inline-block underline">← Back to home</Link>
      </section>
    </main>
  );
}
