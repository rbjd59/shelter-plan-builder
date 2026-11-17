import { expect, it } from "vitest";
import { signTrustDownload, verifyTrustDownload } from "./trust-download.server";
it("binds the download to one client document and source", () => {
  const expires = Date.now() + 10000;
  const signature = signTrustDownload("document-a", "assessment", expires, "test-key");
  expect(verifyTrustDownload("document-a", "assessment", expires, signature, "test-key")).toBe(
    true,
  );
  expect(verifyTrustDownload("document-b", "assessment", expires, signature, "test-key")).toBe(
    false,
  );
  expect(verifyTrustDownload("document-a", "app", expires, signature, "test-key")).toBe(false);
});
it("rejects expired document links", () => {
  const expires = Date.now() - 1000;
  expect(
    verifyTrustDownload(
      "document-a",
      "assessment",
      expires,
      signTrustDownload("document-a", "assessment", expires, "test-key"),
      "test-key",
    ),
  ).toBe(false);
});
