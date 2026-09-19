// Server-only abuse controls: caller identification, attempt logging and
// simple per-IP rate limiting. Every attempt (allowed or denied) is written to
// intake_delivery_log so we have a forensic trail of who probed what.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function getClientIp(request: Request): string {
  const h = request.headers;
  const raw =
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    (h.get("x-forwarded-for") ?? "").split(",")[0] ||
    "";
  return raw.trim().slice(0, 64) || "unknown";
}

export function getClientMeta(request: Request) {
  return {
    ip: getClientIp(request),
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    country: request.headers.get("cf-ipcountry") ?? null,
    referer: (request.headers.get("referer") ?? "").slice(0, 300) || null,
  };
}

export async function logAttempt(opts: {
  step: string;
  status: string;
  request: Request;
  target?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("intake_delivery_log").insert({
      step: opts.step,
      status: opts.status,
      target: opts.target ?? null,
      metadata: { ...getClientMeta(opts.request), ...(opts.metadata ?? {}) },
    } as never);
  } catch {
    // never let logging break the request
  }
}

/**
 * Returns true when this IP has already produced `max` attempts of the given
 * step within `windowMinutes`. Counts the forensic rows we write in logAttempt.
 */
export async function isRateLimited(opts: {
  step: string;
  request: Request;
  max: number;
  windowMinutes: number;
  statusPrefix?: string;
}): Promise<boolean> {
  const ip = getClientIp(opts.request);
  if (ip === "unknown") return false;
  const since = new Date(Date.now() - opts.windowMinutes * 60_000).toISOString();
  try {
    let q = supabaseAdmin
      .from("intake_delivery_log")
      .select("id", { count: "exact", head: true })
      .eq("step", opts.step)
      .gte("created_at", since)
      .filter("metadata->>ip", "eq", ip);
    if (opts.statusPrefix) q = q.like("status", `${opts.statusPrefix}%`);
    const { count } = await q;
    return (count ?? 0) >= opts.max;
  } catch {
    return false;
  }
}

export const TOO_MANY = () =>
  new Response(
    JSON.stringify({ error: "too_many_requests", message: "Too many attempts. Try again later." }),
    { status: 429, headers: { "content-type": "application/json", "retry-after": "900" } },
  );
