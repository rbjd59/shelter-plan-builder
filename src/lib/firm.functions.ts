import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Confirms whether the signed-in user has the `firm` role. Used by the
 * `/firm/*` layout to gate access without exposing the user_roles table.
 */
export const getMyFirmStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "firm")
      .maybeSingle();
    return { isFirm: !!data };
  });

export type QueueItem = {
  intakeSessionId: string;
  contactName: string | null;
  contactEmail: string | null;
  inmateName: string | null;
  language: string;
  receivedAt: string;
  retainerSignedAt: string | null;
  retainerSignedName: string | null;
  lastAction: string | null;
  lastActionAt: string | null;
  status: "awaiting_review" | "reviewed" | "approved" | "finalized" | "mailed";
};

function deriveStatus(lastAction: string | null): QueueItem["status"] {
  switch (lastAction) {
    case "mailed":
      return "mailed";
    case "finalized_ao242":
      return "finalized";
    case "approved_for_storage":
      return "approved";
    case "reviewed_draft":
      return "reviewed";
    default:
      return "awaiting_review";
  }
}

/**
 * Lists every case awaiting attorney action, sorted with oldest first
 * (FIFO). Joins in retainer signature and the most recent attorney action
 * so the queue UI can show status at a glance.
 */
export const getReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ items: QueueItem[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: firmRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["firm", "admin"])
      .maybeSingle();
    if (!firmRow) throw new Error("Not authorized");

    const { data: cases, error } = await supabaseAdmin
      .from("case_tracking")
      .select("intake_session_id, contact_name, contact_email, inmate_name, language, step1_received_at")
      .order("step1_received_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);

    const sessionIds = (cases ?? []).map((c) => c.intake_session_id);
    if (sessionIds.length === 0) return { items: [] };

    const [{ data: retainers }, { data: actions }] = await Promise.all([
      supabaseAdmin
        .from("legal_retainers")
        .select("intake_session_id, signed_at, signed_name")
        .in("intake_session_id", sessionIds),
      supabaseAdmin
        .from("attorney_actions")
        .select("case_id, action, created_at")
        .in("case_id", sessionIds)
        .order("created_at", { ascending: false }),
    ]);

    const retainerBySession = new Map<string, { signed_at: string; signed_name: string }>();
    for (const r of retainers ?? []) {
      const sid = (r as { intake_session_id: string | null }).intake_session_id;
      if (sid && !retainerBySession.has(sid)) {
        retainerBySession.set(sid, {
          signed_at: (r as { signed_at: string }).signed_at,
          signed_name: (r as { signed_name: string }).signed_name,
        });
      }
    }

    const lastActionBySession = new Map<string, { action: string; created_at: string }>();
    for (const a of actions ?? []) {
      const sid = (a as { case_id: string }).case_id;
      if (!lastActionBySession.has(sid)) {
        lastActionBySession.set(sid, {
          action: (a as { action: string }).action,
          created_at: (a as { created_at: string }).created_at,
        });
      }
    }

    const items: QueueItem[] = (cases ?? []).map((c) => {
      const retainer = retainerBySession.get(c.intake_session_id);
      const last = lastActionBySession.get(c.intake_session_id);
      return {
        intakeSessionId: c.intake_session_id,
        contactName: c.contact_name,
        contactEmail: c.contact_email,
        inmateName: c.inmate_name,
        language: c.language,
        receivedAt: c.step1_received_at,
        retainerSignedAt: retainer?.signed_at ?? null,
        retainerSignedName: retainer?.signed_name ?? null,
        lastAction: last?.action ?? null,
        lastActionAt: last?.created_at ?? null,
        status: deriveStatus(last?.action ?? null),
      };
    });

    return { items };
  });

/**
 * Records an attorney action for a case. Validates the action against the
 * allowed enum and writes to attorney_actions with the caller's user id.
 */
