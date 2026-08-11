// Server-only helpers for the App Store Connect API.
// Reads the Apple credentials (APPLE_STORE_CONNECT_*) from process.env inside
// each call and signs a short-lived ES256 JWT to authenticate. Never import
// this file from client code — it is blocked from client bundles by the
// *.server.* filename rule.
//
// API reference: https://developer.apple.com/documentation/appstoreconnectapi

export interface AppStoreApp {
  id: string;
  name: string;
  bundleId: string;
}

export interface AppStoreBuild {
  id: string;
  version: string;
  buildVersion: string;
  processingState: string;
  uploadedDate: string;
  inExternalTesting: boolean;
}

export interface BetaGroup {
  id: string;
  name: string;
  isInternalGroup: boolean;
  publicLinkEnabled: boolean;
  hasAccessToAllBuilds: boolean;
}

function readCreds(): { issuer: string; keyId: string; privateKey: string } {
  const issuer = process.env["APPLE_STORE_CONNECT_ISSUER_ID"];
  const keyId = process.env["APPLE_STORE_CONNECT_KEY_ID"];
  const privateKey = process.env["APPLE_STORE_CONNECT_P8_KEY"];
  if (!issuer || !keyId || !privateKey) {
    throw new Error(
      "App Store Connect credentials are not configured (APPLE_STORE_CONNECT_ISSUER_ID / KEY_ID / P8_KEY).",
    );
  }
  return { issuer, keyId, privateKey };
}

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function pemToBytes(pem: string): Uint8Array {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  return base64ToBytes(b64);
}

// Create a 20-minute App Store Connect API token (ES256 signed with the .p8 key).
async function createJwt(): Promise<string> {
  const { issuer, keyId, privateKey } = readCreds();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = { iss: issuer, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" };
  const headerB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const keyBytes = pemToBytes(privateKey);
  // Copy into a fresh ArrayBuffer so the type is ArrayBuffer (not ArrayBufferLike).
  const keyBuf = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength,
  ) as ArrayBuffer;
  const key = await crypto.subtle.importKey("pkcs8", keyBuf, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(signingInput)),
  );
  return `${signingInput}.${b64urlEncode(sig)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ascFetch(path: string, init?: RequestInit): Promise<any> {
  const jwt = await createJwt();
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const detail = body?.errors?.[0]?.detail ?? body?.errors?.[0]?.title ?? text;
    throw new Error(`App Store Connect error (${res.status}): ${detail}`);
  }
  return body;
}

export async function listApps(): Promise<AppStoreApp[]> {
  const body = await ascFetch("/apps?limit=200");
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => ({
      id: a.id,
      name: a.attributes?.name ?? "",
      bundleId: a.attributes?.bundleId ?? "",
    }),
  );
}

export async function listBuilds(appId: string): Promise<AppStoreBuild[]> {
  const path = `/builds?filter[app]=${encodeURIComponent(appId)}&sort=-uploadedDate&limit=50&include=betaGroups`;
  const body = await ascFetch(path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const included = (body?.included ?? []).filter((i: any) => i.type === "betaGroups");
  const extGroupIds = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    included.filter((g: any) => g.attributes?.isInternalGroup === false).map((g: any) => g.id),
  );
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => ({
      id: b.id,
      version: b.attributes?.version ?? "",
      buildVersion: b.attributes?.buildVersion ?? "",
      processingState: b.attributes?.processingState ?? "UNKNOWN",
      uploadedDate: b.attributes?.uploadedDate ?? "",
      inExternalTesting: (b.relationships?.betaGroups?.data ?? []).some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (g: any) => extGroupIds.has(g.id),
      ),
    }),
  );
}

export async function listBetaGroups(appId: string): Promise<BetaGroup[]> {
  const body = await ascFetch(`/betaGroups?filter[app]=${encodeURIComponent(appId)}&limit=50`);
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (g: any) => {
      const a = g.attributes ?? {};
      return {
        id: g.id,
        name: a.name ?? "",
        isInternalGroup: a.isInternalGroup ?? true,
        publicLinkEnabled: a.publicLinkEnabled ?? false,
        hasAccessToAllBuilds: a.hasAccessToAllBuilds ?? false,
      };
    },
  );
}

export async function addBuildToBetaGroup(buildId: string, groupId: string): Promise<void> {
  await ascFetch(`/builds/${encodeURIComponent(buildId)}/relationships/betaGroups`, {
    method: "POST",
    body: JSON.stringify({ data: [{ type: "betaGroups", id: groupId }] }),
  });
}
