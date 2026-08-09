import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import {
  loadSigningPacketFn,
  setPrimaryContactFn,
  signBlankFormsFn,
  getFormPdfFn,
} from "@/lib/esign.functions";

const search = z.object({
  code: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/firmar")({
  validateSearch: search,
  component: SignFormsPage,
  head: () => ({
    meta: [
      { title: "Firme sus formularios en blanco | DetencionDefensa" },
      {
        name: "description",
        content:
          "Firme electrónicamente su poder notarial, autorización escolar, vehículo, banco y propiedad, y envíelos a su contacto principal en la app.",
      },
      { property: "og:title", content: "Firme sus formularios en blanco" },
      {
        property: "og:description",
        content: "Firma electrónica de las autorizaciones que su contacto principal recibirá si la app se activa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    kicker: "SIGN IN ADVANCE",
    h1: "Sign your blank authorization forms",
    lede: "These five forms stay blank. You sign them now, and the moment your app is triggered they go to your PRIMARY CONTACT — not to us, not to the law firm. Your contact fills in the details when they need them.",
    codeLabel: "Activation code",
    load: "Continue",
    notFound: "We could not find that activation code.",
    primary: "1. Choose your primary contact",
    primaryHelp: "This is the only person who receives these signed authorizations when the app fires.",
    noContacts: "No contacts on file yet. Add them in the app or on the intake form first.",
    saved: "Primary contact saved.",
    forms: "2. Review the forms",
    preview: "Preview / download blank",
    signedTag: "Signed",
    sign: "3. Sign",
    nameLabel: "Type your full legal name",
    drawLabel: "Draw your signature below",
    clear: "Clear",
    consent:
      "I agree to sign electronically. I understand my electronic signature has the same legal effect as a handwritten one under the ESIGN Act, and that forms requiring a notary must still be notarized.",
    submit: "Sign selected forms",
    submitting: "Signing…",
    done: "Signed and sealed in your bundle. Your primary contact receives them only if the app is triggered.",
    notary: "Notarization",
    notaryBody:
      "A Florida power of attorney needs two witnesses and a notary. Signing here is not notarization. Take the signed PDF to any UPS Store, bank, or a licensed remote online notary (RON) to finish it — usually $5–$25.",
    error: "Something went wrong. Try again.",
  },
  es: {
    kicker: "FIRME CON ANTICIPACIÓN",
    h1: "Firme sus formularios de autorización en blanco",
    lede: "Estos cinco formularios quedan en blanco. Usted los firma ahora y, en el momento en que se active su app, van a su CONTACTO PRINCIPAL — no a nosotros, no al bufete. Su contacto llena los datos cuando los necesite.",
    codeLabel: "Código de activación",
    load: "Continuar",
    notFound: "No encontramos ese código de activación.",
    primary: "1. Elija su contacto principal",
    primaryHelp: "Es la única persona que recibe estas autorizaciones firmadas cuando la app se activa.",
    noContacts: "Aún no hay contactos registrados. Agréguelos en la app o en el formulario de admisión.",
    saved: "Contacto principal guardado.",
    forms: "2. Revise los formularios",
    preview: "Ver / descargar en blanco",
    signedTag: "Firmado",
    sign: "3. Firme",
    nameLabel: "Escriba su nombre legal completo",
    drawLabel: "Dibuje su firma abajo",
    clear: "Borrar",
    consent:
      "Acepto firmar electrónicamente. Entiendo que mi firma electrónica tiene el mismo efecto legal que una firma a mano bajo la Ley ESIGN, y que los formularios que requieren notario aún deben notarizarse.",
    submit: "Firmar formularios seleccionados",
    submitting: "Firmando…",
    done: "Firmados y guardados en su paquete. Su contacto principal los recibe solo si se activa la app.",
    notary: "Notarización",
    notaryBody:
      "Un poder notarial de Florida requiere dos testigos y un notario. Firmar aquí no es notarizar. Lleve el PDF firmado a cualquier UPS Store, banco o notario remoto en línea (RON) con licencia para completarlo — normalmente $5–$25.",
    error: "Algo salió mal. Intente de nuevo.",
  },
  ht: {
    kicker: "SIYEN ALAVANS",
    h1: "Siyen fòm otorizasyon vid ou yo",
    lede: "Senk fòm sa yo rete vid. Ou siyen yo kounye a, epi lè app ou a aktive yo ale bay KONTAK PRENSIPAL ou a — pa bay nou, pa bay kabinè avoka a. Kontak ou an ranpli detay yo lè li bezwen yo.",
    codeLabel: "Kòd aktivasyon",
    load: "Kontinye",
    notFound: "Nou pa jwenn kòd aktivasyon sa a.",
    primary: "1. Chwazi kontak prensipal ou",
    primaryHelp: "Se sèl moun ki resevwa otorizasyon siyen sa yo lè app la aktive.",
    noContacts: "Poko gen kontak anrejistre. Ajoute yo nan app la oswa nan fòm admisyon an.",
    saved: "Kontak prensipal anrejistre.",
    forms: "2. Gade fòm yo",
    preview: "Gade / telechaje vid",
    signedTag: "Siyen",
    sign: "3. Siyen",
    nameLabel: "Ekri non legal konplè ou",
    drawLabel: "Desine siyati ou anba a",
    clear: "Efase",
    consent:
      "Mwen dakò pou siyen elektwonikman. Mwen konprann siyati elektwonik mwen gen menm efè legal ak yon siyati alamen anba Lwa ESIGN, epi fòm ki mande notè dwe toujou notaryze.",
    submit: "Siyen fòm ou chwazi yo",
    submitting: "K ap siyen…",
    done: "Siyen epi sele nan pakè ou. Kontak prensipal ou resevwa yo sèlman si app la aktive.",
    notary: "Notarizasyon",
    notaryBody:
      "Yon pouvwa avoka Florid mande de temwen ak yon notè. Siyen isit la pa notarizasyon. Pote PDF siyen an nan nenpòt UPS Store, bank, oswa yon notè an liy ki gen lisans (RON) pou fini l — anjeneral $5–$25.",
    error: "Gen yon pwoblèm. Eseye ankò.",
  },
} as const;

type Packet = Awaited<ReturnType<typeof loadSigningPacketFn>>;

function SignaturePad({ onChange, clearLabel }: { onChange: (dataUrl: string | null) => void; clearLabel: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0e1a2b";
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current?.toDataURL("image/png") ?? null);
  };

  const clear = useCallback(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    onChange(null);
  }, [onChange]);

  return (
    <div>
      <canvas
        ref={ref}
        width={560}
        height={170}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        style={{
          width: "100%",
          maxWidth: 560,
          height: 170,
          border: "1px dashed rgba(14,26,43,0.35)",
          borderRadius: 6,
          background: "#fffdf8",
          touchAction: "none",
          cursor: "crosshair",
        }}
      />
      <button
        type="button"
        onClick={clear}
        style={{ marginTop: 8, background: "transparent", border: "1px solid rgba(14,26,43,0.3)", borderRadius: 4, padding: "6px 14px", cursor: "pointer" }}
      >
        {clearLabel}
      </button>
    </div>
  );
}

function SignFormsPage() {
  const { code: codeParam, lang } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];

  const loadFn = useServerFn(loadSigningPacketFn);
  const primaryFn = useServerFn(setPrimaryContactFn);
  const signFn = useServerFn(signBlankFormsFn);
  const pdfFn = useServerFn(getFormPdfFn);

  const [code, setCode] = useState(codeParam ?? "");
  const [packet, setPacket] = useState<Extract<Packet, { ok: true }> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(
    async (c: string) => {
      setBusy(true);
      setMsg(null);
      try {
        const res = await loadFn({ data: { code: c } });
        if (!res.ok) {
          setMsg(t.notFound);
          setPacket(null);
        } else {
          setPacket(res);
          setSelected(res.forms.map((f) => f.type));
          if (!typedName) setTypedName(res.clientName);
        }
      } catch {
        setMsg(t.notFound);
      } finally {
        setBusy(false);
      }
    },
    [loadFn, t.notFound, typedName],
  );

  useEffect(() => {
    if (codeParam) void load(codeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  const openPdf = async (documentType: string) => {
    try {
      const doc = await pdfFn({ data: { code, documentType } });
      const bin = atob(doc.content);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener");
    } catch {
      setMsg(t.error);
    }
  };

  const choosePrimary = async (contactId: string) => {
    setBusy(true);
    try {
      await primaryFn({ data: { code, contactId } });
      await load(code);
      setMsg(t.saved);
    } catch {
      setMsg(t.error);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!signature || !consent || typedName.trim().length < 3 || selected.length === 0) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await signFn({ data: { code, types: selected, signatureDataUrl: signature, typedName } });
      if (res.ok) {
        setDone(true);
        await load(code);
      } else setMsg(t.error);
    } catch {
      setMsg(t.error);
    } finally {
      setBusy(false);
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "36px 20px 80px" };
  const container: React.CSSProperties = { maxWidth: 760, margin: "0 auto" };
  const card: React.CSSProperties = { background: "#fff", border: "1px solid rgba(14,26,43,0.14)", borderRadius: 6, padding: 22, marginBottom: 20 };
  const h2: React.CSSProperties = { fontFamily: "Fraunces, Georgia, serif", fontSize: 19, fontWeight: 600, margin: "0 0 10px" };

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", color: "#8a3c11", marginBottom: 8 }}>{t.kicker}</div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 32, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.15 }}>{t.h1}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "#1a2940", marginBottom: 26, maxWidth: 640 }}>{t.lede}</p>

        {!packet && (
          <div style={card}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.codeLabel}</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="TEST05ES"
                style={{ flex: "1 1 220px", padding: 11, fontSize: 15, letterSpacing: "0.08em", border: "1px solid rgba(14,26,43,0.25)", borderRadius: 4, background: "#faf8f3" }}
              />
              <button
                onClick={() => void load(code)}
                disabled={busy || code.trim().length < 6}
                style={{ background: "#b8551f", color: "#fff", border: 0, borderRadius: 4, padding: "11px 24px", fontWeight: 600, cursor: "pointer" }}
              >
                {t.load}
              </button>
            </div>
          </div>
        )}

        {packet && (
          <>
            <div style={card}>
              <h2 style={h2}>{t.primary}</h2>
              <p style={{ fontSize: 13.5, color: "#5b5b5b", marginTop: 0 }}>{t.primaryHelp}</p>
              {packet.contacts.length === 0 ? (
                <p style={{ fontSize: 14 }}>{t.noContacts}</p>
              ) : (
                packet.contacts.map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      marginBottom: 8,
                      border: c.isPrimary ? "2px solid #b8551f" : "1px solid rgba(14,26,43,0.15)",
                      borderRadius: 5,
                      background: c.isPrimary ? "#fdf5ee" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <input type="radio" name="primary" checked={c.isPrimary} onChange={() => void choosePrimary(c.id)} style={{ marginTop: 4 }} />
                    <span>
                      <strong>{c.name}</strong>
                      {c.relationship ? ` · ${c.relationship}` : ""}
                      <br />
                      <span style={{ fontSize: 13, color: "#5b5b5b" }}>
                        {[c.phone, c.email].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>

            <div style={card}>
              <h2 style={h2}>{t.forms}</h2>
              {packet.forms.map((f) => (
                <div key={f.type} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(14,26,43,0.08)", flexWrap: "wrap" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(f.type)}
                    onChange={(e) =>
                      setSelected((s) => (e.target.checked ? [...s, f.type] : s.filter((x) => x !== f.type)))
                    }
                  />
                  <span style={{ flex: "1 1 260px", fontSize: 14 }}>{f.title}</span>
                  {f.signed && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#2d5a3d", letterSpacing: "0.06em" }}>✓ {t.signedTag}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => void openPdf(f.type)}
                    style={{ background: "transparent", border: "1px solid rgba(14,26,43,0.25)", borderRadius: 4, padding: "5px 12px", fontSize: 12.5, cursor: "pointer" }}
                  >
                    {t.preview}
                  </button>
                </div>
              ))}
            </div>

            <div style={card}>
              <h2 style={h2}>{t.sign}</h2>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.nameLabel}</label>
              <input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                style={{ width: "100%", padding: 10, fontSize: 14, border: "1px solid rgba(14,26,43,0.22)", borderRadius: 4, background: "#faf8f3", marginBottom: 16 }}
              />
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.drawLabel}</label>
              <SignaturePad onChange={setSignature} clearLabel={t.clear} />
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16, fontSize: 13, lineHeight: 1.55 }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
                <span>{t.consent}</span>
              </label>
              <button
                onClick={() => void submit()}
                disabled={busy || !signature || !consent || selected.length === 0 || typedName.trim().length < 3}
                style={{
                  marginTop: 18,
                  background: busy || !signature || !consent ? "rgba(184,85,31,0.45)" : "#b8551f",
                  color: "#fff",
                  border: 0,
                  borderRadius: 4,
                  padding: "12px 26px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: busy ? "default" : "pointer",
                }}
              >
                {busy ? t.submitting : t.submit}
              </button>
              {done && <p style={{ color: "#2d5a3d", fontWeight: 600, marginTop: 14 }}>✓ {t.done}</p>}
            </div>

            <div style={{ ...card, borderLeft: "4px solid #6B4F4F" }}>
              <h2 style={h2}>{t.notary}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t.notaryBody}</p>
            </div>
          </>
        )}

        {msg && <p style={{ color: "#8b3a1f", fontSize: 14 }}>{msg}</p>}
      </div>
    </div>
  );
}
