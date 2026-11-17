import { expect, it } from "vitest";
import fontSource from "@/assets/forms/DejaVuSans.ttf?inline";

it("loads the inline font asset as a nonempty string", () => {
  expect(typeof fontSource).toBe("string");
  expect(fontSource.length).toBeGreaterThan(0);
});
