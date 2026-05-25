import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- helper: assert caller is admin ----------
async function assertAdmin(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Not authorized");
  // resolve email for audit trail
  const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
  return u?.user?.email ?? userId;
}

// ---------- Am I admin? (for layout gate) ----------
export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

// ---------- Dashboard stats ----------
export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const sinceToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

    const [views, refs, signupsToday, triggeredToday, mailedToday, pending] = await Promise.all([
      supabaseAdmin
        .from("page_views")
        .select("created_at")
        .gte("created_at", since30),
      supabaseAdmin
        .from("page_views")
        .select("referrer")
        .gte("created_at", since30),
      supabaseAdmin
        .from("intake_submissions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sinceToday),
      supabaseAdmin
        .from("emergency_activations")
        .select("id", { count: "exact", head: true })
        .gte("fired_at", sinceToday),
      supabaseAdmin
        .from("case_action_log")
        .select("id", { count: "exact", head: true })
        .eq("step", "package_mailed")
        .gte("created_at", sinceToday),
      supabaseAdmin
        .from("emergency_activations")
        .select("id, intake_session_id, fired_at, full_name, cancelled_at")
        .is("cancelled_at", null)
        .order("fired_at", { ascending: true })
        .limit(100),
    ]);

    // Build per-day view counts
    const dayMap = new Map<string, number>();
    for (const r of views.data ?? []) {
      const d = (r.created_at as string).slice(0, 10);
      dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
    const dailyViews = Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Referrer breakdown
    const refMap = new Map<string, number>();
    for (const r of refs.data ?? []) {
      let key = "Direct";
      const ref = (r.referrer as string | null) ?? "";
      if (ref) {
        try {
          key = new URL(ref).hostname.replace(/^www\./, "");
        } catch {
          key = ref.slice(0, 40);
        }
      }
      refMap.set(key, (refMap.get(key) ?? 0) + 1);
    }
    const referrers = Array.from(refMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    // Pending action queue — triggered but checklist incomplete
    const sessionIds = (pending.data ?? []).map((p) => p.intake_session_id);
    const REQUIRED = ["forms_sent", "client_located", "package_mailed", "package_received"];
    let actions: { intake_session_id: string; step: string }[] = [];
    if (sessionIds.length) {
      const { data } = await supabaseAdmin
        .from("case_action_log")
        .select("intake_session_id, step")
        .in("intake_session_id", sessionIds);
      actions = data ?? [];
    }
    const doneBySession = new Map<string, Set<string>>();
    for (const a of actions) {
      if (!doneBySession.has(a.intake_session_id)) doneBySession.set(a.intake_session_id, new Set());
      doneBySession.get(a.intake_session_id)!.add(a.step);
    }
    const pendingQueue = (pending.data ?? [])
      .map((p) => {
        const done = doneBySession.get(p.intake_session_id) ?? new Set<string>();
        const missing = REQUIRED.filter((s) => !done.has(s));
        return {
          id: p.id,
          intake_session_id: p.intake_session_id,
          fired_at: p.fired_at,
          name: p.full_name ?? "(no name)",
          completed: REQUIRED.length - missing.length,
          total: REQUIRED.length,
          missing,
        };
      })
      .filter((p) => p.missing.length > 0);

    return {
      dailyViews,
      referrers,
      totals: {
        viewsLast30: (views.data ?? []).length,
        signupsToday: signupsToday.count ?? 0,
        triggeredToday: triggeredToday.count ?? 0,
        mailedToday: mailedToday.count ?? 0,
        pending: pendingQueue.length,
      },
      pendingQueue,
    };
  });

// ---------- List clients ----------
export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: subs } = await supabaseAdmin
      .from("intake_submissions")
      .select("id, stripe_session_id, email, language, paid, created_at, answers")
      .order("created_at", { ascending: false })
      .limit(500);
    const sessionIds = (subs ?? []).map((s) => s.stripe_session_id).filter(Boolean) as string[];
    let triggers: { intake_session_id: string; fired_at: string; cancelled_at: string | null }[] = [];
    if (sessionIds.length) {
      const { data } = await supabaseAdmin
        .from("emergency_activations")
        .select("intake_session_id, fired_at, cancelled_at")
        .in("intake_session_id", sessionIds);
      triggers = data ?? [];
    }
    const trigBySession = new Map(triggers.map((t) => [t.intake_session_id, t]));
    return {
      clients: (subs ?? []).map((s) => {
        const t = trigBySession.get(s.stripe_session_id);
        const answers = (s.answers as Record<string, unknown>) ?? {};
        const status = t?.cancelled_at
          ? "cancelled"
          : t
            ? "triggered"
            : s.paid
              ? "signed_up"
              : "unpaid";
        return {
          id: s.id,
          intake_session_id: s.stripe_session_id,
          email: s.email,
          language: s.language,
          name:
            (answers.mail_inmate_name as string) ||
            (answers.full_name as string) ||
            (answers.contact_name as string) ||
            "(no name)",
          a_number: (answers.a_number as string) ?? null,
          created_at: s.created_at,
          status,
          triggered_at: t?.fired_at ?? null,
        };
      }),
    };
  });