export const recordAttorneyAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      action: "viewed_draft" | "reviewed_draft" | "approved_for_storage" | "finalized_ao242" | "mailed" | "note";
      notes?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const allowed = ["viewed_draft", "reviewed_draft", "approved_for_storage", "finalized_ao242", "mailed", "note"];
      if (!allowed.includes(data.action)) throw new Error("Invalid action");
      if (!data.caseId || data.caseId.length > 200) throw new Error("Invalid caseId");
      if (data.notes && data.notes.length > 5000) throw new Error("Notes too long");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: firmRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["firm", "admin"])
      .maybeSingle();
    if (!firmRow) throw new Error("Not authorized");

    const { error } = await supabaseAdmin.from("attorney_actions").insert({
      case_id: data.caseId,
      attorney_user_id: context.userId,
      action: data.action,
      notes: data.notes ?? null,
      metadata: (data.metadata ?? {}) as never,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Fetches a single case for the firm review screen: case_tracking row,
 * retainer record, full action history, and the intake answers payload.
 */
export const getCaseForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string }) => {
    if (!data.intakeSessionId || data.intakeSessionId.length > 200) {
      throw new Error("Invalid intakeSessionId");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: firmRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .in("role", ["firm", "admin"])
      .maybeSingle();
    if (!firmRow) throw new Error("Not authorized");

    const sid = data.intakeSessionId;

    const [caseRes, retainerRes, actionsRes, intakeRes] = await Promise.all([
      supabaseAdmin
        .from("case_tracking")
        .select("*")
        .eq("intake_session_id", sid)
        .maybeSingle(),
      supabaseAdmin
        .from("legal_retainers")
        .select("id, version, language, signed_name, signed_at, ip, user_agent")
        .eq("intake_session_id", sid)
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("attorney_actions")
        .select("id, action, notes, metadata, created_at, attorney_user_id")
        .eq("case_id", sid)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("intake_submissions")
        .select("answers, email, language, paid")
        .eq("stripe_session_id", sid)
        .maybeSingle(),
    ]);

    if (caseRes.error) throw new Error(caseRes.error.message);

    return {
      case: caseRes.data,
      retainer: retainerRes.data ?? null,
      actions: actionsRes.data ?? [],
      intake: intakeRes.data ?? null,
    };
  });

// ---------- Detained-clients board (firm + admin) ----------
async function assertFirmOrAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["firm", "admin"])
    .maybeSingle();
  if (!data) throw new Error("Not authorized");
}

export const listDetainedClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Detained = either has detention_info OR has an active SOS alert
    const [{ data: detentionRows }, { data: alertRows }] = await Promise.all([
      supabaseAdmin.from("client_detention_info").select("*"),
      supabaseAdmin
        .from("client_sos_alerts")
        .select("client_id, triggered_at, cancelled_at, lat, lng")
        .order("triggered_at", { ascending: false }),
    ]);

    const clientIds = new Set<string>();
    for (const d of detentionRows ?? []) clientIds.add((d as any).client_id);
    for (const a of alertRows ?? []) clientIds.add((a as any).client_id);
    if (clientIds.size === 0) return { clients: [] };

    const { data: clients } = await supabaseAdmin
      .from("app_clients")
      .select("id, full_name, email, phone_e164, invite_token, language, activated_at, created_at")
      .in("id", Array.from(clientIds));

    const detentionByClient = new Map<string, any>();
    for (const d of detentionRows ?? []) detentionByClient.set((d as any).client_id, d);
    const latestAlertByClient = new Map<string, any>();
    for (const a of alertRows ?? []) {
      const cid = (a as any).client_id;
      if (!latestAlertByClient.has(cid)) latestAlertByClient.set(cid, a);
    }

    return {
      clients: (clients ?? []).map((c) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone_e164,
        activation_code: c.invite_token,
        language: c.language,
        latest_alert: latestAlertByClient.get(c.id) ?? null,
        detention: detentionByClient.get(c.id) ?? null,
      })),
    };
  });

export const getDetainedClient = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clientId: string }) => {
    if (!data.clientId) throw new Error("Missing clientId");
    return data;
  })
  .handler(async ({ context, data }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: client }, { data: detention }, { data: alerts }, { data: documents }, { data: contacts }] = await Promise.all([
      supabaseAdmin
        .from("app_clients")
        .select("id, full_name, email, phone_e164, invite_token, language, activated_at, created_at, place_of_birth, country_of_origin")
        .eq("id", data.clientId)
        .maybeSingle(),
      supabaseAdmin.from("client_detention_info").select("*").eq("client_id", data.clientId).maybeSingle(),
      supabaseAdmin
        .from("client_sos_alerts")
        .select("*")
        .eq("client_id", data.clientId)
        .order("triggered_at", { ascending: false }),
      supabaseAdmin
        .from("client_documents")
        .select("id, title, content, document_type, send_on_alert, loaded_at")
        .eq("client_id", data.clientId)
        .order("loaded_at", { ascending: true }),
      supabaseAdmin
        .from("client_contacts")
        .select("name, email, phone_e164, relationship, priority, notify_on_sos")
        .eq("client_id", data.clientId)
        .order("priority", { ascending: true }),
    ]);

    if (!client) throw new Error("Client not found");
    return {
      client,
      detention: detention ?? null,
      alerts: alerts ?? [],
      documents: documents ?? [],
      contacts: contacts ?? [],
    };
  });
