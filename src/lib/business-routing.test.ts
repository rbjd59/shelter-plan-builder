import { describe, expect, it } from "vitest";
import { businessRootRedirect } from "./business-config";

describe("business domain routing", () => {
  it.each(["donotforgetyourbusiness.com", "www.donotforgetyourbusiness.com"])(
    "sends the %s root to the business landing page without losing language",
    (host) => {
      expect(businessRootRedirect(`https://${host}/?lang=ht`)?.toString()).toBe(
        `https://${host}/business?lang=ht`,
      );
    },
  );

  it("does not redirect the business landing page again", () => {
    expect(businessRootRedirect("https://donotforgetyourbusiness.com/business?lang=es")).toBeNull();
  });

  it.each(["detenciondefensa.com", "listoahora.org", "parekounya.org"])(
    "leaves the %s defense homepage unchanged",
    (host) => {
      expect(businessRootRedirect(`https://${host}/?lang=en`)).toBeNull();
    },
  );
});
