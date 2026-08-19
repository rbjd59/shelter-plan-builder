// Public download of the BLANK family-preparedness authorization forms.
// These are never pre-signed in the app: the client downloads, prints,
// signs, and has them notarized, then leaves them with a trusted family
// member in a sealed envelope to be opened only if detained.
import { createFileRoute } from "@tanstack/react-router";

const TYPES = [
  "blank_power_of_attorney",
  "blank_school_pickup",
  "blank_vehicle_impound_release",
  "blank_bank_account_access",
  "blank_property_access",
] as const;

export const Route = createFileRoute("/api/public/forms/blank")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type") ?? "";
        const langRaw = (url.searchParams.get("lang") ?? "es").toLowerCase();
        const lang = langRaw === "en" || langRaw === "ht" ? langRaw : "es";

        if (!(TYPES as readonly string[]).includes(type)) {
          return new Response("Unknown form", { status: 404 });
        }

        try {
          const { generateBlankForms } = await import("@/lib/blank-forms-pdf");
          const forms = await generateBlankForms(lang);
          const form = forms.find((f) => f.type === type);
          if (!form) return new Response("Unknown form", { status: 404 });

          return new Response(form.bytes as unknown as BodyInit, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${form.filename}"`,
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch (e) {
          console.error("blank form download failed", e);
          return new Response("Form temporarily unavailable", { status: 500 });
        }
      },
    },
  },
});
