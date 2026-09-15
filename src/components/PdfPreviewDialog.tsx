import * as React from "react";

const PDF_WORKER_URL = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
  const [state, setState] = React.useState<{ b64: string; filename: string } | null>(null);

  const open = React.useCallback((b64: string, filename: string) => {
    setState({ b64, filename: filename || "document.pdf" });
  }, []);

  const close = React.useCallback(() => setState(null), []);

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
           <button
             type="button"
             onClick={() => downloadPdfFromBase64(state.filename, state.b64)}
            className="rounded bg-white px-3 py-1 text-xs font-bold text-slate-900"
          >
            Download
           </button>
          <button
            type="button"
            onClick={close}
            className="rounded border border-white/60 px-3 py-1 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
       <PdfPages b64={state.b64} filename={state.filename} />
    </div>
  ) : null;

  return { open, close, viewer };
}

function PdfPages({ b64, filename }: { b64: string; filename: string }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    host.replaceChildren();
    setError(null);

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        const bytes = new Uint8Array(await pdfBlobFromBase64(b64).arrayBuffer());
        const pdf = await pdfjs.getDocument({ data: bytes }).promise;
        if (cancelled) return;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const baseViewport = page.getViewport({ scale: 1 });
          const width = Math.min(host.clientWidth - 24, 960);
          const viewport = page.getViewport({ scale: Math.max(0.5, width / baseViewport.width) });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas is unavailable");
          const pixelRatio = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          canvas.className = "mx-auto block max-w-full bg-white shadow";
          host.appendChild(canvas);
          await page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
          }).promise;
        }
      } catch (cause) {
        if (!cancelled) {
          console.error("PDF preview failed", cause);
          setError("The preview could not be drawn. Download the file to open it.");
        }
      }
    })();

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [b64]);

  return (
    <div className="flex-1 overflow-y-auto rounded bg-slate-200 p-3" aria-label={`Preview of ${filename}`}>
      {error ? <p className="rounded bg-white p-4 text-sm text-red-700">{error}</p> : null}
      <div ref={hostRef} className="space-y-3" />
    </div>
  );
}
