import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import {
  FEDERAL_DISTRICTS,
  VENUE_INSTRUCTIONS_EN,
  VENUE_INSTRUCTIONS_ES,
  VENUE_INSTRUCTIONS_HT,
} from "@/lib/federal-district-courts";
import { SELF_HELP_LIBRARY } from "@/lib/self-help-library";

const searchSchema = z.object({
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/venues")({
  validateSearch: searchSchema,
  component: VenuesPage,
  head: () => ({
    meta: [
      { title: "Federal District Courts — Venue Instructions" },
      {
        name: "description",
        content:
          "Full list of the 94 U.S. federal district courts and venue instructions for filing a § 2241 habeas petition from detention. The customer selects the correct district and writes it on the forms.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T: Record<Lang, {
  title: string;
  lead: string;
  searchPh: string;
  noResults: string;
  instructionsTitle: string;
  clerkLabel: string;
  back: string;
  envelopeTitle: string;
  envelopeBody: string;
}> = {
  en: {
    title: "Federal District Courts — Venue Instructions",
    lead:
      "The Company does not select your court venue. You — or your designated family contact — write in the correct district and clerk's address after you are detained. Use this list as a reading aid.",
    searchPh: "Search by state, district, or city…",
    noResults: "No districts match your search.",
    instructionsTitle: "How to choose the right district",
    clerkLabel: "Clerk's mailing address",
    back: "← Back to home",
    envelopeTitle: "What goes on the envelope",
    envelopeBody:
      "The envelope mailed in the Self-Help Packet (if you subscribe to the mailing add-on) is pre-printed only with 'Clerk of the U.S. District Court' followed by three blank lines. After detention, you (or your family contact) handwrite the correct clerk's address from this list.",
  },
  es: {
    title: "Tribunales Federales de Distrito — Instrucciones de Sede",
    lead:
      "La Compañía no selecciona la sede de su tribunal. Usted — o su contacto familiar designado — escribe el distrito correcto y la dirección del secretario después de ser detenido. Use esta lista como guía de lectura.",
    searchPh: "Buscar por estado, distrito o ciudad…",
    noResults: "Ningún distrito coincide con su búsqueda.",
    instructionsTitle: "Cómo elegir el distrito correcto",
    clerkLabel: "Dirección postal del secretario",
    back: "← Volver al inicio",
    envelopeTitle: "Qué va en el sobre",
    envelopeBody:
      "El sobre incluido en el Paquete de Auto-Ayuda (si está suscrito al complemento de envío) está pre-impreso solo con 'Clerk of the U.S. District Court' seguido de tres líneas en blanco. Después de la detención, usted (o su contacto familiar) escribe a mano la dirección del secretario correcto de esta lista.",
  },
  ht: {
    title: "Tribinal Distri Federal — Enstriksyon Plas",
    lead:
      "Konpayi an pa chwazi plas tribinal ou. Ou — oswa kontak fanmi ou deziyen — ekri distri kòrèk la ak adrès grefye a apre yo detni w. Sèvi ak lis sa a kòm èd lekti.",
    searchPh: "Chèche pa eta, distri, oswa vil…",
    noResults: "Pa gen distri ki matche rechèch ou a.",
    instructionsTitle: "Kijan pou chwazi bon distri a",
    clerkLabel: "Adrès grefye a",
    back: "← Tounen nan akèy",
    envelopeTitle: "Sa ki sou anvlòp la",
    envelopeBody:
      "Anvlòp ki nan Pakè Oto-Èd la (si w abòne nan adisyonèl voye lapòs la) gen sèlman 'Clerk of the U.S. District Court' enprime pre-enprime ak twa liy vid. Apre detansyon, ou (oswa kontak fanmi w) ekri alamen adrès grefye kòrèk la nan lis sa a.",
  },
};

function VenuesPage() {
  const { lang } = Route.useSearch();
  const L = (lang as Lang) || "es";
  const t = T[L];
  const instructions =
    L === "es" ? VENUE_INSTRUCTIONS_ES : L === "ht" ? VENUE_INSTRUCTIONS_HT : VENUE_INSTRUCTIONS_EN;

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return FEDERAL_DISTRICTS;
    return FEDERAL_DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(needle) ||
        d.state.toLowerCase().includes(needle) ||
        d.clerk_address.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div style={{ background: "#0b1220", color: "#f6efe1", minHeight: "100vh", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 24px 96px" }}>
        <Link to="/" search={{ lang: L }} style={{ color: "#e8a04a", textDecoration: "none", fontSize: 14 }}>
          {t.back}
        </Link>

        <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "20px 0 12px", color: "#f6efe1" }}>
          {t.title}
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#c9c0ad", margin: "0 0 32px" }}>
          {t.lead}
        </p>

        <section style={{ background: "#13203a", border: "1px solid #2a3a5f", borderRadius: 4, padding: "20px 24px", marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px", color: "#e8a04a" }}>{t.instructionsTitle}</h2>
          <ol style={{ paddingLeft: 22, margin: 0, fontSize: 14, lineHeight: 1.65 }}>
            {instructions.map((step, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{step}</li>
            ))}
          </ol>
        </section>

        <section style={{ background: "#13203a", border: "1px solid #2a3a5f", borderRadius: 4, padding: "20px 24px", marginBottom: 28 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 12px", color: "#e8a04a" }}>{t.envelopeTitle}</h2>
          <p style={{ fontSize: 14, lineHeight: 1.65, margin: "0 0 14px", color: "#c9c0ad" }}>
            {t.envelopeBody}
          </p>
          <div style={{ background: "#0b1220", border: "1px dashed #3a4458", borderRadius: 3, padding: "16px 18px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, color: "#f6efe1", maxWidth: 360 }}>
            <div style={{ fontWeight: 700 }}>Clerk of the U.S. District Court</div>
            <div style={{ borderBottom: "1px solid #3a4458", height: 18 }}></div>
            <div style={{ borderBottom: "1px solid #3a4458", height: 18 }}></div>
            <div style={{ borderBottom: "1px solid #3a4458", height: 18 }}></div>
          </div>
        </section>

        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPh}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 15,
            border: "1px solid #3a4458",
            borderRadius: 3,
            background: "#0b1220",
            color: "#f6efe1",
            fontFamily: "inherit",
            marginBottom: 20,
          }}
        />

        {filtered.length === 0 ? (
          <p style={{ color: "#c9c0ad", fontStyle: "italic" }}>{t.noResults}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((d) => (
              <li
                key={d.name}
                style={{
                  borderBottom: "1px solid #2a3a5f",
                  padding: "16px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e8a04a", background: "#13203a", border: "1px solid #2a3a5f", borderRadius: 2, padding: "2px 7px" }}>
                    {d.state}
                  </span>
                  <strong style={{ fontSize: 15, color: "#f6efe1" }}>{d.name}</strong>
                </div>
                <div style={{ fontSize: 13, color: "#c9c0ad", lineHeight: 1.5, paddingLeft: 2 }}>
                  <em style={{ fontStyle: "italic", color: "#9aa4b8" }}>{t.clerkLabel}:</em><br />
                  {d.clerk_address}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
