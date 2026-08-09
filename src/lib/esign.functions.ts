// Client-callable RPC for the blank-form e-signature flow.
import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

const codeOk = (c: unknown) => typeof c === "string" && c.trim().length >= 6 && c.trim().length <= 40;

export const loadSigningPacketFn = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => {
    if (!codeOk(input?.code)) throw new Error("Invalid code");
    return { code: input.code.trim() };
  })
  .handler(async ({ data }) => {
    const { loadSigningPacket } = await import("@/lib/esign.server");
    return loadSigningPacket(data.code);
  });

export const setPrimaryContactFn = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; contactId: string }) => {
    if (!codeOk(input?.code)) throw new Error("Invalid code");
    if (typeof input?.contactId !== "string" || input.contactId.length < 8) throw new Error("Invalid contact");
    return { code: input.code.trim(), contactId: input.contactId };
  })
  .handler(async ({ data }) => {
    const { setPrimaryContact } = await import("@/lib/esign.server");
    return setPrimaryContact(data.code, data.contactId);
  });

export const signBlankFormsFn = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; types: string[]; signatureDataUrl: string; typedName: string }) => {
    if (!codeOk(input?.code)) throw new Error("Invalid code");
    if (!Array.isArray(input?.types) || input.types.length === 0) throw new Error("Pick at least one form");
    if (input.types.some((t) => typeof t !== "string" || !t.startsWith("blank_"))) throw new Error("Invalid form");
    if (typeof input?.signatureDataUrl !== "string" || !input.signatureDataUrl.startsWith("data:image/png;base64,")) {
      throw new Error("Missing signature");
    }
    if (input.signatureDataUrl.length > 2_000_000) throw new Error("Signature too large");
    if (typeof input?.typedName !== "string" || input.typedName.trim().length < 3) throw new Error("Type your full legal name");
    return {
      code: input.code.trim(),
      types: input.types.slice(0, 10),
      signatureDataUrl: input.signatureDataUrl,
      typedName: input.typedName.trim().slice(0, 120),
    };
  })
  .handler(async ({ data }) => {
    const { signBlankForms } = await import("@/lib/esign.server");
    let ip: string | null = null;
    try {
      ip =
        getRequestHeader("cf-connecting-ip") ??
        (getRequestHeader("x-forwarded-for") ?? "").split(",")[0].trim() ??
        null;
      if (!ip) ip = null;
    } catch {
      ip = null;
    }
    let userAgent: string | null = null;
    try {
      userAgent = getRequest().headers.get("user-agent");
    } catch {
      userAgent = null;
    }
    return signBlankForms({ ...data, ip, userAgent });
  });

export const getFormPdfFn = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string; documentType: string }) => {
    if (!codeOk(input?.code)) throw new Error("Invalid code");
    if (typeof input?.documentType !== "string" || !input.documentType.startsWith("blank_")) throw new Error("Invalid form");
    return { code: input.code.trim(), documentType: input.documentType };
  })
  .handler(async ({ data }) => {
    const { getFormPdf } = await import("@/lib/esign.server");
    const doc = await getFormPdf(data.code, data.documentType);
    if (!doc) throw new Error("Not found");
    return doc;
  });
