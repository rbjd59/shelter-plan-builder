import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-app-signature",
};

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

// Empty strings / null from unfilled form fields are treated as "not provided"
// instead of failing validation with a 400.
const blankToUndef = (v: unknown) =>
  v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;
const optText = (max: number) =>
  z.preprocess(blankToUndef, z.string().trim().min(1).max(max).optional());

const UpdateRequestSchema = z
  .object({
    token: z.string().min(1).max(64).optional(),
    case_id: z.string().min(1).max(64).optional(),
    requested_at: z.string().max(64).optional(),
    client_phone: optText(40),
    client_address: optText(300),
    a_number: optText(40),
    immigration_status: optText(120),
    contact_name: optText(120),
    contact_phone: optText(40),
    cancellation_pin: z.preprocess(blankToUndef, z.string().regex(/^\d{4}$/).optional()),
    notes: z.preprocess(blankToUndef, z.string().trim().max(2000).optional()),
    // legacy shape
    changes: z.record(z.string(), z.unknown()).optional(),
    note: z.string().max(2000).optional(),
  })
  .passthrough();

export const Route = createFileRoute("/api/public/app-update-request")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-app-signature") ?? "";
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          return json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = UpdateRequestSchema.safeParse(parsedBody);
        if (!parsed.success) {
          console.warn("[app-update-request] validation failed", JSON.stringify(parsed.error.flatten()));
          return json({ ok: false, error: "invalid_request", details: parsed.error.flatten() }, { status: 400 });
        }
        const d = parsed.data;

        const caseId = (d.case_id ?? d.token ?? "").trim().toUpperCase();
        if (!/^[A-Z0-9]{5,8}$/.test(caseId)) {
          console.warn("[app-update-request] invalid case id", JSON.stringify(caseId));
          return json({ ok: false, error: "invalid_case_id" }, { status: 400 });
        }
        if (!signature) {
          return json({ ok: false, error: "missing_signature" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: signatureData, error: signatureError } = await supabaseAdmin.rpc(
          "verify_app_trigger_signature" as never,
          { _token: caseId, _body: rawBody, _signature: signature } as never,
        );
        if (signatureError || (signatureData as { ok?: boolean } | null)?.ok !== true) {
          return json({ ok: false, error: "bad_signature" }, { status: 401 });
        }

        const { data: client, error: clientError } = await supabaseAdmin
          .from("app_clients")
          .select("id, cancel_pin_plain")
          .eq("invite_token", caseId)
          .maybeSingle();
        if (clientError || !client) {
          return json({ ok: false, error: "invalid_case_id" }, { status: 404 });
        }
        const clientId = (client as { id: string }).id;
        let cancellationPin =
          (client as { cancel_pin_plain: string | null }).cancel_pin_plain ?? null;

        // Fields the client actually filled in (flat shape) + legacy `changes`.
        const legacy = (d.changes ?? {}) as Record<string, unknown>;
        const pick = (k: keyof typeof d): string | undefined => {
          const v = (d[k] ?? legacy[k as string]) as string | undefined;
          return typeof v === "string" && v.trim() ? v.trim() : undefined;
        };
        const changes: Record<string, string> = {};
        for (const key of [
          "client_phone",
          "client_address",
          "a_number",
          "immigration_status",
          "contact_name",
          "contact_phone",
          "cancellation_pin",
        ] as const) {
          const v = pick(key);
          if (v) changes[key] = v;
        }
        const notes = pick("notes") ?? pick("note" as never) ?? null;

        const applied: string[] = [];

        // 1. Client record fields
        const patch: Record<string, unknown> = {};
        if (changes["client_phone"]) patch["phone_e164"] = changes["client_phone"];
        if (changes["a_number"]) patch["a_number"] = changes["a_number"];
        if (Object.keys(patch).length > 0) {
          const { error } = await supabaseAdmin
            .from("app_clients")
            .update(patch as never)
            .eq("id", clientId);
          if (error) {
            console.error("[app-update-request] client update failed", error);
            return json({ ok: false, error: "client_update_failed" }, { status: 500 });
          }
          applied.push(...Object.keys(changes).filter((k) => k === "client_phone" || k === "a_number"));
        }

        // 2. Family contact (only ever the app-editable family contact —
        //    never the intake emergency contact, whose real number must survive)
        if (changes["contact_name"] || changes["contact_phone"]) {
          const { data: existing } = await supabaseAdmin
            .from("client_contacts")
            .select("id")
            .eq("client_id", clientId)
            .eq("role", "family")
            .order("priority", { ascending: true })
            .limit(1);
          const row = (existing ?? [])[0] as { id: string } | undefined;
          const contactPatch: Record<string, unknown> = {};
          if (changes["contact_name"]) contactPatch["name"] = changes["contact_name"];
          if (changes["contact_phone"]) contactPatch["phone_e164"] = changes["contact_phone"];
          if (row) {
            await supabaseAdmin
              .from("client_contacts")
              .update(contactPatch as never)
              .eq("id", row.id);
          } else {
            await supabaseAdmin.from("client_contacts").insert({
              client_id: clientId,
              name: changes["contact_name"] ?? "Family contact",
              phone_e164: changes["contact_phone"] ?? null,
              relationship: "family",
              priority: 90,
              notify_on_sos: true,
              role: "family",
            } as never);
          }
          applied.push("family_contact");
        }


        // 3. Cancellation PIN
        if (changes["cancellation_pin"]) {
          const pin = changes["cancellation_pin"]!;
          const { error: pinErr } = await supabaseAdmin.rpc(
            "set_sos_cancel_pin_admin" as never,
            { _client_id: clientId, _pin: pin } as never,
          );
          if (pinErr) {
            console.error("[app-update-request] pin update failed", pinErr);
            return json({ ok: false, error: "pin_update_failed" }, { status: 500 });
          }
          await supabaseAdmin
            .from("app_clients")
            .update({ cancel_pin_plain: pin } as never)
            .eq("id", clientId);
          cancellationPin = pin;
          applied.push("cancellation_pin");
        }

        // 4. Board record (attorney + company boards read this table)
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("client_update_requests")
          .insert({
            client_id: clientId,
            source: "phone_app",
            status: applied.length > 0 ? "applied" : "pending",
            notes,
            request_payload: {
              case_id: caseId,
              requested_at: d.requested_at ?? new Date().toISOString(),
              changes,
              notes,
              applied,
              received_at: new Date().toISOString(),
            },
          } as never)
          .select("id")
          .single();

        if (insertError) {
          console.error("[app-update-request] insert failed", insertError);
          return json({ ok: false, error: "request_insert_failed" }, { status: 500 });
        }

        return json({
          ok: true,
          request_id: (inserted as { id: string }).id,
          applied,
          cancellation_pin: cancellationPin,
        });
      },
    },
  },
});
