import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { bootstrapAppFromToken, type AppBootstrapPayload } from "@/lib/app-install.functions";

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
const KEY = "v1";

interface CaseRecord {
  habeasPdfB64: string;
  ifpPdfB64: string;
  caseId: string;
  fullName: string;
  contactName: string;
  contactEmail: string;
  language: string;
  installedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
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

const HOLD_MS = 7000; // 7 seconds to arm
const CANCEL_WINDOW_MS = 60 * 60 * 1000; // 60 minutes to cancel after firing

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone === true) return true;
  // Android / desktop PWAs
  return window.matchMedia?.("(display-mode: standalone)").matches === true;
}

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function EmergencyApp() {
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapAppFromToken);
  const [status, setStatus] = useState<"loading" | "needs-token" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [standalone, setStandalone] = useState<boolean>(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  // Hold-to-arm state.
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const holdStart = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Post-fire cancellation countdown state.
  const [firedAt, setFiredAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setPlatform(detectPlatform());
    const m = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => setStandalone(isStandalone());
    m?.addEventListener?.("change", onChange);
    return () => m?.removeEventListener?.("change", onChange);
  }, []);

  // Bootstrap on mount.
  useEffect(() => {
    (async () => {
      try {
        const existing = await dbGet();
        if (existing) {
          setRecord(existing);
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

  // Tick once a second when the cancel window is active.
  useEffect(() => {
    if (firedAt == null || cancelled) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [firedAt, cancelled]);

  const cancelHold = useCallback(() => {
    setHolding(false);
    setProgress(0);
    holdStart.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (navigator.vibrate) navigator.vibrate(0);
  }, []);

  const fireEmergency = useCallback(async (rec: CaseRecord) => {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    let coords = "";
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000, maximumAge: 60000 }),
      );
      coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    } catch {
      coords = "(location unavailable)";
    }
    const ts = new Date().toISOString();
    const subject = `EMERGENCY — ${rec.fullName} — Case ${rec.caseId.slice(0, 12)}`;
    const bodyLines = [
      "EMERGENCY ALERT — DetencionDefensa client needs immediate help.",
      "",
      `Name: ${rec.fullName}`,
      `Case ID: ${rec.caseId}`,
      `Time (UTC): ${ts}`,
      `GPS: ${coords}`,
      `Maps: https://maps.google.com/?q=${encodeURIComponent(coords)}`,
      "",
      `Emergency contact: ${rec.contactName} <${rec.contactEmail}>`,
      "",
      "AO 242 Habeas + AO 240 IFP for this case are already on file.",
      "Please activate the response protocol immediately.",
    ];
    const body = bodyLines.join("\n");
    const cc = rec.contactEmail ? `&cc=${encodeURIComponent(rec.contactEmail)}` : "";
    const mailto = `mailto:legal@detenciondefensa.com?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(body)}`;
    setFiredAt(Date.now());
    setCancelled(false);
    cancelHold();
    // Open the user's mail app to send. Returning here keeps our /app screen
    // mounted so the cancel countdown is visible when they come back.
    window.location.href = mailto;
  }, [cancelHold]);

  const sendCancellation = useCallback(async (rec: CaseRecord) => {
    setCancelled(true);
    const subject = `CANCEL EMERGENCY — ${rec.fullName} — Case ${rec.caseId.slice(0, 12)}`;
    const body = [
      "FALSE ALARM — please disregard the previous emergency alert.",
      "",
      `Name: ${rec.fullName}`,
      `Case ID: ${rec.caseId}`,
      `Cancelled at (UTC): ${new Date().toISOString()}`,
      "",
      "The HELP button was triggered by mistake. No emergency response is needed.",
    ].join("\n");
    const cc = rec.contactEmail ? `&cc=${encodeURIComponent(rec.contactEmail)}` : "";
    const mailto = `mailto:legal@detenciondefensa.com?subject=${encodeURIComponent(subject)}${cc}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }, []);

  const startHold = useCallback(() => {
    if (!record || holding || firedAt != null) return;
    setHolding(true);
    holdStart.current = performance.now();
    if (navigator.vibrate) navigator.vibrate(50);
    const tick = () => {
      if (holdStart.current == null) return;
      const elapsed = performance.now() - holdStart.current;
      const p = Math.min(elapsed / HOLD_MS, 1);
      setProgress(p);
      if (p >= 1) {
        fireEmergency(record);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [record, holding, firedAt, fireEmergency]);

  // ---- UI ----
  if (status === "loading") {
    return (
      <Shell>
        <p className="text-white/80">Loading…</p>
      </Shell>
    );
  }

  if (status === "needs-token") {
    return (
      <Shell>
        <div className="max-w-md text-center text-white">
          <h1 className="text-3xl font-black tracking-tight">Emergency App</h1>
          <p className="mt-4 text-white/80">
            Open the install link from the email we sent you on this phone, then follow the
            install steps below.
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
  // If the page is open inside a regular browser (not the standalone PWA),
  // show clear "Add to Home Screen" instructions instead of the HELP button.
  if (!standalone) {
    return (
      <Shell>
        <div className="w-full max-w-md text-white">
          <header className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">DetencionDefensa</p>
            <h1 className="mt-2 text-2xl font-black">Install the HELP NOW button</h1>
            <p className="mt-3 text-sm text-white/70">
              This needs to live on your home screen as a small app icon — that way it's always
              one tap away and doesn't take over your phone like a web page.
            </p>
          </header>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed">
            {platform === "ios" && (
              <>
                <p className="font-semibold text-white">On iPhone (Safari):</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/85">
                  <li>
                    Tap the <strong>Share</strong> icon at the bottom (square with an arrow up).
                  </li>
                  <li>
                    Scroll and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong>. A red <strong>HELP NOW</strong> icon appears on
                    your home screen.
                  </li>
                  <li>Open it from the home screen — not from Safari.</li>
                </ol>
              </>
            )}
            {platform === "android" && (
              <>
                <p className="font-semibold text-white">On Android (Chrome):</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/85">
                  <li>
                    Tap the <strong>⋮</strong> menu (top right of Chrome).
                  </li>
                  <li>
                    Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </li>
                  <li>
                    Confirm <strong>Install</strong>. A red <strong>HELP NOW</strong> icon
                    appears on your home screen.
                  </li>
                  <li>Open it from the home screen — not from Chrome.</li>
                </ol>
              </>
            )}
            {platform === "other" && (
              <>
                <p className="font-semibold text-white">Install on your phone:</p>
                <p className="mt-3 text-white/85">
                  Open this same link on your iPhone or Android phone, then use{" "}
                  <strong>Add to Home Screen</strong> (iPhone Safari) or{" "}
                  <strong>Install app</strong> (Android Chrome) so the HELP button lives on your
                  home screen as an icon.
                </p>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-white/50">
            Once installed, your phone keeps working normally. The HELP button just sits there
            waiting until you need it.
          </p>
        </div>
      </Shell>
    );
  }

  // ---- Post-fire 60-minute cancel countdown ----
  if (firedAt != null) {
    const elapsed = now - firedAt;
    const remainingMs = Math.max(0, CANCEL_WINDOW_MS - elapsed);
    const mm = Math.floor(remainingMs / 60000);
    const ss = Math.floor((remainingMs % 60000) / 1000);
    const clock = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
    const expired = remainingMs <= 0;

    return (
      <Shell>
        <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center py-6 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            {cancelled ? "Cancelled" : expired ? "Alert sent" : "Alert sent — cancel window"}
          </p>
          <div
            className="mt-6 rounded-3xl bg-black/60 px-10 py-8 font-mono text-7xl font-black tracking-widest tabular-nums shadow-[inset_0_0_40px_rgba(220,38,38,0.4)]"
            style={{
              color: cancelled ? "#9ca3af" : expired ? "#f87171" : "#fca5a5",
              textShadow: cancelled ? "none" : "0 0 24px rgba(220,38,38,0.6)",
            }}
            aria-live="polite"
          >
            {clock}
          </div>
          <p className="mt-6 max-w-xs text-center text-sm text-white/80">
            {cancelled
              ? "Cancellation sent to your legal team. You can close this app."
              : expired
                ? "Cancel window closed. Your legal team is responding."
                : "Your emergency alert was sent. If this was NOT a real detention emergency, tap CANCEL within 60 minutes to notify your legal team it was a false alarm."}
          </p>

          {!cancelled && !expired && (
            <button
              onClick={() => sendCancellation(record)}
              className="mt-8 w-full max-w-xs rounded-2xl bg-white px-6 py-4 text-base font-bold uppercase tracking-wider text-red-700 shadow-lg active:scale-95 transition-transform"
            >
              Cancel — false alarm
            </button>
          )}

          <button
            onClick={() => {
              setFiredAt(null);
              setCancelled(false);
            }}
            className="mt-4 text-xs uppercase tracking-widest text-white/50 underline"
          >
            Back to HELP button
          </button>
        </div>
      </Shell>
    );
  }

  // ---- Normal HELP button ----
  const pct = Math.round(progress * 100);
  const remaining = Math.max(0, Math.ceil(HOLD_MS / 1000 - (progress * HOLD_MS) / 1000));

  return (
    <Shell>
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-between py-6 text-white">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">DetencionDefensa</p>
          <h1 className="mt-1 text-xl font-bold">{record.fullName}</h1>
          <p className="text-xs text-white/50">Case {record.caseId.slice(0, 12)}…</p>
        </header>

        <div className="relative my-8 flex flex-col items-center">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              startHold();
            }}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onContextMenu={(e) => e.preventDefault()}
            className="relative flex h-72 w-72 select-none items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-800 shadow-[0_30px_60px_-15px_rgba(220,38,38,0.7)] active:scale-95 transition-transform"
            style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 46}`}
                strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
                strokeLinecap="round"
                style={{ transition: holding ? "none" : "stroke-dashoffset 0.3s" }}
              />
            </svg>
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight">
                {holding ? remaining : "HELP"}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                {holding ? `hold ${pct}%` : "hold 7 sec"}
              </div>
            </div>
          </button>
          <p className="mt-6 max-w-xs text-center text-xs text-white/60">
            Press and hold for 7 seconds. Release to cancel. When the timer reaches zero we open
            your email app pre-addressed to <strong>legal@detenciondefensa.com</strong> with your
            case ID, GPS location, and emergency contact — then a 60-minute cancel window
            appears in case it was an accident.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <button
            onClick={() => window.open(b64ToBlobUrl(record.habeasPdfB64), "_blank")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
          >
            View AO 242 Habeas
          </button>
          <button
            onClick={() => window.open(b64ToBlobUrl(record.ifpPdfB64), "_blank")}
            className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur hover:bg-white/15"
          >
            View AO 240 IFP
          </button>
        </div>
        <p className="mt-4 text-[11px] text-white/40">
          PDFs are stored only on this phone. They are never sent through our servers.
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
