import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getApkInfo } from "@/lib/download.functions";
import { useLang, type Lang } from "@/context/LanguageContext";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Download the HELP NOW App — DetencionDefensa" },
      {
        name: "description",
        content:
          "Install the DetencionDefensa HELP NOW app — one tap notifies your legal team and family the moment ICE detains you.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (!isIOS) return false;
  // Chrome on iOS = "CriOS", Firefox = "FxiOS", Edge = "EdgiOS", in-app browsers vary
  return !/CriOS|FxiOS|EdgiOS|GSA\//.test(ua);
}

// ---------------- i18n ----------------

type Tab = "ios" | "android";

const T = {
  es: {
    title: "Instalar AYUDA YA",
    subtitle:
      "Un toque en el teléfono alerta a su equipo legal y a su familia — incluso si le quitan el teléfono.",
    iphone: "iPhone",
    android: "Android",
    back: "← Volver a DetencionDefensa",
    // iPhone (single page)
    iosHeading: "iPhone — instalación en 4 pasos",
    iosIntro:
      "El iPhone usa la app web. No necesita la App Store. Abra esta página en Safari y agréguela a la pantalla de inicio.",
    iosOpenBtn: "Abrir página AYUDA YA",
    iosSteps: [
      "Abra detenciondefensa.com/app en Safari (no en Chrome ni en el correo).",
      "Toque el botón Compartir (cuadrado con flecha hacia arriba) abajo.",
      "Baje y toque «Agregar a pantalla de inicio».",
      "Toque «Agregar». El ícono rojo AYUDA YA aparecerá en su pantalla.",
      "Ábralo, permita ubicación y complete la configuración una vez.",
    ],
    iosWarn:
      "⚠️ El enlace de instalación del correo de confirmación debe abrirse en Safari para que la configuración cargue.",
    iosNotSafariTitle: "Abra esta página en Safari",
    iosNotSafariBody:
      "Está usando Chrome (u otro navegador). En iPhone, «Agregar a pantalla de inicio» solo funciona en Safari. Copie el enlace y péguelo en Safari.",
    iosCopyLink: "Copiar enlace",
    iosCopied: "¡Copiado! Abra Safari y pegue.",
    iosOpenSafari: "Abrir en Safari",
    // Android — Step 1
    aStep1Heading: "Android — Paso 1 de 2: Descargar",
    aStep1Body:
      "Toque el botón rojo abajo para descargar la aplicación (.apk). El archivo se guardará en su carpeta de Descargas.",
    aDownloadBtn: "Descargar app Android (.apk)",
    aVersion: "Versión",
    aNextBtn: "Continuar al Paso 2 →",
    // Android — Step 2
    aStep2Heading: "Android — Paso 2 de 2: Instalar",
    aStep2Steps: [
      "Abra el archivo descargado (toque la notificación o ábralo desde Descargas).",
      "Si Android pregunta, permita instalaciones desde este sitio.",
      "Toque «Instalar» y espere unos segundos.",
      "Abra la app. Luego toque el enlace de instalación del correo de confirmación para cargar su caso.",
      "Permita ubicación cuando se le solicite.",
    ],
    aStep2Warn:
      "Si su teléfono bloquea la instalación, vaya a Configuración → Seguridad → permita «Instalar apps desconocidas» para su navegador.",
    aBackBtn: "← Volver al Paso 1",
    // Android testing fallback
    aTestingHeading: "App Android en pruebas finales",
    aTestingBody:
      "El .apk de Android está en pruebas finales. Mientras tanto use la app web — funciona igual.",
    aOpenWeb: "Abrir página de emergencia",
  },
  en: {
    title: "Install HELP NOW",
    subtitle:
      "One tap on the phone alerts your legal team and family — even if the phone is taken.",
    iphone: "iPhone",
    android: "Android",
    back: "← Back to DetencionDefensa",
    iosHeading: "iPhone — install in 4 steps",
    iosIntro:
      "iPhone uses the web app — no App Store needed. Open this page in Safari, then add it to your home screen.",
    iosOpenBtn: "Open HELP NOW Page",
    iosSteps: [
      "Open detenciondefensa.com/app in Safari (not Chrome or your email app).",
      "Tap the Share button (square with up-arrow) at the bottom.",
      "Scroll down and tap “Add to Home Screen”.",
      "Tap “Add”. The red HELP NOW icon appears on your home screen.",
      "Open it, allow location, and complete one-time setup.",
    ],
    iosWarn:
      "⚠️ The install link from your confirmation email must be opened in Safari for setup to load.",
    iosNotSafariTitle: "Open this page in Safari",
    iosNotSafariBody:
      "You're using Chrome (or another browser). On iPhone, “Add to Home Screen” only works in Safari. Copy the link and paste it into Safari.",
    iosCopyLink: "Copy link",
    iosCopied: "Copied! Open Safari and paste.",
    iosOpenSafari: "Open in Safari",
    aStep1Heading: "Android — Step 1 of 2: Download",
    aStep1Body:
      "Tap the red button below to download the app (.apk). It will save to your Downloads folder.",
    aDownloadBtn: "Download Android App (.apk)",
    aVersion: "Version",
    aNextBtn: "Continue to Step 2 →",
    aStep2Heading: "Android — Step 2 of 2: Install",
    aStep2Steps: [
      "Open the downloaded file (tap the notification or open from Downloads).",
      "If Android asks, allow installs from this site.",
      "Tap “Install” and wait a few seconds.",
      "Open the app, then tap the install link from your confirmation email to load your case.",
      "Allow location when prompted.",
    ],
    aStep2Warn:
      "If your phone blocks the install, go to Settings → Security → allow “Install unknown apps” for your browser.",
    aBackBtn: "← Back to Step 1",
    aTestingHeading: "Android app in final testing",
    aTestingBody:
      "The Android .apk is in final testing. Use the web app on Android in the meantime — it works the same way.",
    aOpenWeb: "Open Web Emergency Page",
  },
  ht: {
    title: "Enstale AYÈ KOUNYE A",
    subtitle:
      "Yon sèl tap sou telefòn lan alète ekip legal ou ak fanmi w — menm si yo pran telefòn lan.",
    iphone: "iPhone",
    android: "Android",
    back: "← Retounen sou DetencionDefensa",
    iosHeading: "iPhone — enstalasyon nan 4 etap",
    iosIntro:
      "iPhone sèvi avèk app entènèt la — pa bezwen App Store. Ouvri paj sa nan Safari, epi ajoute li sou ekran prensipal ou.",
    iosOpenBtn: "Ouvri paj AYÈ KOUNYE A",
    iosSteps: [
      "Ouvri detenciondefensa.com/app nan Safari (pa nan Chrome ni nan imèl).",
      "Peze bouton Pataje (kare ak flèch monte) anba a.",
      "Desann epi peze «Ajoute sou Ekran Prensipal».",
      "Peze «Ajoute». Ikòn wouj AYÈ KOUNYE A ap parèt sou ekran ou.",
      "Ouvri li, otorize lokalizasyon, epi konplete konfigirasyon yon sèl fwa.",
    ],
    iosWarn:
      "⚠️ Lyen enstalasyon nan imèl konfimasyon an dwe ouvri nan Safari pou konfigirasyon an chaje.",
    aStep1Heading: "Android — Etap 1 sou 2: Telechaje",
    aStep1Body:
      "Peze bouton wouj la anba pou telechaje aplikasyon an (.apk). L ap sove nan dosye Downloads ou.",
    aDownloadBtn: "Telechaje App Android (.apk)",
    aVersion: "Vèsyon",
    aNextBtn: "Kontinye nan Etap 2 →",
    aStep2Heading: "Android — Etap 2 sou 2: Enstale",
    aStep2Steps: [
      "Ouvri fichye ou telechaje a (peze notifikasyon an oswa louvri li nan Downloads).",
      "Si Android mande, otorize enstalasyon sòti nan sit sa.",
      "Peze «Enstale» epi tann kèk segond.",
      "Ouvri app la, epi peze lyen enstalasyon nan imèl konfimasyon ou pou chaje dosye w.",
      "Otorize lokalizasyon lè li mande w.",
    ],
    aStep2Warn:
      "Si telefòn ou bloke enstalasyon an, ale nan Paramèt → Sekirite → otorize «Enstale app enkoni» pou navigatè ou.",
    aBackBtn: "← Retounen Etap 1",
    aTestingHeading: "App Android nan tès final",
    aTestingBody:
      "Fichye Android .apk la nan tès final. Sèvi ak app entènèt la sou Android pandan tan an — li fonksyone menm jan.",
    aOpenWeb: "Ouvri paj ijans entènèt",
  },
} as const;

