import { createStart, createMiddleware } from "@tanstack/react-start";

import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { canonicalAliasUrl } from "@/lib/canonical-domain";
import { renderErrorPage } from "./lib/error-page";

const canonicalDomainMiddleware = createMiddleware().server(async ({ request, next }) => {
  const destination = canonicalAliasUrl(request.url);
  if (destination) {
    return Response.redirect(destination.toString(), 308);
  }
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ request, next }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/lovable/")) {
    return next();
  }
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [canonicalDomainMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
