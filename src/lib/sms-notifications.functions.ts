import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  intakeSessionId: z.string().min(1),
  contactPhone: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  inviteCode: z.string().optional().nullable(),
});

export const sendIntakeNotifications = createServerFn({ method: "POST" })
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }) => {
    const { sendIntakeConfirmationSms, sendStaffNewIntakeAlert } =
      await import("./sms-notifications.server");

    const results = await Promise.allSettled([
      sendIntakeConfirmationSms({
        phone: data.contactPhone ?? null,
        language: data.language ?? null,
        inviteCode: data.inviteCode ?? null,
        intakeSessionId: data.intakeSessionId,
      }),
      sendStaffNewIntakeAlert({
        clientName: data.contactName ?? null,
        intakeSessionId: data.intakeSessionId,
        language: data.language ?? null,
      }),
    ]);

    return {
      clientSms: results[0].status === "fulfilled" ? "ok" : "failed",
      staffSms: results[1].status === "fulfilled" ? "ok" : "failed",
    };
  });
