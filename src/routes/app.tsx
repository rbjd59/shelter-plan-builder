import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { bootstrapAppFromToken, type AppBootstrapPayload } from "@/lib/app-install.functions";
import { backfillAppPdfs } from "@/lib/app-backfill.functions";

export const Route = createFileRoute("/app")({
  component: EmergencyApp,
  head: () => ({
    meta: [
      { title: "HELP NOW — DetencionDefensa" },
      { name: "theme-color", content: "#dc2626" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "HELP NOW" },
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
const CANCEL_HOLD_MS = 15000; // 15 seconds to cancel

const LEGAL_EMAIL = "legal@detenciondefensa.com";

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

async function postEmergency(
  body: Record<string, unknown>,
): Promise<{ activation_id?: string; queued?: boolean }> {
  try {
    const res = await fetch("/api/public/emergency/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (!res.ok) {
      // 5xx — server reachable but failing. Queue for retry.
      if (res.status >= 500) {
        await outboxAdd(body).catch(() => undefined);
        return { queued: true };
      }
      return {};
    }
    return (await res.json()) as { activation_id?: string };
  } catch {
    // Network failure (offline, DNS, TLS). Queue for retry.
    await outboxAdd(body).catch(() => undefined);
    return { queued: true };
  }
}

async function flushOutbox(): Promise<number> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return 0;
  const items = await outboxAll().catch(() => [] as OutboxItem[]);
  let sent = 0;
  for (const item of items) {
    try {
      const res = await fetch("/api/public/emergency/activate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item.body),
      });
      if (res.ok && item.id != null) {
        await outboxDelete(item.id);
        sent++;
      } else if (!res.ok && res.status < 500 && item.id != null) {
        // Permanent client error — drop so it doesn't retry forever.
        await outboxDelete(item.id);
      }
    } catch {
      // Still offline — stop and try again later.
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

  // Setup form state
  const [emailInput, setEmailInput] = useState("");
  const [gpsState, setGpsState] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [savingSetup, setSavingSetup] = useState(false);

  // Cancel-window state
  const [firedAt, setFiredAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [cancelled, setCancelled] = useState(false);
  const [activationId, setActivationId] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Cancel-hold state (15-second hold while in cancel window)
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
    return () => m?.removeEventListener?.("change", onChange);
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
    setSavingSetup(true);
    const updated: CaseRecord = {
      ...record,
      alertEmail: emailInput.trim(),
      setupCompleted: true,
    };
    await dbPut(updated);
    setRecord(updated);
    setSavingSetup(false);
  }, [record, emailInput]);

  // Fire the alert. Single tap — no hold required.
  // Step 1: server POST (fail-safe — sent through our verified domain, not the user's mail app).
  // Step 2: open mailto from the user's phone (redundant — also reaches us via their mail).
  const fireAlert = useCallback(async (rec: CaseRecord) => {
    if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 600]);
    setFiredAt(Date.now());
    setCancelled(false);

    const fix = await getCoords();
    const ts = new Date().toISOString();
    const isFamily = rec.role === "family";
    const recipient = rec.alertEmail || LEGAL_EMAIL;

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

    // 2) Mailto from user's phone — second channel.
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
      "AO 242 Habeas + AO 240 IFP for this case are already on file.",
      isFamily
        ? "ACTION: Wait the 12-hour cancel window. If not cancelled, begin locating, notify contacts, prepare packet."
        : "ACTION: Wait the 2-hour cancel window. If not cancelled, begin locating, notify contacts, prepare packet.",
    ].join("\n");
    const cc = rec.contactEmail ? `&cc=${encodeURIComponent(rec.contactEmail)}` : "";
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
    const roleTag = rec.role === "family" ? "FAMILY" : "CLIENT";
    const subject = `CANCEL EMERGENCY [${roleTag}] — ${rec.fullName} — Case ${rec.caseId.slice(0, 12)}`;
    const body = [
      `FALSE ALARM — please disregard the previous emergency alert (triggered from ${rec.role === "family" ? "family contact phone" : "client phone"}).`,
      "",
      `Name: ${rec.fullName}`,
      `Case ID: ${rec.caseId}`,
      `Cancelled at (UTC): ${new Date().toISOString()}`,
    ].join("\n");
    const cc = rec.contactEmail ? `&cc=${encodeURIComponent(rec.contactEmail)}` : "";
    const recipient = rec.alertEmail || LEGAL_EMAIL;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }, [activationId]);

  const cancelHoldRelease = useCallback(() => {
    setHolding(false);
    setHoldProgress(0);
    holdStart.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

  const startCancelHold = useCallback((rec: CaseRecord) => {
    if (holding) return;
    setHolding(true);
    holdStart.current = performance.now();
    if (navigator.vibrate) navigator.vibrate(30);
    const tick = () => {
      if (holdStart.current == null) return;
      const elapsed = performance.now() - holdStart.current;
      const p = Math.min(elapsed / CANCEL_HOLD_MS, 1);
      setHoldProgress(p);
      if (p >= 1) {
        cancelHoldRelease();
        sendCancellation(rec);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [holding, cancelHoldRelease, sendCancellation]);

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
              Put the red <strong>HELP NOW</strong> icon on your home screen so it's always one
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
                  <li>Tap <strong>Add</strong>. Open the red <strong>HELP NOW</strong> icon from your home screen.</li>
                </ol>
              </>
            )}
            {platform === "android" && (
              <>
                <p className="font-semibold text-white">Android (Chrome):</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/85">
                  <li>Tap the <strong>⋮</strong> menu (top right).</li>
                  <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Open the red <strong>HELP NOW</strong> icon from your home screen.</li>
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
    const canSave = emailValid && gpsState === "granted";
    return (
      <Shell>
        <div className="w-full max-w-md text-white">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Step 2 — Set up</p>
            <h1 className="mt-2 text-2xl font-black">Two quick things</h1>
            <p className="mt-2 text-sm text-white/70">
              Do this once now, in a safe place. The HELP button will work instantly later — no
              questions, no permission pop-ups.
            </p>
          </header>

          {/* Email */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5">
            <p className="text-base font-bold text-white">1. Where should the alert go?</p>
            <p className="mt-1 text-xs text-white/60">
              Your lawyer or family contact. We'll auto-send to your legal team too.
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
              So we can find you fast if you press HELP.
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

          <button
            onClick={saveSetup}
            disabled={!canSave || savingSetup}
            className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-base font-black uppercase tracking-wider text-red-700 disabled:opacity-40"
          >
            {savingSetup ? "Saving…" : "Done — show HELP button"}
          </button>
        </div>
      </Shell>
    );
  }

  // ---- Post-fire cancel window with 15s hold-to-cancel ----
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
    const holdPct = Math.round(holdProgress * 100);
    const holdRemaining = Math.max(0, Math.ceil(CANCEL_HOLD_MS / 1000 - (holdProgress * CANCEL_HOLD_MS) / 1000));

    return (
      <Shell>
        <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {cancelled ? "Cancelled" : expired ? "Response activated" : `Alert sent (${isFamily ? "family" : "client"})`}
          </p>
          <div
            className="mt-5 rounded-3xl bg-black/60 px-8 py-6 font-mono text-6xl font-black tabular-nums shadow-[inset_0_0_40px_rgba(220,38,38,0.4)]"
            style={{
              color: cancelled ? "#9ca3af" : expired ? "#f87171" : "#fca5a5",
              textShadow: cancelled ? "none" : "0 0 24px rgba(220,38,38,0.6)",
            }}
            aria-live="polite"
          >
            {clock}
          </div>
          {queuedOffline && pendingCount > 0 && !cancelled && (
            <p className="mt-3 max-w-xs rounded-lg bg-yellow-500/15 px-3 py-2 text-center text-xs text-yellow-200">
              No signal — alert saved on this phone and will send the moment you're back online.
              Mailto was also opened as a backup.
            </p>
          )}
          <p className="mt-4 max-w-xs text-center text-sm text-white/80">
            {cancelled
              ? "Cancellation sent. Your team has been notified it was a false alarm."
              : expired
                ? `${windowHours} hours passed without cancellation. Your team is locating, notifying contacts, and preparing the packet.`
                : `False alarm? Press AND HOLD the button below for 15 seconds to cancel. Otherwise, in ${windowHours} hours we begin locating, notifying contacts, and preparing the packet to mail.`}
          </p>

          {!cancelled && !expired && (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); startCancelHold(record); }}
              onPointerUp={cancelHoldRelease}
              onPointerLeave={cancelHoldRelease}
              onPointerCancel={cancelHoldRelease}
              onContextMenu={(e) => e.preventDefault()}
              className="relative mt-8 flex h-56 w-56 select-none items-center justify-center rounded-full bg-gradient-to-b from-slate-200 to-slate-400 text-red-700 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] active:scale-95 transition-transform"
              style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
            >
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="46"
                  fill="none" stroke="#dc2626" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
                  strokeLinecap="round"
                  style={{ transition: holding ? "none" : "stroke-dashoffset 0.3s" }}
                />
              </svg>
              <div className="text-center">
                <div className="text-4xl font-black tracking-tight">
                  {holding ? holdRemaining : "CANCEL"}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest opacity-70">
                  {holding ? `hold ${holdPct}%` : "hold 15 sec"}
                </div>
              </div>
            </button>
          )}
        </div>
      </Shell>
    );
  }

  // ---- Main HELP button — single tap fires ----
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
            onClick={() => fireAlert(record)}
            className="flex h-72 w-72 select-none items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-800 shadow-[0_30px_60px_-15px_rgba(220,38,38,0.7)] active:scale-95 transition-transform"
            style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
          >
            <div className="text-center">
              <div className="text-6xl font-black tracking-tight text-white">HELP</div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/85">
                {record.role === "family" ? "tap if detention confirmed" : "tap if in danger"}
              </div>
            </div>
          </button>
          <p className="mt-6 max-w-xs text-center text-xs text-white/60">
            One tap sends name, GPS, case ID and emergency contact. You'll have
            <strong> {record.role === "family" ? "12 hours" : "2 hours"} </strong>
            to cancel by holding the button for 15 seconds.
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