// ---------- Get one client + action log ----------
export const getClientDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { data: sub, error } = await supabaseAdmin
      .from("intake_submissions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!sub) throw new Error("Client not found");
    const sessionId = sub.stripe_session_id;
    const [{ data: trigger }, { data: actions }] = await Promise.all([
      supabaseAdmin
        .from("emergency_activations")
        .select("*")
        .eq("intake_session_id", sessionId)
        .order("fired_at", { ascending: false })
        .maybeSingle(),
      supabaseAdmin
        .from("case_action_log")
        .select("*")
        .eq("intake_session_id", sessionId)
        .order("created_at", { ascending: true }),
    ]);
    return { submission: sub, trigger, actions: actions ?? [] };
  });

// ---------- Add an action ----------
export const recordCaseAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      intake_session_id: z.string().min(1),
      step: z.enum(["forms_sent", "client_located", "package_mailed", "package_received", "reminder_sent", "note"]),
      metadata: z.record(z.string(), z.any()).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const email = await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("case_action_log").insert({
      intake_session_id: data.intake_session_id,
      step: data.step,
      completed_by: email,
      metadata: data.metadata ?? {},
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- List triggers ----------
export const listTriggers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("emergency_activations")
      .select("*")
      .order("fired_at", { ascending: false })
      .limit(500);
    return { triggers: data ?? [] };
  });

// ---------- Signups needing reminder ----------
export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: subs } = await supabaseAdmin
      .from("intake_submissions")
      .select("id, stripe_session_id, email, created_at, answers")
      .eq("paid", true)
      .order("created_at", { ascending: false })
      .limit(500);
    const sessionIds = (subs ?? []).map((s) => s.stripe_session_id).filter(Boolean) as string[];
    let triggers: string[] = [];
    if (sessionIds.length) {
      const { data } = await supabaseAdmin
        .from("emergency_activations")
        .select("intake_session_id")
        .in("intake_session_id", sessionIds);
      triggers = (data ?? []).map((t) => t.intake_session_id);
    }
    const triggeredSet = new Set(triggers);
    let reminders: { intake_session_id: string; created_at: string }[] = [];
    if (sessionIds.length) {
      const { data } = await supabaseAdmin
        .from("case_action_log")
        .select("intake_session_id, created_at")
        .eq("step", "reminder_sent")
        .in("intake_session_id", sessionIds);
      reminders = data ?? [];
    }
    const lastReminder = new Map<string, string>();
    for (const r of reminders) {
      const cur = lastReminder.get(r.intake_session_id);
      if (!cur || cur < r.created_at) lastReminder.set(r.intake_session_id, r.created_at);
    }

    return {
      candidates: (subs ?? [])
        .filter((s) => s.stripe_session_id && !triggeredSet.has(s.stripe_session_id) && s.email)
        .map((s) => {
          const answers = (s.answers as Record<string, unknown>) ?? {};
          const daysSinceSignup = Math.floor((Date.now() - new Date(s.created_at).getTime()) / 86400000);
          const lastSentIso = lastReminder.get(s.stripe_session_id!) ?? null;
          const daysSinceReminder = lastSentIso
            ? Math.floor((Date.now() - new Date(lastSentIso).getTime()) / 86400000)
            : null;
          return {
            id: s.id,
            intake_session_id: s.stripe_session_id!,
            email: s.email!,
            name:
              (answers.contact_name as string) ||
              (answers.mail_inmate_name as string) ||
              "(no name)",
            daysSinceSignup,
            daysSinceReminder,
            lastSentIso,
          };
        })
        .filter((c) => c.daysSinceReminder == null || c.daysSinceReminder >= 7),
    };
  });

// ---------- Send reminder email ----------
export const sendReminderEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      intake_session_id: z.string(),
      email: z.string().email(),
      name: z.string(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const adminEmail = await assertAdmin(context.userId);
    const messageId = crypto.randomUUID();
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;background:#fff;padding:24px;">
      <div style="max-width:560px;margin:0 auto;">
        <h2 style="color:#0b1220;margin-top:0;">Hola ${data.name},</h2>
        <p>Te recordamos que tu Plan de Defensa con DetencionDefensa.com está activo, pero <strong>aún no has descargado la aplicación móvil</strong>.</p>
        <p>La aplicación es lo que activa tu plan si ICE te detiene. <strong>Sin la app, no podemos ayudarte el día que más lo necesites.</strong></p>
        <p style="margin:24px 0;"><a href="https://detenciondefensa.com/app" style="background:#e8a04a;color:#0b1220;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:700;">Descargar la app ahora</a></p>
        <p style="font-size:12px;color:#666;">— Equipo Legal de DetencionDefensa.com</p>
      </div>
    </body></html>`;
    const payload = {
      to: data.email,
      from: "legal@detenciondefensa.com",
      sender_domain: "notify.gohomesooner.com",
      subject: "Recordatorio: descarga tu app de defensa",
      html,
      text: `Hola ${data.name}, recuerda descargar la app de DetencionDefensa.com: https://detenciondefensa.com/app`,
      purpose: "transactional",
      label: "signup-reminder",
      idempotency_key: `reminder-${data.intake_session_id}-${Date.now()}`,
      message_id: messageId,
      queued_at: new Date().toISOString(),
    };
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: "signup-reminder",
      recipient_email: data.email,
      status: "pending",
    });
    const { error } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: payload as never,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("case_action_log").insert({
      intake_session_id: data.intake_session_id,
      step: "reminder_sent",
      completed_by: adminEmail,
      metadata: { email: data.email, message_id: messageId },
    });
    return { ok: true };
  });
