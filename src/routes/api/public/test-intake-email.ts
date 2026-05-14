// TEMP: trigger end-to-end intake test via HTTP. Remove after verification.
import { createFileRoute } from "@tanstack/react-router";
import { runFullIntakeTest } from "@/lib/test-full-intake.functions";

export const Route = createFileRoute("/api/public/test-intake-email")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const email = url.searchParams.get("email") || "rbjd@dr.com";
        const result = await runFullIntakeTest({ data: { email } });
        return new Response(JSON.stringify(result, null, 2), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
