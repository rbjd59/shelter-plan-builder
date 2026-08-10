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
        .select("id, client_id, triggered_at, cancelled_at")
        .order("triggered_at", { ascending: false })
        .limit(500),
    ]);

    // Latest alert per client (alerts are ordered newest first).
    const latestAlertByClient = new Map<string, any>();
    for (const a of (alertsRes.data ?? []) as any[]) {
      if (!latestAlertByClient.has(a.client_id)) latestAlertByClient.set(a.client_id, a);
    }

    // MINIMUM VISIBILITY: activation code + dates only. No names, emails,
    // phones, contacts, documents or GPS ever reach the company board, so a
    // subpoena against the company yields nothing identifying about a client.
    const registered = (clientsRes.data ?? []).map((c) => {
      const row = c as any;
      const alert = latestAlertByClient.get(row.id) ?? null;
      return {
        activation_code: row.invite_token,
        registered_at: row.created_at,
        activated_at: row.activated_at,
        latest_alert: alert
          ? {
              id: alert.id,
              triggered_at: alert.triggered_at,
              cancelled_at: alert.cancelled_at,
            }
          : null,
      };
    });

    return { registered, triggered: [] as Array<Record<string, never>> };
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
        "id, invite_token, full_name, email, phone_e164, language, created_at, activated_at, a_number, date_of_birth, place_of_birth, country_of_origin",
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
          date_of_birth: string | null;
          place_of_birth: string | null;
          country_of_origin: string | null;
        };
        const docs = docsByClient.get(row.id) ?? [];
        return {
          id: row.id,
          activation_code: row.invite_token,
          full_name: row.full_name,
          email: row.email,
          phone: row.phone_e164,
          language: row.language,
          a_number: row.a_number,
          date_of_birth: row.date_of_birth,
          place_of_birth: row.place_of_birth,
          country_of_origin: row.country_of_origin,
          registered_at: row.created_at,
          activated_at: row.activated_at,
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
    const [
      { data: client },
      { data: documents },
      { data: alerts },
      { data: contacts },
    ] = await Promise.all([
      supabaseAdmin
        .from("app_clients")
        .select(
          "id, invite_token, full_name, email, phone_e164, language, created_at, activated_at, a_number, date_of_birth, place_of_birth, country_of_origin",
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
      supabaseAdmin
        .from("client_contacts")
        .select("id, name, phone_e164, email, relationship, role, priority, notify_on_sos, created_at, updated_at")
        .eq("client_id", data.clientId)
        .order("priority", { ascending: true }),
    ]);
    if (!client) throw new Error("Client not found");
    return {
      client,
      draft_forms: (documents ?? []).filter((d) => !(d as { from_app: boolean }).from_app),
      app_uploads: (documents ?? []).filter((d) => (d as { from_app: boolean }).from_app),
      alerts: alerts ?? [],
      contacts: contacts ?? [],
    };
  });


/** Build the actual PDF for a draft form and return base64 + filename. */
export const pinDownloadDocument = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; documentId: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { buildDocumentPdf } = await import("@/lib/draft-pdfs.server");
    const { bytes, filename } = await buildDocumentPdf(data.documentId);
    const b64 =
      typeof Buffer !== "undefined"
        ? Buffer.from(bytes).toString("base64")
        : btoa(String.fromCharCode(...bytes));
    return { pdfB64: b64, filename };
  });

/**
 * Endpoint the client app calls right after activation to overwrite the
 * mirrored "From client's file" copy of a form with the personalized PDF
 * text the app generated locally. Idempotent — repeats just overwrite.
 *
 * Auth: no PIN — the activation token is the bearer. We accept the 8-char
 * invite_token and the document_type to target a single row.
 */
export const appUploadFormCopy = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; documentType: string; content: string; title?: string }) => {
    const norm = (d.token || "").toUpperCase().trim();
    if (!/^[A-Z0-9]{8}$/.test(norm)) throw new Error("invalid_token_format");
    if (!d.documentType || typeof d.documentType !== "string") throw new Error("documentType required");
    if (typeof d.content !== "string") throw new Error("content required");
    return { ...d, token: norm };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client } = await supabaseAdmin
      .from("app_clients")
      .select("id")
      .eq("invite_token", data.token)
      .maybeSingle();
    if (!client) throw new Error("invalid_token");
    const cid = (client as { id: string }).id;

    // Update the from_app=true mirror row for that document_type. If none
    // exists (older client predating the mirror change), insert one.
    const { data: existing } = await supabaseAdmin
      .from("client_documents")
      .select("id")
      .eq("client_id", cid)
      .eq("document_type", data.documentType)
      .eq("from_app", true)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("client_documents")
        .update({ content: data.content, loaded_at: new Date().toISOString(), title: data.title ?? undefined } as never)
        .eq("id", (existing as { id: string }).id);
      return { ok: true, document_id: (existing as { id: string }).id };
    }
    const { data: inserted } = await supabaseAdmin
      .from("client_documents")
      .insert({
        client_id: cid,
        title: data.title ?? data.documentType,
        content: data.content,
        document_type: data.documentType,
        send_on_alert: false,
        from_app: true,
      } as never)
      .select("id")
      .single();
    return { ok: true, document_id: (inserted as { id: string }).id };
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