// ---------------- styles ----------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0b0d",
    color: "#f4f4f5",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  } as const,
  card: { maxWidth: 480, width: "100%", textAlign: "center" as const },
  langBar: {
    display: "flex" as const,
    justifyContent: "center" as const,
    gap: 6,
    marginBottom: 20,
  },
  langBtn: (active: boolean) => ({
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid #27272a",
    background: active ? "#dc2626" : "#18181b",
    color: active ? "#fff" : "#a1a1aa",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  }),
  tabs: {
    display: "inline-flex" as const,
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: (active: boolean) => ({
    padding: "8px 18px",
    borderRadius: 7,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    background: active ? "#dc2626" : "transparent",
    color: active ? "#fff" : "#a1a1aa",
  }),
  primaryBtn: {
    display: "inline-block" as const,
    background: "#dc2626",
    color: "#fff",
    fontWeight: 700,
    fontSize: 18,
    padding: "16px 32px",
    borderRadius: 12,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    display: "inline-block" as const,
    background: "transparent",
    color: "#d4d4d8",
    fontWeight: 600,
    fontSize: 14,
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid #3f3f46",
    cursor: "pointer",
    textDecoration: "none",
  },
  panel: {
    marginTop: 24,
    padding: 16,
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 10,
    textAlign: "left" as const,
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 1.7,
  },
  warn: {
    color: "#fbbf24",
    margin: "12px 0 0",
    fontSize: 13,
  },
  pill: {
    display: "inline-block" as const,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#7f1d1d",
    color: "#fee2e2",
    marginBottom: 12,
  },
  intro: {
    color: "#d4d4d8",
    lineHeight: 1.55,
    margin: "0 0 20px",
  },
} as const;

