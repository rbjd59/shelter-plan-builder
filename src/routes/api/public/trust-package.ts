import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
export const Route = createFileRoute("/api/public/trust-package")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = Object.fromEntries(new URL(request.url).searchParams);
        const parsed = z
          .object({
            id: z.string().uuid(),
            source: z.enum(["assessment", "app"]),
            expires: z.coerce.number().int().positive(),
            signature: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .safeParse(params);
        const key = process.env["LOVABLE_API_KEY"];
        if (!parsed.success || !key) return new Response("Invalid download link.", { status: 403 });
        const { verifyTrustDownload } = await import("@/lib/trust-download.server");
        const p = parsed.data;
        if (!verifyTrustDownload(p.id, p.source, p.expires, p.signature, key))
          return new Response("This link has expired. Ask our team for a new link.", {
            status: 403,
          });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from(p.source === "assessment" ? "assessment_documents" : "client_documents")
          .select("content,document_type")
          .eq("id", p.id)
          .single();
        if (error || !data || data.document_type !== "service_trust")
          return new Response("PDF not found.", { status: 404 });
        const bytes = Buffer.from(data.content, "base64");
        if (bytes.subarray(0, 5).toString() !== "%PDF-")
          return new Response("PDF unavailable.", { status: 422 });
        return new Response(bytes, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="save-my-home-trust-draft.pdf"',
            "Cache-Control": "private, no-store",
            "Referrer-Policy": "no-referrer",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
