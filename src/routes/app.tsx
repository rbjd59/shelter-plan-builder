import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { bootstrapAppFromToken, type AppBootstrapPayload } from "@/lib/app-install.functions";
import { backfillAppPdfs } from "@/lib/app-backfill.functions";
import { SELF_HELP_LIBRARY } from "@/lib/self-help-library";

export const Route = createFileRoute("/app")({
  component: EmergencyApp,
  head: () => ({
    meta: [
      { title: "NOTIFY FAMILY — DetencionDefensa" },
      { name: "theme-color", content: "#dc2626" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "NOTIFY FAMILY" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/help-icon-512.png" },
      { rel: "icon", href: "/help-icon-512.png" },
    ],
  }),
});

const DB_NAME = "dd_emergency";
const STORE = "case";
const OUTBOX_STORE = "outbox";
const KEY = "v1";

interface CaseRecord {
  habeasPdfB64: string;
  ifpPdfB64: string;
  motionPdfB64?: string | null;
  js44PdfB64?: string | null;
  brochurePdfB64?: string;
  caseId: string;
  fullName: string;
  contactName: string;
  contactEmail: string;
  language: string;
  installedAt: string;
  role: "client" | "family";
  // Setup-only fields (stored after one-time setup):
  alertEmail?: string;     // where the EMERGENCY alert goes
  cancelPin?: string;      // 4-digit PIN required to cancel after fire
  setupCompleted?: boolean;
}


function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        db.createObjectStore(OUTBOX_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

interface OutboxItem {
  id?: number;
  body: Record<string, unknown>;
  queuedAt: string;
  attempts: number;
}

async function outboxAdd(body: Record<string, unknown>): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, "readwrite");
    tx.objectStore(OUTBOX_STORE).add({ body, queuedAt: new Date().toISOString(), attempts: 0 } as OutboxItem);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function outboxAll(): Promise<OutboxItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, "readonly");
    const r = tx.objectStore(OUTBOX_STORE).getAll();
    r.onsuccess = () => resolve((r.result as OutboxItem[]) ?? []);
    r.onerror = () => reject(r.error);
  });
}
async function outboxDelete(id: number): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, "readwrite");
    tx.objectStore(OUTBOX_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function outboxCount(): Promise<number> {
  const items = await outboxAll();
  return items.length;
}
async function dbGet(): Promise<CaseRecord | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(KEY);
    r.onsuccess = () => resolve((r.result as CaseRecord) ?? null);
    r.onerror = () => reject(r.error);
  });
}
async function dbPut(rec: CaseRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(rec, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function b64ToBlobUrl(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
}

const CLIENT_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours — client phone is at the scene
const FAMILY_CANCEL_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours — family confirms detention
const FIRE_HOLD_MS = 4000; // 4 seconds to fire the alert

const LEGAL_EMAIL = "alerts@detenciondefensa.com";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone === true) return true;
  return window.matchMedia?.("(display-mode: standalone)").matches === true;
}

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

interface GpsFix {
  lat: number | null;
  lng: number | null;
  raw: string;
}
function getCoords(timeoutMs = 5000): Promise<GpsFix> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, raw: "(location unavailable)" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          raw: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,
        }),
      () => resolve({ lat: null, lng: null, raw: "(location unavailable)" }),
      { timeout: timeoutMs, maximumAge: 60000, enableHighAccuracy: true },
    );
  });
}

// The site is served from several domains (detenciondefensa.com, listoahora.org,
// parekounya.org). Whichever one is not the primary answers a cross-domain 307,
// and native/webview clients do not re-POST across a redirect — the alert would
// silently die. So we try the current origin first, then every known host, and
// only give up (queue offline) when all of them fail.
const ALERT_PATH = "/api/public/emergency/activate";
const ALERT_HOSTS = [
  "https://parekounya.org",
  "https://detenciondefensa.com",
  "https://listoahora.org",
];

