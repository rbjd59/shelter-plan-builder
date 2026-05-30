// Per the Company's revised opinion (Change #7): the JS-44 Civil Cover Sheet
// is included BLANK in every Self-Help Packet. The Company does not
// pre-classify the case, does not select Plaintiff/Defendant captions, does
// not check the nature-of-suit boxes, and does not write a cause of action.
// The customer (or their family contact) completes every field by hand at
// the time of filing.
//
// We still expose `buildJs44Pdf(answers)` so the existing intake notification
// pipeline (upload, signed URLs, email links, App backfill) continues to
// work unchanged — but the bytes returned are the unmodified official blank
// AO/USCO form.

import { PDFDocument } from "pdf-lib";
import js44b64 from "@/assets/forms/JS44.pdf.b64";

function b64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function buildJs44Pdf(_answers: Record<string, unknown>): Promise<Uint8Array> {
  // Load + re-save the official blank template so it round-trips through
  // pdf-lib (consistent metadata) but remains an interactive blank form.
  const doc = await PDFDocument.load(b64ToBytes(js44b64));
  return await doc.save();
}
