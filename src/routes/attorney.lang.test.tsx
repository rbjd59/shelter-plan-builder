// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { AttorneyPage } from "@/routes/attorney";
import { LanguageProvider } from "@/context/LanguageContext";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function mount(initial: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <LanguageProvider>
        <Outlet />
      </LanguageProvider>
    ),
  });
  const attorney = createRoute({
    getParentRoute: () => rootRoute,
    path: "/attorney",
    component: AttorneyPage,
  });
  const history = createMemoryHistory({ initialEntries: [initial] });
  const router = createRouter({ routeTree: rootRoute.addChildren([attorney]), history });
  const el = document.createElement("div");
  document.body.appendChild(el);
  await act(async () => {
    createRoot(el).render(<RouterProvider router={router} />);
  });
  await act(async () => {
    await new Promise((r) => setTimeout(r, 50));
  });
  return { el, router };
}

async function press(el: HTMLElement, label: string) {
  const btn = [...el.querySelectorAll("button")].find((b) => b.textContent === label);
  expect(btn, `${label} button`).toBeTruthy();
  await act(async () => {
    btn!.click();
    await new Promise((r) => setTimeout(r, 50));
  });
}

describe("attorney page language switcher", () => {
  it("shows the site callback number and Kreyòl in the languages served", async () => {
    const { el } = await mount("/attorney?lang=en");
    expect(el.textContent).toContain("+13057737713");
    expect(el.innerHTML).toContain("tel:+13057737713");
    expect(el.textContent).toContain("Languages served");
    expect(el.textContent).toContain("EN · ES · HT · IT");
    expect(el.textContent).not.toContain("561-757-0338");
    expect(el.textContent).not.toContain("EN · ES · IT");
  });

  it("switches the whole page to Kreyòl and syncs ?lang", async () => {
    const { el, router } = await mount("/attorney?lang=en");
    expect(el.textContent).toContain("Human attorneys on every");
    await press(el, "HT");
    expect(el.textContent).toContain("Avoka moun reyèl sou chak");
    expect(el.textContent).toContain("Lang nou sèvi");
    expect(el.textContent).toContain("kreyòl ayisyen");
    expect(el.textContent).toContain("+13057737713");
    expect(el.textContent).not.toContain("Human attorneys on every");
    expect(router.state.location.search).toMatchObject({ lang: "ht" });
  });

  it("switches the whole page to Spanish from the Kreyòl start", async () => {
    const { el, router } = await mount("/attorney?lang=ht");
    expect(el.textContent).toContain("Avoka moun reyèl sou chak");
    await press(el, "ES");
    expect(el.textContent).toContain("Abogados de verdad en cada");
    expect(el.textContent).toContain("Idiomas que atendemos");
    expect(el.textContent).toContain("kreòl haitiano");
    expect(el.textContent).toContain("+13057737713");
    expect(el.textContent).not.toContain("Avoka moun reyèl sou chak");
    expect(router.state.location.search).toMatchObject({ lang: "es" });
  });
});
