import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Stripe Identity + Supabase Storage wiring for the qualify flow (Step 2).
 *
 * - createIdentityVerification: creates a hosted Stripe Identity session
 *   (license/passport + selfie liveness). Returns a URL the applicant opens
 *   on their phone.
 * - getIdentityVerification: polls current session status (client refreshes
 *   after they finish the phone flow, until the webhook stamps the row).
 * - createQualifyUploadUrl: mints a signed upload URL for the private
 *   `qualify-docs` bucket so the browser can PUT the file directly.
 * - saveQualifyDocumentPath: records the stored object path against the
 *   submission (church letter + one income doc).
 */

const DOC_KINDS = ["support_letter", "pay_stub", "tax_return", "benefits_letter"] as const;
type DocKind = (typeof DOC_KINDS)[number];

function safeExt(name: string) {
  const m = /\.([A-Za-z0-9]{2,5})$/.exec(name || "");
  return m ? m[1].toLowerCase() : "bin";
}

/* -------------------------- Stripe Identity -------------------------- */

export const createIdentityVerification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        returnUrl: z.string().url().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      const stripe = createStripeClient("sandbox");
      const session = await stripe.identity.verificationSessions.create({
        type: "document",
        options: {
          document: {
            require_matching_selfie: true,
            require_live_capture: true,
            allowed_types: ["driving_license", "id_card", "passport"],
          },
        },
        metadata: { submissionId: data.submissionId, kind: "qualify" },
        return_url: data.returnUrl || "https://detenciondefensa.com/qualify?verified=1",
      });

      await supabaseAdmin
        .from("qualify_submissions")
        .update({
          stripe_verification_session_id: session.id,
          stripe_verification_status: session.status,
        } as never)
        .eq("id", data.submissionId);

      return { ok: true as const, sessionId: session.id, url: session.url, status: session.status };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });

export const getIdentityVerification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ submissionId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { createStripeClient } = await import("@/lib/stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("qualify_submissions")
      .select("stripe_verification_session_id, stripe_verification_status, stripe_verification_verified_at")
      .eq("id", data.submissionId)
      .maybeSingle();

    if (!row?.stripe_verification_session_id) {
      return { ok: true as const, status: "not_started" as const };
    }

    // Fast path: webhook already marked verified.
    if (row.stripe_verification_status === "verified") {
      return { ok: true as const, status: "verified" as const, verifiedAt: row.stripe_verification_verified_at };
    }

    try {
      const stripe = createStripeClient("sandbox");
      const session = await stripe.identity.verificationSessions.retrieve(
        row.stripe_verification_session_id,
      );

      const patch: Record<string, unknown> = { stripe_verification_status: session.status };
      if (session.status === "verified" && !row.stripe_verification_verified_at) {
        patch.stripe_verification_verified_at = new Date().toISOString();
      }
      await supabaseAdmin
        .from("qualify_submissions")
        .update(patch as never)
        .eq("id", data.submissionId);

      return { ok: true as const, status: session.status };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });

/* -------------------------- Document uploads -------------------------- */

export const createQualifyUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        kind: z.enum(DOC_KINDS),
        filename: z.string().trim().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ext = safeExt(data.filename);
    const path = `${data.submissionId}/${data.kind}-${Date.now()}.${ext}`;

    const { data: signed, error } = await supabaseAdmin.storage
      .from("qualify-docs")
      .createSignedUploadUrl(path);

    if (error || !signed) {
      return { ok: false as const, error: error?.message || "Could not create upload URL" };
    }

    return {
      ok: true as const,
      path,
      token: signed.token,
      signedUrl: signed.signedUrl,
    };
  });

export const saveQualifyDocumentPath = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        kind: z.enum(DOC_KINDS),
        path: z.string().trim().min(1).max(512),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: Record<string, unknown> = {};
    if (data.kind === "support_letter") {
      patch.support_letter_path = data.path;
    } else {
      // pay_stub | tax_return | benefits_letter
      patch.income_document_path = data.path;
      patch.income_document_type = data.kind;
    }

    const { error } = await supabaseAdmin
      .from("qualify_submissions")
      .update(patch as never)
      .eq("id", data.submissionId);

    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export type QualifyDocKind = DocKind;
