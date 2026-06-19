import { createServerFn } from "@tanstack/react-start";

const PIN = "5688";

function check(pin: string) {
  if (pin !== PIN) throw new Error("Invalid PIN");
}

/**
 * COMPANY BOARD — strict minimum visibility.
 *
 * The company holds only what it absolutely needs:
 *  - Registered clients: activation code + registration timestamp (nothing identifying).
 *  - Triggered clients : activation code + the four fields the APP sends at SOS
 *                        time (name, A-number, place of birth, date of birth) + when.
 *
 * No emails, phones, or attorney work product touch this board, so a subpoena
 * against the company yields nothing identifying for clients who haven't triggered.
 */
export const pinListCompanyBoard = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [clientsRes, alertsRes] = await Promise.all([
      supabaseAdmin
        .from("app_clients")
        .select("id, invite_token, created_at, activated_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin
        .from("client_sos_alerts")
        .select(
          "id, client_id, triggered_at, cancelled_at, app_reported_name, app_reported_a_number, app_reported_place_of_birth, app_reported_date_of_birth",
        )
        .order("triggered_at", { ascending: false })
        .limit(500),
    ]);

    const tokenById = new Map<string, string>();
    for (const c of clientsRes.data ?? []) {
      tokenById.set((c as { id: string }).id, (c as { invite_token: string }).invite_token);
    }

    const triggeredClientIds = new Set<string>(
      (alertsRes.data ?? []).map((a) => (a as { client_id: string }).client_id),
    );

    const registered = (clientsRes.data ?? [])
      .filter((c) => !triggeredClientIds.has((c as { id: string }).id))
      .map((c) => {
        const row = c as { invite_token: string; created_at: string; activated_at: string | null };
        return {
          activation_code: row.invite_token,
          registered_at: row.created_at,
          activated_at: row.activated_at,
        };
      });

    const triggered = (alertsRes.data ?? []).map((a) => {
      const row = a as {
        id: string;
        client_id: string;
        triggered_at: string;
        cancelled_at: string | null;
        app_reported_name: string | null;
        app_reported_a_number: string | null;
        app_reported_place_of_birth: string | null;
        app_reported_date_of_birth: string | null;
      };
      return {
        alert_id: row.id,
        activation_code: tokenById.get(row.client_id) ?? "—",
        triggered_at: row.triggered_at,
        cancelled_at: row.cancelled_at,
        name: row.app_reported_name,
        a_number: row.app_reported_a_number,
        place_of_birth: row.app_reported_place_of_birth,
        date_of_birth: row.app_reported_date_of_birth,
      };
    });

    return { registered, triggered };
  });

/**
 * ATTORNEY BOARD — every client, keyed by activation code.
 *
 * At signup the attorney already has: activation code, full name, contact,
 * A-number (if intake captured it), and the 5 draft forms.
 *
 * On trigger: timestamp shows on the row, and any forms the app uploads
 * (from_app = true) appear in the client's folder automatically.
 */
export const pinListAttorneyBoard = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: clients } = await supabaseAdmin
      .from("app_clients")
      .select(
        "id, invite_token, full_name, email, phone_e164, language, created_at, activated_at, a_number",
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    const ids = (clients ?? []).map((c) => (c as { id: string }).id);
    if (ids.length === 0) return { clients: [] };

    const [docsRes, alertsRes] = await Promise.all([
      supabaseAdmin
        .from("client_documents")
        .select("id, client_id, title, document_type, send_on_alert, from_app, loaded_at")
        .in("client_id", ids)
        .order("loaded_at", { ascending: true }),
      supabaseAdmin
        .from("client_sos_alerts")
        .select("client_id, triggered_at, cancelled_at")
        .in("client_id", ids)
        .order("triggered_at", { ascending: false }),
    ]);

    const docsByClient = new Map<string, any[]>();
    for (const d of docsRes.data ?? []) {
      const cid = (d as { client_id: string }).client_id;
      if (!docsByClient.has(cid)) docsByClient.set(cid, []);
      docsByClient.get(cid)!.push(d);
    }
    const latestAlert = new Map<string, { triggered_at: string; cancelled_at: string | null }>();
    for (const a of alertsRes.data ?? []) {
      const cid = (a as { client_id: string }).client_id;
      if (!latestAlert.has(cid))
        latestAlert.set(cid, {
          triggered_at: (a as { triggered_at: string }).triggered_at,
          cancelled_at: (a as { cancelled_at: string | null }).cancelled_at,
        });
    }

    return {
      clients: (clients ?? []).map((c) => {
        const row = c as {
          id: string;
          invite_token: string;
          full_name: string | null;
          email: string | null;
          phone_e164: string | null;
          language: string | null;
          created_at: string;
          activated_at: string | null;
          a_number: string | null;
        };
        const docs = docsByClient.get(row.id) ?? [];
        return {
          id: row.id,
          activation_code: row.invite_token,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone_e164,
          language: row.language,
          registered_at: row.created_at,
          activated_at: row.activated_at,
          a_number: row.a_number,
          draft_forms: docs.filter((d) => !d.from_app),
          app_uploads: docs.filter((d) => d.from_app),
          latest_alert: latestAlert.get(row.id) ?? null,
        };
      }),
    };
  });

/** Fetch one client folder for the attorney detail view. */
export const pinGetAttorneyClient = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; clientId: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: client }, { data: documents }, { data: alerts }] = await Promise.all([
      supabaseAdmin
        .from("app_clients")
        .select(
          "id, invite_token, full_name, email, phone_e164, language, created_at, activated_at, a_number",
        )
        .eq("id", data.clientId)
        .maybeSingle(),
      supabaseAdmin
        .from("client_documents")
        .select("id, title, content, document_type, send_on_alert, from_app, loaded_at")
        .eq("client_id", data.clientId)
        .order("loaded_at", { ascending: true }),
      supabaseAdmin
        .from("client_sos_alerts")
        .select("id, triggered_at, cancelled_at")
        .eq("client_id", data.clientId)
        .order("triggered_at", { ascending: false }),
    ]);
    if (!client) throw new Error("Client not found");
    return {
      client,
      draft_forms: (documents ?? []).filter((d) => !(d as { from_app: boolean }).from_app),
      app_uploads: (documents ?? []).filter((d) => (d as { from_app: boolean }).from_app),
      alerts: alerts ?? [],
    };
  });

// ---------------------------------------------------------------------------
// Legacy exports kept so existing imports compile until we delete those routes.
// They proxy the new functions. The /firm.* and /admin.* routes that still
// reference these names will continue to work.
// ---------------------------------------------------------------------------

export const pinListAlerts = pinListCompanyBoard;
export const pinListDetained = pinListAttorneyBoard;
export const pinGetDetained = pinGetAttorneyClient;

export const pinUpsertDetention = createServerFn({ method: "POST" })
  .inputValidator((d: {
    pin: string;
    client_id: string;
    facility_name?: string;
    facility_address?: string;
    warden_name?: string;
    arrest_date?: string;
    a_number?: string;
    federal_id?: string;
    notes?: string;
  }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("client_detention_info")
      .upsert(
        {
          client_id: data.client_id,
          facility_name: data.facility_name || null,
          facility_address: data.facility_address || null,
          warden_name: data.warden_name || null,
          arrest_date: data.arrest_date || null,
          a_number: data.a_number || null,
          federal_id: data.federal_id || null,
          notes: data.notes || null,
          located_at: new Date().toISOString(),
          located_by: "pin-access",
        },
        { onConflict: "client_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
