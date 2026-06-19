import { createServerFn } from "@tanstack/react-start";

const PIN = "5688";

function check(pin: string) {
  if (pin !== PIN) throw new Error("Invalid PIN");
}

export const pinListAlerts = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: alerts } = await supabaseAdmin
      .from("client_sos_alerts")
      .select("id, client_id, triggered_at, cancelled_at, lat, lng, battery_pct, payload")
      .order("triggered_at", { ascending: false })
      .limit(500);
    const ids = Array.from(new Set((alerts ?? []).map((a) => a.client_id)));
    const [clientsRes, docsRes, contactsRes, detentionRes] = await Promise.all([
      ids.length ? supabaseAdmin.from("app_clients").select("id, full_name, email, phone_e164, invite_token, language").in("id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabaseAdmin.from("client_documents").select("id, client_id, title, content, document_type, send_on_alert").in("client_id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabaseAdmin.from("client_contacts").select("client_id, name, email, phone_e164, relationship, notify_on_sos").in("client_id", ids) : Promise.resolve({ data: [] as any[] }),
      ids.length ? supabaseAdmin.from("client_detention_info").select("*").in("client_id", ids) : Promise.resolve({ data: [] as any[] }),
    ]);
    const clientById = new Map((clientsRes.data ?? []).map((c: any) => [c.id, c]));
    const detentionById = new Map((detentionRes.data ?? []).map((d: any) => [d.client_id, d]));
    return {
      alerts: (alerts ?? []).map((a) => {
        const c = clientById.get(a.client_id) as any;
        return {
          ...a,
          client: c ? { id: c.id, full_name: c.full_name, email: c.email, phone: c.phone_e164, activation_code: c.invite_token, language: c.language } : null,
          documents: (docsRes.data ?? []).filter((d: any) => d.client_id === a.client_id && d.send_on_alert),
          contacts_notified: (contactsRes.data ?? []).filter((ct: any) => ct.client_id === a.client_id && ct.notify_on_sos),
          detention_info: detentionById.get(a.client_id) ?? null,
        };
      }),
    };
  });

export const pinUpsertDetention = createServerFn({ method: "POST" })
  .inputValidator((d: {
    pin: string; client_id: string;
    facility_name?: string; facility_address?: string; warden_name?: string;
    arrest_date?: string; a_number?: string; federal_id?: string; notes?: string;
  }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload: any = {
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
    };
    const { error } = await supabaseAdmin
      .from("client_detention_info")
      .upsert(payload, { onConflict: "client_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const pinListDetained = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: detentionRows }, { data: alertRows }] = await Promise.all([
      supabaseAdmin.from("client_detention_info").select("*"),
      supabaseAdmin.from("client_sos_alerts").select("client_id, triggered_at, cancelled_at, lat, lng").order("triggered_at", { ascending: false }),
    ]);
    const ids = new Set<string>();
    for (const d of detentionRows ?? []) ids.add((d as any).client_id);
    for (const a of alertRows ?? []) ids.add((a as any).client_id);
    if (ids.size === 0) return { clients: [] };
    const { data: clients } = await supabaseAdmin
      .from("app_clients")
      .select("id, full_name, email, phone_e164, invite_token, language, activated_at, created_at")
      .in("id", Array.from(ids));
    const detentionByClient = new Map((detentionRows ?? []).map((d: any) => [d.client_id, d]));
    const latestAlert = new Map<string, any>();
    for (const a of alertRows ?? []) {
      const cid = (a as any).client_id;
      if (!latestAlert.has(cid)) latestAlert.set(cid, a);
    }
    return {
      clients: (clients ?? []).map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone_e164,
        activation_code: c.invite_token,
        language: c.language,
        latest_alert: latestAlert.get(c.id) ?? null,
        detention: detentionByClient.get(c.id) ?? null,
      })),
    };
  });

export const pinGetDetained = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; clientId: string }) => d)
  .handler(async ({ data }) => {
    check(data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: client }, { data: detention }, { data: alerts }, { data: documents }, { data: contacts }] = await Promise.all([
      supabaseAdmin.from("app_clients").select("id, full_name, email, phone_e164, invite_token, language, activated_at, created_at, place_of_birth, country_of_origin").eq("id", data.clientId).maybeSingle(),
      supabaseAdmin.from("client_detention_info").select("*").eq("client_id", data.clientId).maybeSingle(),
      supabaseAdmin.from("client_sos_alerts").select("*").eq("client_id", data.clientId).order("triggered_at", { ascending: false }),
      supabaseAdmin.from("client_documents").select("id, title, content, document_type, send_on_alert, loaded_at").eq("client_id", data.clientId).order("loaded_at", { ascending: true }),
      supabaseAdmin.from("client_contacts").select("name, email, phone_e164, relationship, priority, notify_on_sos").eq("client_id", data.clientId).order("priority", { ascending: true }),
    ]);
    if (!client) throw new Error("Client not found");
    return { client, detention: detention ?? null, alerts: alerts ?? [], documents: documents ?? [], contacts: contacts ?? [] };
  });
