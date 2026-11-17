// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import BusinessSite from "@/components/BusinessSite";
import { LanguageProvider } from "@/context/LanguageContext";
import { BUSINESS_SITE_COPY } from "@/lib/business-site-content";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("business language switcher", () => {
  it("switches body heading and footer disclosure when Español is pressed, and syncs ?lang", async () => {
    const rootRoute = createRootRoute({ component: () => <LanguageProvider><Outlet /></LanguageProvider> });
    const business = createRoute({ getParentRoute: () => rootRoute, path: "/business", component: BusinessSite });
    const intake = createRoute({ getParentRoute: () => rootRoute, path: "/business-intake", component: () => null });
    const history = createMemoryHistory({ initialEntries: ["/business?lang=en"] });
    const router = createRouter({ routeTree: rootRoute.addChildren([business, intake]), history });
    const el = document.createElement("div");
    document.body.appendChild(el);
    await act(async () => { createRoot(el).render(<RouterProvider router={router} />); });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    const en = BUSINESS_SITE_COPY.en, es = BUSINESS_SITE_COPY.es;
    expect(el.textContent).toContain(en.tradesTitle);
    expect(el.textContent).toContain(en.disclosures[0]);
    const btn = [...el.querySelectorAll("button")].find((b) => b.textContent === "Español")!;
    await act(async () => { btn.click(); await new Promise((r) => setTimeout(r, 50)); });
    expect(el.textContent).toContain(es.tradesTitle);
    expect(el.textContent).toContain(es.disclosures[0]);
    expect(el.textContent).not.toContain(en.tradesTitle);
    expect(router.state.location.search).toMatchObject({ lang: "es" });
  });
});
