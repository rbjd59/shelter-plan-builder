import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";


const searchSchema = z.object({
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  discountPct: z.coerce.number().int().min(0).max(100).optional(),
  submissionId: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Subscribe — DetencionDefensa.com" },
      { name: "description", content: "Subscribe to the DefensaSiempre emergency app. Attorney-reviewed documents are included at no extra charge." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "Subscribe to the emergency app",
    sub: "Due to the emergency crisis in our community, all fees are waived. The $199 plan fee and the $10/month app subscription cost you nothing at this time. No payment or card is required.",
    baseTitle: "DefensaSiempre Emergency App",
    baseSub: "Monthly subscription. One tap notifies your emergency contacts and the DetencionDefensa team if you are detained.",
    baseBullets: [
      "One-tap SOS alert with SMS and email",
      "GPS location shared with your emergency contacts",
      "Attorney review of your federal forms before delivery",
      "Family Readiness and Pet Rescue documents included",
    ],
    price: "$10",
    period: "/month",
    plan: "$199",
    waived: "Fee waived",
    total: "Total",
    free: "FREE",
    pay: "Continue — no payment required",
    note: "No payment is collected. Next you'll be asked to read and accept the Terms of Service and the Limited Attorney-Client Retainer Agreement before starting the intake.",
    back: "← Back to home",
  },
  es: {
    title: "Suscríbase a la app de emergencia",
    sub: "Debido a la crisis de emergencia en nuestra comunidad, todas las tarifas están exoneradas. La tarifa del plan de $199 y la suscripción de $10/mes no tienen costo en este momento. No se requiere pago ni tarjeta.",
    baseTitle: "App de Emergencia DefensaSiempre",
    baseSub: "Suscripción mensual. Con un toque se notifica a sus contactos de emergencia y al equipo de DetencionDefensa si lo detienen.",
    baseBullets: [
      "Alerta SOS con un toque por SMS y correo",
      "Ubicación GPS compartida con sus contactos",
      "Revisión de sus formularios federales antes de entregarlos",
      "Documentos de Preparación Familiar y Rescate de Mascotas incluidos",
    ],
    price: "$10",
    period: "/mes",
    plan: "$199",
    waived: "Tarifa exonerada",
    total: "Total",
    free: "GRATIS",
    pay: "Continuar — no se requiere pago",
    note: "No se cobra ningún pago. A continuación se le pedirá leer y aceptar los Términos del Servicio y el Acuerdo Limitado de Retención Abogado-Cliente antes de comenzar el formulario.",
    back: "← Volver al inicio",
  },
  ht: {
    title: "Abònman app ijans la",
    sub: "Akòz kriz ijans nan kominote a, tout frè yo anile. Frè plan $199 la ak abònman $10/mwa a pa koute w anyen kounye a. Pa gen peman ni kat ki nesesè.",
    baseTitle: "App Ijans DefensaSiempre",
    baseSub: "Abònman chak mwa. Yon sèl klik avèti kontak ijans ou ak ekip DetencionDefensa si yo detni w.",
    baseBullets: [
      "Alèt SOS yon sèl klik pa SMS ak imèl",
      "Lokalizasyon GPS pataje ak kontak ijans ou",
      "Revizyon fòm federal ou anvan livrezon",
      "Dokiman pou prepare fanmi ak sekou bèt kay enkli",
    ],
    price: "$10",
    period: "/mwa",
    plan: "$199",
    waived: "Frè anile",
    total: "Total",
    free: "GRATIS",
    pay: "Kontinye — pa gen peman",
    note: "Nou pa pran okenn peman. Apre sa w ap dwe li epi dakò ak Tèm Sèvis la ak Akò Retansyon Limite Avoka-Kliyan an anvan w kòmanse fòm nan.",
    back: "← Tounen lakay",
  },
} as const;

function CheckoutPage() {
  const { lang } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];
  const navigate = useNavigate();

  const langs: Lang[] = ["es", "en", "ht"];
  const langBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 4,
    border: "1px solid #3a4458", background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b1220" : "#f6efe1", textDecoration: "none",
  });

  const card: React.CSSProperties = {
    background: "#0b1220", border: "1px solid #3a4458", borderRadius: 6,
    padding: 20, marginBottom: 16,
  };
  const cardHeader: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    gap: 12, marginBottom: 6,
  };
  const priceTag: React.CSSProperties = {
    fontSize: 22, fontWeight: 700, color: "#e8a04a", fontFamily: "Fraunces, serif",
    whiteSpace: "nowrap",
  };
  const struck: React.CSSProperties = {
    textDecoration: "line-through",
    textDecorationColor: "#e02b2b",
    textDecorationThickness: 3,
    color: "#a8a59a",
  };
  const waivedTag: React.CSSProperties = {
    display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 800,
    letterSpacing: 1, textTransform: "uppercase", padding: "3px 8px",
    borderRadius: 3, background: "#1f4d2a", color: "#b9f2c4",
  };
  const tag = (bg: string, color: string): React.CSSProperties => ({
    display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 1,
    textTransform: "uppercase", padding: "3px 8px", borderRadius: 3,
    background: bg, color, marginBottom: 8,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
          {langs.map((l) => (
            <Link key={l} to="/checkout" search={{ lang: l }} style={langBtn(l === L)}>{l.toUpperCase()}</Link>
          ))}
        </div>
        <div style={{ background: "#1a2436", borderRadius: 8, padding: 32, borderTop: "4px solid #e8a04a" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10, fontFamily: "Fraunces, serif" }}>{t.title}</h1>
          <p style={{ fontSize: 15, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 24 }}>{t.sub}</p>

          {/* Base subscription */}
          <div style={card}>
            <div style={cardHeader}>
              <div style={{ flex: 1 }}>
                <span style={tag("#e8a04a", "#0b1220")}>REQUIRED</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "Fraunces, serif" }}>{t.baseTitle}</h2>
                <p style={{ fontSize: 13, color: "#cfc8b8", lineHeight: 1.5 }}>{t.baseSub}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={priceTag}>
                  <span style={struck}>{t.plan}</span>
                  <span style={{ ...struck, marginLeft: 8 }}>{t.price}<span style={{ fontSize: 14, fontWeight: 500 }}>{t.period}</span></span>
                </div>
                <div style={waivedTag}>{t.waived}</div>
              </div>
            </div>
            <ul style={{ paddingLeft: 20, marginTop: 10 }}>
              {t.baseBullets.map((b, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#cfc8b8" }}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 4px", borderTop: "1px solid #3a4458", marginTop: 8, marginBottom: 20 }}>
            <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "#a8a59a" }}>{t.total}</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#a8a59a", fontFamily: "Fraunces, serif" }}>
                <span style={struck}>$199</span>
                <span style={{ ...struck, marginLeft: 8 }}>$10{t.period}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#7fd18a", fontFamily: "Fraunces, serif" }}>{t.free}</div>
              <div style={waivedTag}>{t.waived}</div>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/agreement", search: { lang: L } as never })}
            style={{ background: "#e8a04a", color: "#0b1220", padding: "16px 28px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}
          >
            {t.pay}
          </button>

          <p style={{ fontSize: 12, color: "#a8a59a", marginTop: 16, lineHeight: 1.5 }}>{t.note}</p>
        </div>
        <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 20, color: "#e8a04a" }}>{t.back}</Link>
      </div>
    </div>
  );
}
