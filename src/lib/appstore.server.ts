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
  version: string; // App version (e.g., "0.4.1") from preReleaseVersion
  buildNumber: string; // Build number (e.g., "786720682") from build.attributes.version
  processingState: string;
  uploadedDate: string;
  inExternalTesting: boolean;
}

export interface AppStoreVersion {
  id: string;
  versionString: string;
  platform: string;
  appStoreState: string;
  createdDate: string;
  buildId?: string;
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
  const path = `/builds?filter[app]=${encodeURIComponent(appId)}&include=preReleaseVersion,betaGroups&sort=-uploadedDate&limit=50`;
  const body = await ascFetch(path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const included = (body?.included ?? []);
  const preRelMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    included.filter((i: any) => i.type === "preReleaseVersions").map((i: any) => [i.id, i.attributes?.version ?? ""]),
  );
  const extGroupIds = new Set(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    included.filter((g: any) => g.type === "betaGroups" && g.attributes?.isInternalGroup === false).map((g: any) => g.id),
  );
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => {
      const preRelId = b.relationships?.preReleaseVersion?.data?.id;
      return {
        id: b.id,
        version: (preRelId ? preRelMap.get(preRelId) : "") ?? "",
        buildNumber: b.attributes?.version ?? "",
        processingState: b.attributes?.processingState ?? "UNKNOWN",
        uploadedDate: b.attributes?.uploadedDate ?? "",
        inExternalTesting: (b.relationships?.betaGroups?.data ?? []).some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (g: any) => extGroupIds.has(g.id),
        ),
      };
    },
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

// Non-secret status of the stored Apple credentials. Never returns key material —
// only whether each value is present, plus the Key ID / Issuer ID so an admin can
// confirm they match the key row shown in App Store Connect.
export function credentialStatus(): {
  hasIssuer: boolean;
  hasKeyId: boolean;
  hasP8: boolean;
  issuerId: string | null;
  keyId: string | null;
  p8LooksValid: boolean;
} {
  const issuer = process.env["APPLE_STORE_CONNECT_ISSUER_ID"] ?? "";
  const keyId = process.env["APPLE_STORE_CONNECT_KEY_ID"] ?? "";
  const p8 = process.env["APPLE_STORE_CONNECT_P8_KEY"] ?? "";
  return {
    hasIssuer: !!issuer,
    hasKeyId: !!keyId,
    hasP8: !!p8,
    issuerId: issuer || null,
    keyId: keyId || null,
    p8LooksValid: p8.includes("BEGIN PRIVATE KEY"),
  };
}

export async function listVersions(appId: string): Promise<AppStoreVersion[]> {
  const body = await ascFetch(`/apps/${encodeURIComponent(appId)}/appStoreVersions?limit=50&include=build`);
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => ({
      id: v.id,
      versionString: v.attributes?.versionString ?? "",
      platform: v.attributes?.platform ?? "",
      appStoreState: v.attributes?.appStoreState ?? "UNKNOWN",
      createdDate: v.attributes?.createdDate ?? "",
      buildId: v.relationships?.build?.data?.id ?? undefined,
    }),
  );
}

export async function createVersion(appId: string, versionString: string): Promise<AppStoreVersion> {
  const body = await ascFetch("/appStoreVersions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "appStoreVersions",
        attributes: { platform: "IOS", versionString },
        relationships: { app: { data: { type: "apps", id: appId } } },
      },
    }),
  });
  const v = body?.data;
  if (!v) throw new Error("App Store Connect did not return a new version.");
  return {
    id: v.id,
    versionString: v.attributes?.versionString ?? versionString,
    platform: v.attributes?.platform ?? "IOS",
    appStoreState: v.attributes?.appStoreState ?? "PREPARE_FOR_SUBMISSION",
    createdDate: v.attributes?.createdDate ?? new Date().toISOString(),
    buildId: v.relationships?.build?.data?.id ?? undefined,
  };
}

export async function setVersionBuild(versionId: string, buildId: string): Promise<void> {
  await ascFetch(`/appStoreVersions/${encodeURIComponent(versionId)}/relationships/build`, {
    method: "PATCH",
    body: JSON.stringify({ data: { type: "builds", id: buildId } }),
  });
}

export async function deleteVersion(versionId: string): Promise<void> {
  await ascFetch(`/appStoreVersions/${encodeURIComponent(versionId)}`, {
    method: "DELETE",
  });
}