function DownloadPage() {
  const { lang, setLang } = useLang();
  const t = T[lang];
  const fetchApk = useServerFn(getApkInfo);
  const [state, setState] = useState<{ loading: boolean; url: string | null; version: string | null }>({
    loading: true,
    url: null,
    version: null,
  });
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [tab, setTab] = useState<Tab>("android");
  const [androidStep, setAndroidStep] = useState<1 | 2>(1);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setTab(p === "ios" ? "ios" : "android");
  }, []);

  useEffect(() => {
    fetchApk()
      .then((info) => setState({ loading: false, url: info.url, version: info.version }))
      .catch(() => setState({ loading: false, url: null, version: null }));
  }, [fetchApk]);

  const handleDownload = () => {
    if (state.url) {
      window.location.href = state.url;
      // Advance to step 2 so they see install instructions when they return.
      setTimeout(() => setAndroidStep(2), 800);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Language bar */}
        <div style={styles.langBar}>
          {(["es", "en", "ht"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={styles.langBtn(lang === l)}>
              {l === "es" ? "Español" : l === "en" ? "English" : "Kreyòl"}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 12 }}>📱</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>{t.title}</h1>
        <p style={{ color: "#a1a1aa", fontSize: 14, margin: "0 0 20px" }}>{t.subtitle}</p>

        {/* Platform tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setTab("ios")} style={styles.tabBtn(tab === "ios")}>
             {t.iphone}
          </button>
          <button onClick={() => setTab("android")} style={styles.tabBtn(tab === "android")}>
            🤖 {t.android}
          </button>
        </div>

        {/* iPhone — single page */}
        {tab === "ios" && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{t.iosHeading}</h2>
            <p style={styles.intro}>{t.iosIntro}</p>
            <a href="/app" style={styles.primaryBtn}>
              {t.iosOpenBtn}
            </a>
            <div style={styles.panel}>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {t.iosSteps.map((step, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {step}
                  </li>
                ))}
              </ol>
              <p style={styles.warn}>{t.iosWarn}</p>
            </div>
          </>
        )}

        {/* Android — two pages */}
        {tab === "android" && state.loading && <p style={{ color: "#a1a1aa" }}>…</p>}

        {tab === "android" && !state.loading && state.url && androidStep === 1 && (
          <>
            <span style={styles.pill}>1 / 2</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{t.aStep1Heading}</h2>
            <p style={styles.intro}>{t.aStep1Body}</p>
            <button onClick={handleDownload} style={styles.primaryBtn}>
              {t.aDownloadBtn}
            </button>
            {state.version && (
              <p style={{ color: "#71717a", fontSize: 13, margin: "8px 0 0" }}>
                {t.aVersion} {state.version}
              </p>
            )}
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setAndroidStep(2)} style={styles.secondaryBtn}>
                {t.aNextBtn}
              </button>
            </div>
          </>
        )}

        {tab === "android" && !state.loading && state.url && androidStep === 2 && (
          <>
            <span style={styles.pill}>2 / 2</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>{t.aStep2Heading}</h2>
            <div style={styles.panel}>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {t.aStep2Steps.map((step, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {step}
                  </li>
                ))}
              </ol>
              <p style={styles.warn}>{t.aStep2Warn}</p>
            </div>
            <div style={{ marginTop: 20 }}>
              <button onClick={() => setAndroidStep(1)} style={styles.secondaryBtn}>
                {t.aBackBtn}
              </button>
            </div>
          </>
        )}

        {tab === "android" && !state.loading && !state.url && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: "#fbbf24" }}>
              {t.aTestingHeading}
            </h2>
            <p style={styles.intro}>{t.aTestingBody}</p>
            <a href="/app" style={styles.primaryBtn}>
              {t.aOpenWeb}
            </a>
          </>
        )}

        <div style={{ marginTop: 40 }}>
          <a href="/" style={{ color: "#71717a", fontSize: 13, textDecoration: "none" }}>
            {t.back}
          </a>
        </div>
      </div>
    </div>
  );
}