function alertEndpoints(): string[] {
  const list: string[] = [ALERT_PATH];
  for (const host of ALERT_HOSTS) {
    if (typeof window !== "undefined" && window.location.origin === host) continue;
    list.push(host + ALERT_PATH);
  }
  return list;
}

async function postAlertOnce(
  url: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; retryable: boolean; data?: { activation_id?: string } }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
      keepalive: true,
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { activation_id?: string };
      return { ok: true, retryable: false, data };
    }
    // 4xx = the request itself is bad; retrying another host will not help.
    return { ok: false, retryable: res.status >= 500 };
  } catch {
    return { ok: false, retryable: true };
  }
}

async function postEmergency(
  body: Record<string, unknown>,
): Promise<{ activation_id?: string; queued?: boolean; delivered?: boolean }> {
  let sawPermanentFailure = false;
  for (const url of alertEndpoints()) {
    const attempt = await postAlertOnce(url, body);
    if (attempt.ok) return { ...attempt.data, delivered: true };
    if (!attempt.retryable) sawPermanentFailure = true;
  }
  if (sawPermanentFailure) return { delivered: false };
  await outboxAdd(body).catch(() => undefined);
  return { queued: true, delivered: false };
}

async function flushOutbox(): Promise<number> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return 0;
  const items = await outboxAll().catch(() => [] as OutboxItem[]);
  let sent = 0;
  for (const item of items) {
    let delivered = false;
    let permanent = false;
    for (const url of alertEndpoints()) {
      const attempt = await postAlertOnce(url, item.body);
      if (attempt.ok) {
        delivered = true;
        break;
      }
      if (!attempt.retryable) permanent = true;
    }
    if (delivered && item.id != null) {
      await outboxDelete(item.id);
      sent++;
    } else if (permanent && item.id != null) {
      // Permanent client error — drop so it doesn't retry forever.
      await outboxDelete(item.id);
    } else if (!delivered) {
      // Still unreachable — stop and try again later.
      break;
    }
  }
  return sent;
}


