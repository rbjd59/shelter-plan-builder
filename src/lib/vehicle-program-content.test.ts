import { describe, expect, it } from "vitest";
import { VEHICLE_PROGRAM_COPY } from "./vehicle-program-content";

const disclosures = {
  en: "The partner dealer pays DetencionDefensa a referral fee for each vehicle it accepts. You pay us nothing, and the fee is not taken from your money. No sale or price is guaranteed beyond the Guaranteed Minimum Price. DetencionDefensa is not a motor vehicle dealer.",
  es: "El concesionario asociado paga a DetencionDefensa una tarifa de referencia por cada vehículo que acepta. Usted no nos paga nada, y la tarifa no se descuenta de su dinero. No se garantiza ninguna venta ni precio más allá del Precio Mínimo Garantizado. DetencionDefensa no es un concesionario de vehículos de motor.",
  ht: "Konsesyonè patnè a peye DetencionDefensa yon frè referans pou chak machin li aksepte. Ou pa peye nou anyen, epi frè a pa retire nan lajan ou. Okenn vant oswa pri pa garanti pi lwen pase Pri Minimòm Garanti a. DetencionDefensa pa yon konsesyonè machin.",
};

describe("vehicle program public copy", () => {
  it.each(["en", "es", "ht"] as const)("keeps all required sections and protections in %s", (lang) => {
    const c = VEHICLE_PROGRAM_COPY[lang];
    expect(c.howSteps).toHaveLength(6);
    expect(c.situations).toHaveLength(3);
    expect(c.protections).toHaveLength(4);
    expect(c.signing).toHaveLength(5);
    expect(c.faqs).toHaveLength(10);
    expect(c.disclosure).toBe(disclosures[lang]);
    expect(c.status).toContain(lang === "en" ? "final attorney review" : lang === "es" ? "revisión legal final" : "dènye revizyon avoka a");
    expect(c.protections[0].body).toContain("$500");
    expect(c.howSteps[3].title).toContain("24");
    expect(c.howSteps[4].title).toContain("48–72");
  });

  it("does not publish a referral fee dollar amount or prohibited sales claims", () => {
    for (const lang of ["en", "es", "ht"] as const) {
      const c = VEHICLE_PROGRAM_COPY[lang];
      expect(c.disclosure).not.toMatch(/\$\d/);
      const all = JSON.stringify(c).toLowerCase();
      expect(all).not.toContain("best price");
      expect(all).not.toContain("no one does better");
      expect(all).not.toContain("safe to go to a tow yard");
    }
  });
});
