import { it } from "vitest";
import bytes from "@/assets/forms/DejaVuSans.ttf?inline";
it("inspect", () => {
  console.log("FONT", typeof bytes, Object.prototype.toString.call(bytes), (bytes as ArrayBuffer).byteLength, String(bytes).slice(0,100));
});