function EmergencyApp() {
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapAppFromToken);
  const backfill = useServerFn(backfillAppPdfs);
  const [status, setStatus] = useState<"loading" | "needs-token" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [installPrompt, setInstallPrompt] = useState<{ prompt: () => Promise<void> } | null>(null);

  // Setup form state
  const [emailInput, setEmailInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [gpsState, setGpsState] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [savingSetup, setSavingSetup] = useState(false);

  // Cancel-window state
  const [firedAt, setFiredAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [cancelled, setCancelled] = useState(false);
  const [activationId, setActivationId] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);

  // Hold-to-fire state (4-second hold on NOTIFY FAMILY button)
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStart = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setStandalone(isStandalone());
    setPlatform(detectPlatform());
    const m = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setStandalone(isStandalone());
    m?.addEventListener?.("change", onChange);
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as unknown as { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      m?.removeEventListener?.("change", onChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);


  // Offline outbox: drain on mount, on reconnect, and when app comes to foreground.
  useEffect(() => {
    const refresh = async () => setPendingCount(await outboxCount().catch(() => 0));
    const drain = async () => {
      const sent = await flushOutbox();
      if (sent > 0) setQueuedOffline(false);
      await refresh();
    };
    drain();
    const onOnline = () => { drain(); };
    const onVis = () => { if (document.visibilityState === "visible") drain(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVis);
    const id = setInterval(drain, 60_000);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(id);
    };
  }, []);

  // Bootstrap on mount.
  useEffect(() => {
    (async () => {
      try {
        const existing = await dbGet();
        if (existing) {
          let rec = existing;
          // Back-fill secondary PDFs added after this install (JS-44 cover
          // sheet, attorney referral motion, pro se brochure).
          if (rec.caseId && (!rec.js44PdfB64 || !rec.motionPdfB64 || !rec.brochurePdfB64)) {
            try {
              const extra = await backfill({ data: { caseId: rec.caseId } });
              rec = {
                ...rec,
                js44PdfB64: rec.js44PdfB64 ?? extra.js44PdfB64,
                motionPdfB64: rec.motionPdfB64 ?? extra.motionPdfB64,
                brochurePdfB64: rec.brochurePdfB64 ?? extra.brochurePdfB64,
              };
              await dbPut(rec);
            } catch { /* offline or case missing — keep existing record */ }
          }
          setRecord(rec);
          setEmailInput(rec.alertEmail || rec.contactEmail || "");
          setStatus("ready");
          return;
        }
        const url = new URL(window.location.href);
        const token = url.searchParams.get("bootstrap");
        if (!token) {
          setStatus("needs-token");
          return;
        }
        const payload: AppBootstrapPayload = await bootstrap({ data: { token } });
        const rec: CaseRecord = { ...payload, installedAt: new Date().toISOString() };
        await dbPut(rec);
        setRecord(rec);
        setEmailInput(rec.contactEmail || "");
        setStatus("ready");
        url.searchParams.delete("bootstrap");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick during the 2h window.
  useEffect(() => {
    if (firedAt == null || cancelled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [firedAt, cancelled]);

  const requestGps = useCallback(async () => {
    setGpsState("asking");
    if (!navigator.geolocation) {
      setGpsState("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setGpsState("granted"),
      () => setGpsState("denied"),
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  const saveSetup = useCallback(async () => {
    if (!record) return;
    if (!emailInput || !emailInput.includes("@")) return;
    if (!/^\d{4}$/.test(pinInput)) return;
    if (pinInput !== pinConfirm) return;
    setSavingSetup(true);
    const updated: CaseRecord = {
      ...record,
      alertEmail: emailInput.trim(),
      cancelPin: pinInput,
      setupCompleted: true,
    };
    await dbPut(updated);
    setRecord(updated);
    setSavingSetup(false);
  }, [record, emailInput, pinInput, pinConfirm]);

  // Fire the alert. Triggered after a 4-second hold on NOTIFY FAMILY.
  // Step 1: server POST — this is what actually emails/SMSes the legal inbox,
  //         the attorney and the family contacts.
  // Step 2: ONLY if step 1 could not be delivered, we open a prefilled mail
  //         draft as a last-resort manual channel. When the server accepted
  //         the alert, no draft opens — everything is already sent.
  const fireAlert = useCallback(async (rec: CaseRecord) => {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 600]);
    setFiredAt(Date.now());
    setCancelled(false);
    setPinEntry("");
    setPinError(false);

    const fix = await getCoords();
    const ts = new Date().toISOString();
    const isFamily = rec.role === "family";
    // The alert always addresses the legal inbox directly. The phone owner's
    // personal email is never a recipient — nobody should have to forward an
    // emergency. Only the family contact on file is CC'd.
    const recipient = LEGAL_EMAIL;

    // 1) Server-side fail-safe.
    const serverRes = await postEmergency({
      intake_session_id: rec.caseId,
      role: rec.role,
      full_name: rec.fullName || undefined,
      alert_email: rec.alertEmail || undefined,
      contact_email: rec.contactEmail || undefined,
      gps_lat: fix.lat ?? undefined,
      gps_lng: fix.lng ?? undefined,
      gps_raw: fix.raw,
    });
    if (serverRes.activation_id) setActivationId(serverRes.activation_id);
    if (serverRes.queued) {
      setQueuedOffline(true);
      setPendingCount(await outboxCount().catch(() => 0));
    }

    // Server accepted the alert — all notifications already went out. Do not
    // open a mail draft; it only confuses the user into thinking nothing sent.
    if (serverRes.delivered) return;

    // 2) Mailto from user's phone — last-resort manual channel.
    const roleTag = isFamily ? "FAMILY" : "CLIENT";

    const windowLabel = isFamily
      ? "12-HOUR confirmation window (family-triggered — wait before locating)"
      : "2-HOUR window (client-triggered — at-scene alert)";
    const subject = `EMERGENCY [${roleTag}] — ${rec.fullName} — Case ${rec.caseId.slice(0, 12)}`;
    const mapsLink =
      fix.lat != null && fix.lng != null ? `https://maps.google.com/?q=${fix.lat},${fix.lng}` : "(unavailable)";
    const body = [
      `EMERGENCY ALERT — Triggered from ${isFamily ? "FAMILY CONTACT PHONE" : "CLIENT PHONE"}.`,
      `Response window: ${windowLabel}.`,
      "",
      `Detainee/Client name: ${rec.fullName}`,
      `Case ID: ${rec.caseId}`,
      `Time (UTC): ${ts}`,
      `GPS of triggering phone: ${fix.raw}`,
      `Maps: ${mapsLink}`,
      "",
      `Family contact on file: ${rec.contactName} <${rec.contactEmail}>`,
      "",
      "Court packet (AO 242 Habeas, AO 240 IFP, JS-44 Civil Cover Sheet, Motion for Volunteer Attorney) is on file — secure download links were emailed separately to alerts@detenciondefensa.com.",
      isFamily
        ? "ACTION: Wait the 12-hour cancel window. If not cancelled, begin locating, notify contacts, prepare packet."
        : "ACTION: Wait the 2-hour cancel window. If not cancelled, begin locating, notify contacts, prepare packet.",
    ].join("\n");
    const ccList = [rec.contactEmail]
      .map((e) => e?.trim())
      .filter((e): e is string => !!e && e.toLowerCase() !== LEGAL_EMAIL);
    const cc = ccList.length ? `&cc=${encodeURIComponent([...new Set(ccList)].join(","))}` : "";
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }, []);

  const sendCancellation = useCallback(async (rec: CaseRecord) => {
    setCancelled(true);
    await postEmergency({
      intake_session_id: rec.caseId,
      role: rec.role,
      full_name: rec.fullName || undefined,
      alert_email: rec.alertEmail || undefined,
      contact_email: rec.contactEmail || undefined,
      cancel_of: activationId || undefined,
    });
  }, [activationId]);

  const tryPinCancel = useCallback(
    (rec: CaseRecord, entered: string) => {
      if (rec.cancelPin && entered === rec.cancelPin) {
        setPinError(false);
        sendCancellation(rec);
      } else {
        setPinError(true);
        if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
      }
    },
    [sendCancellation],
  );

  const holdRelease = useCallback(() => {
    setHolding(false);
    setHoldProgress(0);
    holdStart.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

  const startFireHold = useCallback(
    (rec: CaseRecord) => {
      if (holding) return;
      setHolding(true);
      holdStart.current = performance.now();
      if (navigator.vibrate) navigator.vibrate(30);
      const tick = () => {
        if (holdStart.current == null) return;
        const elapsed = performance.now() - holdStart.current;
        const p = Math.min(elapsed / FIRE_HOLD_MS, 1);
        setHoldProgress(p);
        if (p >= 1) {
          holdRelease();
          fireAlert(rec);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [holding, holdRelease, fireAlert],
  );

  // ---- UI states ----
  if (status === "loading") {
    return <Shell><p className="text-white/80">Loading…</p></Shell>;
  }

  if (status === "needs-token") {
    return (
      <Shell>
        <div className="max-w-md text-center text-white">
          <h1 className="text-3xl font-black tracking-tight">Emergency App</h1>
          <p className="mt-4 text-white/80">
            Open the install link from the email we sent you on this phone.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-8 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold"
          >
            Back to site
          </button>
        </div>
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <div className="max-w-md text-center text-white">
          <h1 className="text-2xl font-bold">We couldn't activate this app</h1>
          <p className="mt-3 text-white/80">{errorMsg}</p>
        </div>
      </Shell>
    );
  }

  if (!record) return null;

  // ---- Install gate ----
  if (!standalone) {
    return (
      <Shell>
        <div className="w-full max-w-md text-white">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">DetencionDefensa</p>
            <h1 className="mt-2 text-2xl font-black">Step 1 — Install the app</h1>
            <p className="mt-3 text-sm text-white/70">
              Put the red <strong>NOTIFY FAMILY</strong> icon on your home screen so it's always one
              tap away.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed">
            {platform === "ios" && (
              <>
                <p className="font-semibold text-white">iPhone (Safari):</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/85">
                  <li>Tap the <strong>Share</strong> icon at the bottom.</li>
                  <li>Tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong>. Open the red <strong>NOTIFY FAMILY</strong> icon from your home screen.</li>
                </ol>
              </>
            )}
            {platform === "android" && (
              <>
                <p className="font-semibold text-white">Android (Chrome):</p>
                {installPrompt && (
                  <button
                    onClick={async () => {
                      try { await installPrompt.prompt(); } catch { /* user dismissed */ }
                      setInstallPrompt(null);
                    }}
                    className="mt-3 w-full rounded-xl bg-red-600 px-5 py-3 text-base font-bold text-white shadow hover:bg-red-700"
                  >
                    📲 Install NOTIFY FAMILY app (one tap)
                  </button>
                )}
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/85">
                  {installPrompt ? (
                    <li>Tap the red button above, then tap <strong>Install</strong>.</li>
                  ) : (
                    <>
                      <li>Tap the <strong>⋮</strong> menu (top right).</li>
                      <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                    </>
                  )}
                  <li>Open the red <strong>NOTIFY FAMILY</strong> icon from your home screen.</li>
                </ol>
              </>
            )}
            {platform === "other" && (
              <p className="text-white/85">
                Open this link on your phone, then use <strong>Add to Home Screen</strong> (iPhone)
                or <strong>Install app</strong> (Android).
              </p>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ---- One-time setup gate ----
  if (!record.setupCompleted) {
    const emailValid = emailInput.includes("@") && emailInput.length > 4;
    const pinValid = /^\d{4}$/.test(pinInput);
    const pinMatches = pinInput.length > 0 && pinInput === pinConfirm;
    const canSave = emailValid && gpsState === "granted" && pinValid && pinMatches;
    return (
      <Shell>
        <div className="w-full max-w-md text-white">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Step 2 — Set up</p>
            <h1 className="mt-2 text-2xl font-black">Three quick things</h1>
            <p className="mt-2 text-sm text-white/70">
              Do this once now, in a safe place. Then NOTIFY FAMILY will fire after a 4-second hold — no
              questions, no permission pop-ups.
            </p>
          </header>

          {/* Email */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-base font-bold text-white">1. Where should the alert go?</p>
            <p className="mt-1 text-xs text-white/60">
              Your lawyer or family contact. We'll auto-send to alerts@detenciondefensa.com too.
            </p>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              inputMode="email"
              className="mt-3 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-red-400 focus:outline-none"
            />
          </div>

          {/* GPS */}
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-base font-bold text-white">2. Allow location</p>
            <p className="mt-1 text-xs text-white/60">
              So we can find you fast if you press NOTIFY FAMILY.
            </p>
            {gpsState === "granted" ? (
              <p className="mt-3 rounded-lg bg-green-600/20 px-4 py-3 text-sm font-semibold text-green-300">
                ✓ Location allowed
              </p>
            ) : gpsState === "denied" ? (
              <>
                <p className="mt-3 rounded-lg bg-yellow-600/20 px-4 py-3 text-sm text-yellow-200">
                  Location blocked. Open phone Settings → this app → Location → Allow, then come back.
                </p>
                <button
                  onClick={requestGps}
                  className="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold"
                >
                  Try again
                </button>
              </>
            ) : (
              <button
                onClick={requestGps}
                disabled={gpsState === "asking"}
                className="mt-3 w-full rounded-xl bg-red-600 px-4 py-3 text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-60"
              >
                {gpsState === "asking" ? "Asking…" : "Allow location"}
              </button>
            )}
          </div>

          {/* PIN */}
          <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-base font-bold text-white">3. Pick a 4-digit cancel PIN</p>
            <p className="mt-1 text-xs text-white/60">
              This is the ONLY way to cancel an alert. Memorize it. Don't write it on your phone.
            </p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="• • • •"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className="mt-3 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.6em] text-white placeholder:text-white/30 focus:border-red-400 focus:outline-none"
            />
            <input
              type="password"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="confirm PIN"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              className="mt-2 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.6em] text-white placeholder:text-white/30 focus:border-red-400 focus:outline-none"
            />
            {pinInput.length > 0 && pinConfirm.length === 4 && pinInput !== pinConfirm && (
              <p className="mt-2 text-xs text-yellow-300">PINs don't match.</p>
            )}
          </div>

          <button
            onClick={saveSetup}
            disabled={!canSave || savingSetup}
            className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-base font-black uppercase tracking-wider text-red-700 disabled:opacity-40"
          >
            {savingSetup ? "Saving…" : "Done — show NOTIFY FAMILY button"}
          </button>

          <p className="mt-4 text-center text-xs text-white/60">
            By tapping Done, you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener" className="underline hover:text-white">
              Terms
            </a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="underline hover:text-white">
              Privacy Policy
            </a>
            . This app sends documents to contacts you choose. It does not contact 911 or any emergency service.
          </p>
        </div>
      </Shell>
    );
  }

  // ---- Post-fire PIN-locked cancel screen ----
  if (firedAt != null) {
    const isFamily = record.role === "family";
    const cancelWindowMs = isFamily ? FAMILY_CANCEL_WINDOW_MS : CLIENT_CANCEL_WINDOW_MS;
    const windowHours = isFamily ? 12 : 2;
    const elapsed = now - firedAt;
    const remainingMs = Math.max(0, cancelWindowMs - elapsed);
    const hh = Math.floor(remainingMs / 3600000);
    const mm = Math.floor((remainingMs % 3600000) / 60000);
    const ss = Math.floor((remainingMs % 60000) / 1000);
    const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    const expired = remainingMs <= 0;

    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-red-700 px-6 text-white"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/80">
          {cancelled ? "Cancelled" : expired ? "Response activated" : "ALERT SENT"}
        </p>
        <div
          className="mt-4 rounded-3xl bg-black/30 px-8 py-5 font-mono text-5xl font-black tabular-nums"
          aria-live="polite"
        >
          {clock}
        </div>
        {queuedOffline && pendingCount > 0 && !cancelled && (
          <p className="mt-3 max-w-xs rounded-lg bg-black/30 px-3 py-2 text-center text-xs">
            No signal — alert saved on this phone and will send the moment you're back online.
          </p>
        )}

        {cancelled ? (
          <p className="mt-6 max-w-xs text-center text-base font-semibold">
            Cancellation sent. Your team has been notified it was a false alarm.
          </p>
        ) : expired ? (
          <p className="mt-6 max-w-xs text-center text-base font-semibold">
            {windowHours} hours passed without the cancel PIN. Your team is locating, notifying contacts, and preparing the packet.
          </p>
        ) : (
          <>
            <h1 className="mt-8 text-3xl font-black tracking-tight text-center">
              Enter PIN to cancel
            </h1>
            <p className="mt-2 max-w-xs text-center text-sm text-white/85">
              The only way to stop this alert is your 4-digit PIN. If you don't enter it within
              {" "}{windowHours} hours, the response begins automatically.
            </p>
            <input
              type="password"
              value={pinEntry}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPinEntry(v);
                setPinError(false);
                if (v.length === 4) tryPinCancel(record, v);
              }}
              placeholder="• • • •"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              autoFocus
              className="mt-6 w-56 rounded-2xl border-2 border-white/40 bg-black/30 px-4 py-5 text-center text-4xl tracking-[0.6em] text-white placeholder:text-white/40 focus:border-white focus:outline-none"
            />
            {pinError && (
              <p className="mt-3 text-sm font-semibold text-yellow-200">
                Wrong PIN. Try again.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // ---- Main NOTIFY FAMILY button — 4-second hold to fire ----
  const holdPct = Math.round(holdProgress * 100);
  const holdRemaining = Math.max(
    0,
    Math.ceil(FIRE_HOLD_MS / 1000 - (holdProgress * FIRE_HOLD_MS) / 1000),
  );

  return (
    <Shell>
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-between py-6 text-white">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">DetencionDefensa</p>
          <h1 className="mt-1 text-xl font-bold">{record.fullName}</h1>
          <p className="text-xs text-white/50">
            {record.role === "family" ? "Family contact phone — Ready" : "Client phone — Ready"}
          </p>
        </header>

        <div className="my-8 flex flex-col items-center">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); startFireHold(record); }}
            onPointerUp={holdRelease}
            onPointerLeave={holdRelease}
            onPointerCancel={holdRelease}
            onContextMenu={(e) => e.preventDefault()}
            className="relative flex h-72 w-72 select-none items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-800 shadow-[0_30px_60px_-15px_rgba(220,38,38,0.7)] active:scale-95 transition-transform"
            style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              <circle
                cx="50" cy="50" r="46"
                fill="none" stroke="#ffffff" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
                strokeLinecap="round"
                style={{ transition: holding ? "none" : "stroke-dashoffset 0.3s" }}
              />
            </svg>
            <div className="text-center px-4">
              {holding ? (
                <div className="text-7xl font-black tracking-tight text-white">{holdRemaining}</div>
              ) : (
                <>
                  <div className="text-3xl font-black leading-tight tracking-tight text-white">
                    NOTIFY<br />FAMILY
                  </div>
                  <div className="mt-1 text-[11px] font-semibold leading-tight text-white/80">
                    Avisar a Familia<br />Avize Fanmi
                  </div>
                </>
              )}
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/85">
                {holding ? `hold ${holdPct}%` : "hold 4 sec to fire"}
              </div>
            </div>
          </button>
          <p className="mt-6 max-w-xs text-center text-xs text-white/60">
            Hold for 4 seconds to send name, GPS, case ID and the full court packet to
            {" "}<strong>alerts@detenciondefensa.com</strong> and your emergency contact. You'll
            then need your 4-digit PIN to cancel within {record.role === "family" ? "12" : "2"} hours.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <button
            onClick={() => window.open(b64ToBlobUrl(record.habeasPdfB64), "_blank")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
          >
            AO 242 Habeas
          </button>
          <button
            onClick={() => window.open(b64ToBlobUrl(record.ifpPdfB64), "_blank")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
          >
            AO 240 IFP
          </button>
          {record.js44PdfB64 ? (
            <button
              onClick={() => window.open(b64ToBlobUrl(record.js44PdfB64!), "_blank")}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
            >
              JS-44 Cover Sheet
            </button>
          ) : null}
          {record.motionPdfB64 ? (
            <button
              onClick={() => window.open(b64ToBlobUrl(record.motionPdfB64!), "_blank")}
              className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
            >
              Attorney Referral
            </button>
          ) : null}
          {record.brochurePdfB64 ? (
            <button
              onClick={() => window.open(b64ToBlobUrl(record.brochurePdfB64!), "_blank")}
              className="col-span-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
            >
              SDFL Pro Se Guidebook
            </button>
          ) : null}
        </div>

        <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
            Self-Help Library
          </p>
          <div className="grid grid-cols-1 gap-2">
            {SELF_HELP_LIBRARY.map((d) => {
              const lang = (record.language === "es" || record.language === "ht" || record.language === "en"
                ? record.language : "es") as "es" | "ht" | "en";
              return (
                <a
                  key={d.key}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                >
                  {d.title[lang]}
                </a>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-white/40">
            Public links — never expire. Stored on your device for offline reference.
          </p>
        </div>

        <p className="mt-3 text-[11px] text-white/40">
          Alerts go to <strong>{record.alertEmail}</strong>. PDFs are stored only on this phone.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0b1220] px-5"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {children}
    </div>
  );
}
