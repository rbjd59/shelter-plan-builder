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

const HOLD_MS = 15000;

function EmergencyApp() {
  const navigate = useNavigate();
  const bootstrap = useServerFn(bootstrapAppFromToken);
  const [status, setStatus] = useState<"loading" | "needs-token" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [record, setRecord] = useState<CaseRecord | null>(null);

  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [armed, setArmed] = useState(false);
  const holdStart = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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
        // strip token from url
        url.searchParams.delete("bootstrap");
        window.history.replaceState({}, "", url.pathname + url.search);
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelHold = useCallback(() => {
    setHolding(false);
    setArmed(false);
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
    window.location.href = mailto;
    cancelHold();
  }, [cancelHold]);

  const startHold = useCallback(() => {
    if (!record || holding) return;
    setHolding(true);
    setArmed(false);
    holdStart.current = performance.now();
    if (navigator.vibrate) navigator.vibrate(50);
    const tick = () => {
      if (holdStart.current == null) return;
      const elapsed = performance.now() - holdStart.current;
      const p = Math.min(elapsed / HOLD_MS, 1);
      setProgress(p);
      if (p >= 1) {
        setArmed(true);
        fireEmergency(record);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [record, holding, fireEmergency]);

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
            Open the install link from the email we sent you on this phone, then tap{" "}
            <strong>Add to Home Screen</strong>.
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
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="4"
              />
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
                {armed ? "SENT" : holding ? remaining : "HELP"}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                {armed ? "alert sent" : holding ? `hold ${pct}%` : "hold 15 sec"}
              </div>
            </div>
          </button>
          <p className="mt-6 max-w-xs text-center text-xs text-white/60">
            Press and hold for 15 seconds. Release to cancel. When the timer reaches zero we open
            your email app pre-addressed to <strong>legal@detenciondefensa.com</strong> with your
            case ID, GPS location, and emergency contact.
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
