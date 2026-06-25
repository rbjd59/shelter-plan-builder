import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getAppDownloadInfo, type AppDownloadInfo } from "@/lib/download.functions";
import { useLang, type Lang } from "@/context/LanguageContext";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Download the NOTIFY FAMILY App — DetencionDefensa" },
      {
        name: "description",
        content:
          "Install the DetencionDefensa NOTIFY FAMILY app — one tap notifies your legal team and family the moment ICE detains you.",
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

function parseAndroidVersion(): number | null {
  if (typeof navigator === "undefined") return null;
  const m = (navigator.userAgent || "").match(/Android\s+(\d+)(?:\.(\d+))?/i);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  if (!isIOS) return false;
  return !/CriOS|FxiOS|EdgiOS|GSA\//.test(ua);
}

type Tab = "ios" | "android";

const T = {
  es: {
    title: "Instalar AVISAR A FAMILIA",
    subtitle:
      "Un toque en el teléfono alerta a su equipo legal y a su familia — incluso si le quitan el teléfono.",
    iphone: "iPhone",
    android: "Android",
    back: "← Volver a DetencionDefensa",
    iosHeading: "iPhone — instalación en 4 pasos",
    iosIntro:
      "El iPhone usa la app web. No necesita la App Store. Abra esta página en Safari y agréguela a la pantalla de inicio.",
    iosOpenBtn: "Abrir página AVISAR A FAMILIA",
    iosSteps: [
      "Abra detenciondefensa.com/app en Safari (no en Chrome ni en el correo).",
      "Toque el botón Compartir (cuadrado con flecha hacia arriba) abajo.",
      "Baje y toque «Agregar a pantalla de inicio».",
      "Toque «Agregar». El ícono rojo AVISAR A FAMILIA aparecerá en su pantalla.",
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
    iosTestflightBtn: "Abrir invitación TestFlight",
    iosTestflightPending: "Invitación TestFlight próximamente",
    iosTestflightPendingBody:
      "Aún estamos esperando la aprobación de Apple. Mientras tanto, use la app web siguiendo los pasos abajo — funciona igual.",
    aStep1Heading: "Android — Paso 1 de 2: Descargar",
    aStep1Body:
      "Toque el botón rojo abajo para descargar la aplicación (.apk). El archivo se guardará en su carpeta de Descargas.",
    aDownloadBtn: "Descargar app Android (.apk)",
    aVersion: "Versión",
    aNextBtn: "Continuar al Paso 2 →",
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
    aErrorTitle: "No se pudo iniciar la descarga",
    aErrorBody:
      "El archivo de instalación de Android no está disponible en este momento. Nuestro equipo recibió una alerta. Por favor escríbanos o use la app web mientras tanto.",
    aErrorEmail: "Reportar enlace roto",
    aOpenWeb: "Usar app web ahora",
    aMinAndroidWarn: (min: number, have: number) =>
      `⚠️ Su Android ${have} es demasiado antiguo. Esta app requiere Android ${min} o superior. Use la app web en su lugar.`,
  },
  en: {
    title: "Install NOTIFY FAMILY",
    subtitle:
      "One tap on the phone alerts your legal team and family — even if the phone is taken.",
    iphone: "iPhone",
    android: "Android",
    back: "← Back to DetencionDefensa",
    iosHeading: "iPhone — install in 4 steps",
    iosIntro:
      "iPhone uses the web app — no App Store needed. Open this page in Safari, then add it to your home screen.",
    iosOpenBtn: "Open NOTIFY FAMILY Page",
    iosSteps: [
      "Open detenciondefensa.com/app in Safari (not Chrome or your email app).",
      "Tap the Share button (square with up-arrow) at the bottom.",
      "Scroll down and tap “Add to Home Screen”.",
      "Tap “Add”. The red NOTIFY FAMILY icon appears on your home screen.",
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
    iosTestflightBtn: "Open TestFlight invite",
    iosTestflightPending: "TestFlight invite coming soon",
    iosTestflightPendingBody:
      "We're still waiting on Apple's approval. In the meantime, use the web app with the steps below — it works the same way.",
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
    aErrorTitle: "Download couldn't start",
    aErrorBody:
      "The Android install file isn't available right now. Our team has been alerted. Please email us or use the web app in the meantime.",
    aErrorEmail: "Report broken link",
    aOpenWeb: "Use web app now",
    aMinAndroidWarn: (min: number, have: number) =>
      `⚠️ Your Android ${have} is too old. This app requires Android ${min} or newer. Use the web app instead.`,
  },
  ht: {
    title: "Enstale AVIZE FANMI",
    subtitle:
      "Yon sèl tap sou telefòn lan alète ekip legal ou ak fanmi w — menm si yo pran telefòn lan.",
    iphone: "iPhone",
    android: "Android",
    back: "← Retounen sou DetencionDefensa",
    iosHeading: "iPhone — enstalasyon nan 4 etap",
    iosIntro:
      "iPhone sèvi avèk app entènèt la — pa bezwen App Store. Ouvri paj sa nan Safari, epi ajoute li sou ekran prensipal ou.",
    iosOpenBtn: "Ouvri paj AVIZE FANMI",
    iosSteps: [
      "Ouvri detenciondefensa.com/app nan Safari (pa nan Chrome ni nan imèl).",
      "Peze bouton Pataje (kare ak flèch monte) anba a.",
      "Desann epi peze «Ajoute sou Ekran Prensipal».",
      "Peze «Ajoute». Ikòn wouj AVIZE FANMI ap parèt sou ekran ou.",
      "Ouvri li, otorize lokalizasyon, epi konplete konfigirasyon yon sèl fwa.",
    ],
    iosWarn:
      "⚠️ Lyen enstalasyon nan imèl konfimasyon an dwe ouvri nan Safari pou konfigirasyon an chaje.",
    iosNotSafariTitle: "Ouvri paj sa nan Safari",
    iosNotSafariBody:
      "W ap sèvi ak Chrome (oswa yon lòt navigatè). Sou iPhone, «Ajoute sou Ekran Prensipal» mache sèlman nan Safari. Kopi lyen an epi kole li nan Safari.",
    iosCopyLink: "Kopi lyen",
    iosCopied: "Kopye! Ouvri Safari epi kole.",
    iosOpenSafari: "Ouvri nan Safari",
    iosTestflightBtn: "Ouvri envitasyon TestFlight",
    iosTestflightPending: "Envitasyon TestFlight ap vini",
    iosTestflightPendingBody:
      "Nou toujou ap tann apwobasyon Apple. Pandan tan an, sèvi ak app entènèt la avèk etap anba yo — li fonksyone menm jan.",
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
    aErrorTitle: "Telechajman an pa t kapab kòmanse",
    aErrorBody:
      "Fichye enstalasyon Android la pa disponib kounye a. Ekip nou an resevwa yon alèt. Tanpri voye imèl ban nou oswa sèvi ak app entènèt la pandan tan an.",
    aErrorEmail: "Rapòte lyen kraze",
    aOpenWeb: "Sèvi ak app entènèt kounye a",
    aMinAndroidWarn: (min: number, have: number) =>
      `⚠️ Android ${have} ou twò ansyen. App sa mande Android ${min} oswa pi nouvo. Sèvi ak app entènèt la pito.`,
  },
} as const;

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
  errorBox: {
    background: "#7f1d1d",
    border: "1px solid #fca5a5",
    borderRadius: 10,
    padding: 18,
    textAlign: "left" as const,
    marginBottom: 18,
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

const SUPPORT_EMAIL = "support@detenciondefensa.com";

function DownloadPage() {
  const { lang, setLang } = useLang();
  const t = T[lang];
  const fetchInfo = useServerFn(getAppDownloadInfo);
  const [info, setInfo] = useState<AppDownloadInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [androidMajor, setAndroidMajor] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>("android");
  const [androidStep, setAndroidStep] = useState<1 | 2>(1);
  const [iosSafari, setIosSafari] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setTab(p === "ios" ? "ios" : "android");
    setIosSafari(p !== "ios" || isIOSSafari());
    setAndroidMajor(parseAndroidVersion());
  }, []);

  const installUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/download`
      : "https://detenciondefensa.com/download";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t.iosCopyLink, installUrl);
    }
  };

  useEffect(() => {
    fetchInfo()
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setInfo(null);
        setLoading(false);
      });
  }, [fetchInfo]);

  const android = info?.android;
  const ios = info?.ios;
  const minSdk = android?.minAndroidSdk ?? null;
  // Android API 26 = Android 8. Rough mapping: major = SDK - 18 (for 8/26, 7/24, etc.).
  const minMajorVersion = minSdk ? Math.max(1, minSdk - 18) : null;
  const showTooOld =
    platform === "android" &&
    androidMajor !== null &&
    minMajorVersion !== null &&
    androidMajor < minMajorVersion;

  const handleDownload = () => {
    if (android?.url) {
      window.location.href = android.url;
      setTimeout(() => setAndroidStep(2), 800);
    }
  };

  // Suppress unused-variable lint for `platform` while still using it above.
  void platform;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.langBar}>
          {(["es", "en", "ht"] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} style={styles.langBtn(lang === l)}>
              {l === "es" ? "Español" : l === "en" ? "English" : "Kreyòl"}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 12 }}>📱</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>{t.title}</h1>
        <p style={{ color: "#a1a1aa", fontSize: 14, margin: "0 0 16px" }}>{t.subtitle}</p>

        <div
          style={{
            background: "#1c1917",
            border: "1px solid #f59e0b",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 20,
            textAlign: "left",
            fontSize: 13,
            color: "#fde68a",
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: "#fbbf24" }}>
            {lang === "es"
              ? "Esto no se instala automáticamente."
              : lang === "ht"
              ? "Sa pa enstale otomatikman."
              : "This does not install automatically."}
          </strong>{" "}
          {lang === "es"
            ? "iPhone guarda un acceso directo en la pantalla de inicio (debe usar Safari). Android descarga un archivo .apk. Elija su teléfono abajo y siga los pasos — toma menos de 1 minuto."
            : lang === "ht"
            ? "iPhone sove yon rakousi sou ekran prensipal (fòk ou itilize Safari). Android telechaje yon fichye .apk. Chwazi telefòn ou anba a epi swiv etap yo — li pran mwens pase 1 minit."
            : "iPhone saves a shortcut to your home screen (you must use Safari). Android downloads an .apk file. Pick your phone below and follow the steps — under 1 minute."}
        </div>

        <div style={styles.tabs}>
          <button onClick={() => setTab("ios")} style={styles.tabBtn(tab === "ios")}>
             {t.iphone}
          </button>
          <button onClick={() => setTab("android")} style={styles.tabBtn(tab === "android")}>
            🤖 {t.android}
          </button>
        </div>

        {/* ============ iPhone ============ */}
        {/* TestFlight ONLY. No PWA / Add-to-Home-Screen path — the native */}
        {/* Flutter app is what the customer is supposed to install.        */}
        {tab === "ios" && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{t.iosHeading}</h2>
            {!loading && ios && ios.testflightUrl ? (
              <>
                <p style={styles.intro}>
                  {lang === "es"
                    ? "iPhone usa TestFlight (la app oficial de Apple para apps en prueba). Toque el botón abajo en su iPhone, instale TestFlight si se le solicita, y luego acepte la invitación."
                    : lang === "ht"
                    ? "iPhone sèvi avèk TestFlight (app ofisyèl Apple pou app k ap teste). Peze bouton anba a sou iPhone ou, enstale TestFlight si li mande w, epi aksepte envitasyon an."
                    : "iPhone uses TestFlight (Apple's official app for beta apps). Tap the button below on your iPhone, install TestFlight if asked, then accept the invitation."}
                </p>
                <a href={ios.testflightUrl} style={styles.primaryBtn}>
                  {t.iosTestflightBtn}
                </a>
                {ios.version && (
                  <p style={{ color: "#71717a", fontSize: 13, margin: "10px 0 0" }}>
                    {t.aVersion} {ios.version}
                  </p>
                )}
                <p style={{ color: "#a1a1aa", fontSize: 12, margin: "16px 0 0", lineHeight: 1.55 }}>
                  {lang === "es"
                    ? "Importante: este enlace solo funciona en el iPhone con el correo electrónico que envió en el intake. Si TestFlight dice que la invitación no es para usted, escríbanos."
                    : lang === "ht"
                    ? "Enpòtan: lyen sa mache sèlman sou iPhone la avèk imèl ou te bay nan enskripsyon an. Si TestFlight di envitasyon an pa pou ou, ekri nou."
                    : "Important: this link only works on your iPhone with the email address you submitted at intake. If TestFlight says the invitation isn't for you, email us."}
                </p>
              </>
            ) : (
              <div
                style={{
                  background: "#1c1917",
                  border: "1px solid #f59e0b",
                  borderRadius: 10,
                  padding: 14,
                  marginTop: 8,
                  textAlign: "left",
                  fontSize: 13,
                  color: "#fde68a",
                  lineHeight: 1.55,
                }}
              >
                <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#fbbf24" }}>
                  {t.iosTestflightPending}
                </p>
                <p style={{ margin: "0 0 12px" }}>
                  {lang === "es"
                    ? "La invitación TestFlight para su iPhone aún no está lista. Escríbanos y se la enviaremos directamente."
                    : lang === "ht"
                    ? "Envitasyon TestFlight pou iPhone ou poko pare. Ekri nou epi n ap voye li dirèkteman ba ou."
                    : "Your iPhone TestFlight invite isn't ready yet. Email us and we'll send it to you directly."}
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=iPhone%20TestFlight%20invite`}
                  style={{ ...styles.primaryBtn, fontSize: 14, padding: "10px 18px" }}
                >
                  ✉️ {lang === "es" ? "Pedir invitación" : lang === "ht" ? "Mande envitasyon" : "Request invite"}
                </a>
              </div>
            )}
          </>
        )}


        {/* ============ Android ============ */}
        {tab === "android" && loading && <p style={{ color: "#a1a1aa" }}>…</p>}

        {tab === "android" && !loading && showTooOld && minMajorVersion !== null && androidMajor !== null && (
          <div style={styles.errorBox}>
            <p style={{ margin: "0 0 12px", color: "#fff", fontWeight: 700 }}>
              {t.aMinAndroidWarn(minMajorVersion, androidMajor)}
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Android%20version%20too%20old`}
              style={{ ...styles.primaryBtn, fontSize: 15, padding: "12px 22px" }}
            >
              ✉️ {t.aErrorEmail}
            </a>

          </div>
        )}

        {tab === "android" && !loading && !showTooOld && android?.available && androidStep === 1 && (
          <>
            <span style={styles.pill}>1 / 2</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{t.aStep1Heading}</h2>
            <p style={styles.intro}>{t.aStep1Body}</p>
            <button onClick={handleDownload} style={styles.primaryBtn}>
              {t.aDownloadBtn}
            </button>
            {android.version && (
              <p style={{ color: "#71717a", fontSize: 13, margin: "8px 0 0" }}>
                {t.aVersion} {android.version}
                {minMajorVersion !== null && ` · Android ${minMajorVersion}+`}
              </p>
            )}
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setAndroidStep(2)} style={styles.secondaryBtn}>
                {t.aNextBtn}
              </button>
            </div>
          </>
        )}

        {tab === "android" && !loading && !showTooOld && android?.available && androidStep === 2 && (
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

        {tab === "android" && !loading && !showTooOld && !android?.available && (
          <div style={styles.errorBox}>
            <p style={{ margin: "0 0 8px", color: "#fff", fontWeight: 700, fontSize: 16 }}>
              ⚠️ {t.aErrorTitle}
            </p>
            <p style={{ margin: "0 0 14px", color: "#fee2e2", fontSize: 14, lineHeight: 1.55 }}>
              {t.aErrorBody}
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Android%20download%20broken`}
                style={{ ...styles.primaryBtn, fontSize: 14, padding: "10px 18px", background: "#fff", color: "#7f1d1d" }}
              >
                ✉️ {t.aErrorEmail}
              </a>
              <a
                href="/app"
                style={{ ...styles.secondaryBtn, color: "#fff", borderColor: "#fca5a5" }}
              >
                {t.aOpenWeb}
              </a>
            </div>
          </div>
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
