import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({ lang: z.enum(["en", "es", "ht"]).catch("es") });

// Demo mode: checkout is disabled. Send everyone straight to the intake form.
export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/intake", search: { lang: search.lang } });
  },
  component: () => null,
});
