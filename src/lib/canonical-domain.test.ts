import { describe, expect, it } from "vitest";
import { canonicalAliasUrl } from "./canonical-domain";

describe("canonical language-domain redirects", () => {
  it.each(["listoahora.org", "www.listoahora.org"])(
    "redirects %s to the Spanish canonical site",
    (host) => {
      expect(canonicalAliasUrl(`https://${host}/intake?ref=church`)?.toString()).toBe(
        "https://detenciondefensa.com/intake?ref=church&lang=es",
      );
    },
  );

  it.each(["parekounya.org", "www.parekounya.org"])(
    "redirects %s to the Haitian Creole canonical site",
    (host) => {
      expect(canonicalAliasUrl(`https://${host}/support?lang=en`)?.toString()).toBe(
        "https://detenciondefensa.com/support?lang=ht",
      );
    },
  );

  it("does not redirect the canonical site", () => {
    expect(canonicalAliasUrl("https://detenciondefensa.com/?lang=en")).toBeNull();
  });
});