import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { submitLead } from "@/lib/leads.functions";
import { FIRM, COMPANY } from "@/lib/firm-info";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contact / Contacto — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Send your information and Sorrentino Law Firm PLLC will review your request. Free during the community crisis. DetencionDefensa.com, Inc. is not a law firm.",
      },
      { property: "og:title", content: "Contact / Contacto — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "Send your information and Sorrentino Law Firm PLLC will review your request. Free during the community crisis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

const COPY = {
  es: {
    title: "Hable con nosotros",
    intro:
      "Envíe su información. La recibimos como agente de admisión del bufete y se la enviamos a Sorrentino Law Firm PLLC para su revisión.",
    name: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono celular",
    city: "Ciudad",
    need: "¿Qué necesita?",
    message: "Cuéntenos brevemente su situación",
    submit: "Enviar",
    sending: "Enviando…",
    ok: "Recibimos su información. El bufete la revisará y se comunicará con usted.",
    disclaimer:
      "Enviar este formulario NO crea una relación abogado-cliente. No envíe información confidencial urgente por este medio. Ninguna relación existe hasta que Sorrentino Law Firm PLLC la acepte por escrito y usted firme la carta de contratación de alcance limitado. No se garantiza ningún resultado.",
    needs: ["Plan de pre-detención", "Un familiar fue detenido", "Documentos familiares", "Otra pregunta"],
  },
  en: {
    title: "Talk to us",
    intro:
      "Send your information. We receive it as the firm's intake agent and forward it to Sorrentino Law Firm PLLC for review.",
    name: "Full name",
    email: "Email",
    phone: "Mobile phone",
    city: "City",
    need: "What do you need?",
    message: "Briefly describe your situation",
    submit: "Send",
    sending: "Sending…",
    ok: "We received your information. The firm will review it and contact you.",
    disclaimer:
      "Submitting this form does NOT create an attorney-client relationship. Do not send urgent confidential information this way. No relationship exists until Sorrentino Law Firm PLLC accepts it in writing and you sign the limited-scope engagement letter. No outcome is guaranteed.",
    needs: ["Pre-detention plan", "A family member was detained", "Family documents", "Other question"],
  },
  ht: {
    title: "Pale ak nou",
    intro:
      "Voye enfòmasyon ou. Nou resevwa li kòm ajan admisyon kabinè a epi nou voye l bay Sorrentino Law Firm PLLC pou revizyon.",
    name: "Non konplè",
    email: "Imèl",
    phone: "Telefòn selilè",
    city: "Vil",
    need: "Kisa ou bezwen?",
    message: "Eksplike sitiyasyon ou an kout",
    submit: "Voye",
    sending: "N ap voye…",
    ok: "Nou resevwa enfòmasyon ou. Kabinè a ap revize l epi kontakte ou.",
    disclaimer:
      "Voye fòm sa a PA kreye yon relasyon avoka-kliyan. Pa voye enfòmasyon konfidansyèl ijan konsa. Pa gen relasyon jiskaske Sorrentino Law Firm PLLC aksepte l alekri epi ou siyen lèt angajman an. Pa gen okenn rezilta garanti.",
    needs: ["Plan anvan detansyon", "Yon fanmi te detni", "Dokiman fanmi", "Lòt kesyon"],
  },
} as const;

function ContactPage() {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", city: "", need: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setErr("");
    try {
      await submitLead({
        data: {
          fullName: form.fullName,
          email: form.email || null,
          phone: form.phone || null,
          city: form.city || null,
          need: form.need || null,
          message: form.message || null,
          language: lang,
          source: "website-contact",
        },
      });
      setState("sent");
    } catch (e2) {
      setErr((e2 as Error).message);
      setState("error");
    }
  };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 6,
    border: "1px solid #3a4458",
    background: "#0b1220",
    color: "#f6efe1",
    marginBottom: 14,
    fontFamily: "inherit",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#f6efe1",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "56px 20px",
      }}
    >
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 34, fontWeight: 700, marginBottom: 8 }}>
          {t.title}
        </h1>
        <p style={{ color: "#a8a59a", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>{t.intro}</p>

        {state === "sent" ? (
          <div style={{ background: "#0d2417", borderLeft: "3px solid #2d6a4f", padding: 16, borderRadius: 6 }}>
            {t.ok}
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <input style={input} placeholder={t.name} required value={form.fullName} onChange={set("fullName")} />
            <input style={input} type="email" placeholder={t.email} value={form.email} onChange={set("email")} />
            <input style={input} placeholder={t.phone} value={form.phone} onChange={set("phone")} />
            <input style={input} placeholder={t.city} value={form.city} onChange={set("city")} />
            <select style={input} value={form.need} onChange={set("need")}>
              <option value="">{t.need}</option>
              {t.needs.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <textarea style={{ ...input, minHeight: 120 }} placeholder={t.message} value={form.message} onChange={set("message")} />
            <button
              type="submit"
              disabled={state === "sending"}
              style={{
                width: "100%",
                background: "#e8a04a",
                color: "#0b1220",
                border: "none",
                padding: "14px 16px",
                fontSize: 16,
                fontWeight: 800,
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {state === "sending" ? t.sending : t.submit}
            </button>
            {err && <p style={{ color: "#ff8080", fontSize: 13, marginTop: 12 }}>{err}</p>}
          </form>
        )}

        <p style={{ marginTop: 24, fontSize: 12, lineHeight: 1.6, color: "#8d8a80" }}>{t.disclaimer}</p>
        <p style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6, color: "#8d8a80" }}>
          {COMPANY.legalName} — {FIRM.legalName}, {FIRM.address}.
        </p>
      </div>
    </main>
  );
}