export interface LocalizationInput {
  locale: string;
  description: string;
  keywords: string;
  marketingUrl?: string;
  supportUrl?: string;
  whatsNew?: string;
}

export async function upsertLocalization(versionId: string, input: LocalizationInput): Promise<void> {
  // Try to find an existing localization for this locale.
  const list = await ascFetch(`/appStoreVersions/${encodeURIComponent(versionId)}/appStoreVersionLocalizations?limit=50`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (list?.data ?? []).find((l: any) => l.attributes?.locale === input.locale);

  const baseAttrs: Record<string, unknown> = {
    description: input.description,
    keywords: input.keywords,
    ...(input.marketingUrl ? { marketingUrl: input.marketingUrl } : {}),
    ...(input.supportUrl ? { supportUrl: input.supportUrl } : {}),
    // whatsNew is only editable after the app has been released at least once.
    ...(input.whatsNew && input.whatsNew.trim() ? { whatsNew: input.whatsNew } : {}),
  };

  if (existing) {
    // PATCH requests must include the entity id matching the URL and must not
    // include the locale attribute on update.
    await ascFetch(`/appStoreVersionLocalizations/${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: { type: "appStoreVersionLocalizations", id: existing.id, attributes: baseAttrs },
      }),
    });
  } else {
    await ascFetch("/appStoreVersionLocalizations", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "appStoreVersionLocalizations",
          attributes: { locale: input.locale, ...baseAttrs },
          relationships: {
            appStoreVersion: { data: { type: "appStoreVersions", id: versionId } },
          },
        },
      }),
    });
  }
}

export async function submitVersionForReview(versionId: string): Promise<string> {
  const body = await ascFetch("/appStoreVersionSubmissions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "appStoreVersionSubmissions",
        relationships: {
          appStoreVersion: { data: { type: "appStoreVersions", id: versionId } },
        },
      },
    }),
  });
  return body?.data?.id ?? "submitted";
}

export type SubmitReviewResult = {
  ok: true;
  versionId: string;
  versionString: string;
  createdVersion: boolean;
  setBuild: boolean;
  deletedVersion?: string;
  submissionId: string | null;
  submitted: boolean;
  manualActionRequired?: boolean;
  submissionError?: string;
};

export async function submitBuildForReview(
  appId: string,
  buildId: string,
  versionString: string,
  opts: { replaceExisting?: boolean } = {},
): Promise<SubmitReviewResult> {
  const versions = await listVersions(appId);
  let version = versions.find((v) => v.versionString === versionString);
  let createdVersion = false;
  let deletedVersion: string | undefined;

  if (!version) {
    // If an editable version already exists, we can attach the build to it
    // rather than forcing a new version (Apple only allows one editable version).
    const editable = versions.find((v) => v.appStoreState === "PREPARE_FOR_SUBMISSION");
    if (editable) {
      if (opts.replaceExisting) {
        // Apple may reject deleting the last version; if it fails, fall back to using it.
        try {
          await deleteVersion(editable.id);
          deletedVersion = editable.versionString;
        } catch (e) {
          const err = e as Error;
          if (err.message.includes("last version") || err.message.includes("cannot be deleted")) {
            version = editable;
          } else {
            throw err;
          }
        }
      } else {
        version = editable;
      }
    }

    if (!version) {
      version = await createVersion(appId, versionString);
      createdVersion = true;
    }
  }

  // Ensure the chosen build is attached to the version.
  const setBuild = version.buildId !== buildId;
  if (setBuild) {
    await setVersionBuild(version.id, buildId);
    version.buildId = buildId;
  }

  // Apply a minimal en-US localization with the website's default copy.
  // Note: whatsNew is only editable for updates after the app has been
  // released at least once; omit it for the initial release.
  await upsertLocalization(version.id, {
    locale: "en-US",
    description:
      "Free emergency app for immigrant working families. One-click SOS alert, family contact notifications, and secure document delivery. Built by DetencionDefensa.com, Inc. and operated under license by Sorrentino Law Firm PLLC.",
    keywords: "immigration,ICE,emergency,defense,alerts,pro bono",
    marketingUrl: "https://detenciondefensa.com",
    supportUrl: "https://detenciondefensa.com",
  });

  // Attempt to submit. App Store Connect API keys with Developer role cannot
  // create submissions; App Manager or Admin role is required. If the call is
  // rejected, we still return success for the prepare step.
  let submissionId: string | null = null;
  let submitted = false;
  let submissionError: string | undefined;
  try {
    submissionId = await submitVersionForReview(version.id);
    submitted = true;
  } catch (e) {
    const err = e as Error;
    submissionError = err.message;
    submitted = false;
  }

  return {
    ok: true,
    versionId: version.id,
    versionString: version.versionString,
    createdVersion,
    setBuild,
    deletedVersion,
    submissionId,
    submitted,
    manualActionRequired: !submitted,
    submissionError,
  };
}

// ---------------------------------------------------------------------------
// TestFlight build maintenance: expire builds, set "What to Test" notes, and
// manage external testers.
// ---------------------------------------------------------------------------

export async function expireBuild(buildId: string): Promise<void> {
  await ascFetch(`/builds/${encodeURIComponent(buildId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: { type: "builds", id: buildId, attributes: { expired: true } },
    }),
  });
}

export async function removeBuildFromBetaGroup(buildId: string, groupId: string): Promise<void> {
  await ascFetch(`/builds/${encodeURIComponent(buildId)}/relationships/betaGroups`, {
    method: "DELETE",
    body: JSON.stringify({ data: [{ type: "betaGroups", id: groupId }] }),
  });
}

// Sets the "What to Test" notes shown to TestFlight testers for a build.
export async function setWhatToTest(
  buildId: string,
  whatsNew: string,
  locale = "en-US",
): Promise<void> {
  const list = await ascFetch(
    `/builds/${encodeURIComponent(buildId)}/betaBuildLocalizations?limit=50`,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (list?.data ?? []).find((l: any) => l.attributes?.locale === locale);
  if (existing) {
    await ascFetch(`/betaBuildLocalizations/${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: { type: "betaBuildLocalizations", id: existing.id, attributes: { whatsNew } },
      }),
    });
  } else {
    await ascFetch("/betaBuildLocalizations", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "betaBuildLocalizations",
          attributes: { locale, whatsNew },
          relationships: { build: { data: { type: "builds", id: buildId } } },
        },
      }),
    });
  }
}

export interface BetaTester {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  state: string;
}

export async function listBetaTesters(groupId: string): Promise<BetaTester[]> {
  const body = await ascFetch(`/betaGroups/${encodeURIComponent(groupId)}/betaTesters?limit=200`);
  return (body?.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => ({
      id: t.id,
      email: t.attributes?.email ?? "",
      firstName: t.attributes?.firstName ?? "",
      lastName: t.attributes?.lastName ?? "",
      state: t.attributes?.state ?? "",
    }),
  );
}

export interface TesterInput {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface InviteResult {
  email: string;
  ok: boolean;
  error?: string;
}

// Invites testers to an external TestFlight group. Existing testers are added
// to the group instead of failing the whole batch.
export async function inviteBetaTesters(
  groupId: string,
  testers: TesterInput[],
): Promise<InviteResult[]> {
  const results: InviteResult[] = [];
  for (const t of testers) {
    try {
      await ascFetch("/betaTesters", {
        method: "POST",
        body: JSON.stringify({
          data: {
            type: "betaTesters",
            attributes: {
              email: t.email,
              ...(t.firstName ? { firstName: t.firstName } : {}),
              ...(t.lastName ? { lastName: t.lastName } : {}),
            },
            relationships: { betaGroups: { data: [{ type: "betaGroups", id: groupId }] } },
          },
        }),
      });
      results.push({ email: t.email, ok: true });
    } catch (e) {
      const msg = (e as Error).message;
      // Tester already exists in the account: attach them to this group.
      if (/already exists|duplicate/i.test(msg)) {
        try {
          const all = await ascFetch(
            `/betaTesters?filter[email]=${encodeURIComponent(t.email)}&limit=1`,
          );
          const id = all?.data?.[0]?.id;
          if (!id) throw new Error(msg);
          await ascFetch(`/betaGroups/${encodeURIComponent(groupId)}/relationships/betaTesters`, {
            method: "POST",
            body: JSON.stringify({ data: [{ type: "betaTesters", id }] }),
          });
          results.push({ email: t.email, ok: true });
        } catch (e2) {
          results.push({ email: t.email, ok: false, error: (e2 as Error).message });
        }
      } else {
        results.push({ email: t.email, ok: false, error: msg });
      }
    }
  }
  return results;
}

export async function removeBetaTester(groupId: string, testerId: string): Promise<void> {
  await ascFetch(`/betaGroups/${encodeURIComponent(groupId)}/relationships/betaTesters`, {
    method: "DELETE",
    body: JSON.stringify({ data: [{ type: "betaTesters", id: testerId }] }),
  });
}
