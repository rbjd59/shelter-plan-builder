import { createServerFn } from "@tanstack/react-start";
import { assessLegalScreening, screeningSchema } from "./legal-screening";

// Public, deterministic assessment only: no identity, persistence or notifications.
export const assessScreening = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => screeningSchema.parse(input))
  .handler(async ({ data }) => assessLegalScreening(data));