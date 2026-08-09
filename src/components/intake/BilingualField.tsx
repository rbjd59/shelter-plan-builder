// Single bilingual form row: native-language input on the left, live
// English translation on the right, with a per-field "Approve translation"
// checkbox. Used by the intake when the user's chosen language ≠ English.

import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { translateFields } from "@/lib/translate.functions";

type Lang = "en" | "es" | "ht";

const UI = {
  es: {
    yourLang: "Su respuesta (Español)",
    english: "Traducción al inglés (para el tribunal)",
    approve: "Apruebo esta traducción",
    translating: "Traduciendo…",
    retry: "Reintentar",
    error: "Traducción no disponible",
  },
  ht: {
    yourLang: "Repons ou (Kreyòl)",
    english: "Tradiksyon Anglè (pou tribinal la)",
    approve: "Mwen apwouve tradiksyon sa a",
    translating: "K ap tradui…",
    retry: "Eseye ankò",
    error: "Tradiksyon pa disponib",
  },
  en: {
    yourLang: "Your answer",
    english: "English (for the court)",
    approve: "I approve this translation",
    translating: "Translating…",
    retry: "Retry",
    error: "Translation unavailable",
  },
} as const;

interface Props {
  fieldKey: string;
  label: string;
  hint?: string;
  type?: "text" | "textarea" | "date" | "number";
  lang: Lang;
  nativeValue: string;
  englishValue: string;
  approved: boolean;
  disabled?: boolean;
  onChange: (next: { native: string; english: string; approved: boolean }) => void;
}

export function BilingualField({
  fieldKey,
  label,
  hint,
  type = "text",
  lang,
  nativeValue,
  englishValue,
  approved,
  disabled,
  onChange,
}: Props) {
  const translate = useServerFn(translateFields);
  const [status, setStatus] = useState<"idle" | "translating" | "error">("idle");
  const lastTranslatedRef = useRef<string>(nativeValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);
  // Always keep the freshest props so async callbacks never write stale values.
  const latestRef = useRef({ nativeValue, englishValue, approved, onChange });
  latestRef.current = { nativeValue, englishValue, approved, onChange };
  const ui = UI[lang];

  const runTranslate = async (text: string) => {
    const myReq = ++reqIdRef.current;
    if (!text.trim()) {
      lastTranslatedRef.current = text;
      const cur = latestRef.current;
      if (cur.nativeValue === text) cur.onChange({ native: text, english: "", approved: false });
      setStatus("idle");
      return;
    }
    setStatus("translating");
    try {
      const res = await translate({
        data: {
          sourceLang: lang,
          targetLang: "en",
          fields: { [fieldKey]: text },
        },
      });
      // Ignore out-of-order / superseded responses.
      if (myReq !== reqIdRef.current) return;
      const eng = res.translations?.[fieldKey] ?? text;
      lastTranslatedRef.current = text;
      const cur = latestRef.current;
      // Never overwrite what the user has typed since the request started.
      cur.onChange({ native: cur.nativeValue, english: eng, approved: false });
      setStatus(res.error ? "error" : "idle");
    } catch {
      if (myReq === reqIdRef.current) setStatus("error");
    }
  };

  useEffect(() => {
    if (lang === "en") return;
    if (nativeValue === lastTranslatedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runTranslate(nativeValue), 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nativeValue, lang]);

  const handleNativeChange = (v: string) => {
    onChange({ native: v, english: englishValue, approved: false });
  };
  const handleEnglishChange = (v: string) => {
    // Manual English edits are authoritative: stop the pending auto-translation
    // from clobbering them.
    reqIdRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    lastTranslatedRef.current = nativeValue;
    setStatus("idle");
    onChange({ native: nativeValue, english: v, approved: approved });
  };
  const toggleApprove = (a: boolean) => {
    onChange({ native: nativeValue, english: englishValue, approved: a });
  };


  if (lang === "en") {
    return (
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</label>
        {hint && <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{hint}</div>}
        {type === "textarea" ? (
          <textarea value={nativeValue} disabled={disabled} rows={3} onChange={(e) => onChange({ native: e.target.value, english: e.target.value, approved: true })} style={inputStyle} />
        ) : (
          <input type={type} value={nativeValue} disabled={disabled} onChange={(e) => onChange({ native: e.target.value, english: e.target.value, approved: true })} style={inputStyle} />
        )}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 18, borderLeft: approved ? "3px solid #2d6a4f" : "3px solid #3a4458", paddingLeft: 12 }}>
      <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</label>
      {hint && <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{hint}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <div style={smallLabel}>{ui.yourLang}</div>
          {type === "textarea" ? (
            <textarea value={nativeValue} disabled={disabled} rows={3} onChange={(e) => handleNativeChange(e.target.value)} style={inputStyle} />
          ) : (
            <input type={type} value={nativeValue} disabled={disabled} onChange={(e) => handleNativeChange(e.target.value)} style={inputStyle} />
          )}
        </div>
        <div>
          <div style={{ ...smallLabel, color: "#e8a04a" }}>{ui.english} {status === "translating" && <span style={{ color: "#888" }}>· {ui.translating}</span>}</div>
          {type === "textarea" ? (
            <textarea value={englishValue} rows={3} onChange={(e) => handleEnglishChange(e.target.value)} style={{ ...inputStyle, background: "#0f1828" }} />
          ) : (
            <input type={type} value={englishValue} onChange={(e) => handleEnglishChange(e.target.value)} style={{ ...inputStyle, background: "#0f1828" }} />
          )}
          {status === "error" && (
            <div style={{ marginTop: 4 }}>
              <span style={{ color: "#ff8080", fontSize: 12 }}>{ui.error} · </span>
              <button type="button" onClick={() => runTranslate(nativeValue)} style={{ background: "none", border: "none", color: "#e8a04a", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}>{ui.retry}</button>
            </div>
          )}
        </div>
      </div>
      {(nativeValue.trim() || englishValue.trim()) && (
        <label style={{ display: "inline-flex", gap: 8, marginTop: 8, fontSize: 13, cursor: "pointer", color: approved ? "#86efac" : "#a8a59a" }}>
          <input type="checkbox" checked={approved} onChange={(e) => toggleApprove(e.target.checked)} />
          {ui.approve}
        </label>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  fontSize: 14,
  border: "1px solid #3a4458",
  borderRadius: 3,
  background: "#0b1220",
  color: "#f6efe1",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
const smallLabel: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.5,
  color: "#a8a59a",
  marginBottom: 3,
  textTransform: "uppercase",
};
