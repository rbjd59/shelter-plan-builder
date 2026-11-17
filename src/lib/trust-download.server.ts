import { createHmac, timingSafeEqual } from "node:crypto";

export function signTrustDownload(
  id: string,
  source: "assessment" | "app",
  expires: number,
  key: string,
) {
  return createHmac("sha256", key).update(`trust-pdf:${source}:${id}:${expires}`).digest("hex");
}
export function verifyTrustDownload(
  id: string,
  source: "assessment" | "app",
  expires: number,
  signature: string,
  key: string,
) {
  if (expires <= Date.now() || !/^[a-f0-9]{64}$/.test(signature)) return false;
  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(signTrustDownload(id, source, expires, key), "hex"),
  );
}
