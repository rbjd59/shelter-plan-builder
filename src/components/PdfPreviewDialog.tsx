import * as React from "react";

export function pdfBlobFromBase64(b64: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadPdfFromBase64(filename: string, b64: string) {
  const url = URL.createObjectURL(pdfBlobFromBase64(b64));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "document.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * In-page PDF viewer. We deliberately do NOT use window.open(blobUrl):
 * ad blockers and Chrome's popup rules reject that with
 * ERR_BLOCKED_BY_CLIENT. An iframe in a modal always works.
 */
export function usePdfPreview() {
  const [state, setState] = React.useState<{ url: string; filename: string } | null>(null);

  const open = React.useCallback((b64: string, filename: string) => {
    const url = URL.createObjectURL(pdfBlobFromBase64(b64));
    setState((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { url, filename: filename || "document.pdf" };
    });
  }, []);

  const close = React.useCallback(() => {
    setState((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  const viewer = state ? (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 p-3"
      role="dialog"
      aria-modal="true"
      aria-label={state.filename}
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-white">
        <span className="truncate text-sm font-semibold">{state.filename}</span>
        <div className="flex gap-2">
          <a
            href={state.url}
            download={state.filename}
            className="rounded bg-white px-3 py-1 text-xs font-bold text-slate-900"
          >
            Download
          </a>
          <button
            type="button"
            onClick={close}
            className="rounded border border-white/60 px-3 py-1 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
      <iframe src={state.url} title={state.filename} className="flex-1 rounded bg-white" />
    </div>
  ) : null;

  return { open, close, viewer };
}
