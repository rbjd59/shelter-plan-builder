import type { Answers } from "./questions";

export type Results = {
  stayPercent: number; stayBand: "low" | "high"; stayReasons: string[];
  reentryBar: "none" | "3yr" | "10yr" | "permanent" | "unknown"; reentryReasons: string[];
  habeas: "prequalified" | "not_eligible" | "review"; habeasReasons: string[];
  home: "save_my_home" | "trust_899" | "none"; homeReasons: string[];
  business: boolean; businessReasons: string[];
  documents: string[];
};

const has = (a: Answers, k: string, v: string) => { const x = a[k]; return Array.isArray(x) ? x.includes(v) : x === v; };
const num = (a: Answers, k: string) => { const x = Number(a[k]); return Number.isFinite(x) ? x : null; };

export function score(a: Answers): Results {
  // ---- Stay ----
  let p = 3; const sr: string[] = [];
  const active = a.statusEnded === "active" && a.status !== "none" && a.status !== "dk";
  const inspected = a.entry === "inspected" || a.entry === "parole";
  if (active) { p += 12; sr.push("Your papers are still good right now."); }
  if (a.status === "tps") sr.push("TPS protections are ending for many countries. Dates matter a lot.");
  if (inspected && (has(a, "family", "usc_spouse") || has(a, "family", "usc_child21"))) { p += 25; sr.push("You came in legally and have a close U.S. citizen family member. This may let you apply for a green card."); }
  if (a.status === "asylum" && a.asylumTime === "within1") { p += 12; sr.push("You asked for asylum in your first year."); }
  if (a.status === "asylum" && a.asylumTime === "later") sr.push("Asylum asked after the first year is usually late.");
  if (a.years === "10plus" && a.court === "date" && (has(a, "family", "usc_spouse") || has(a, "family", "usc_child") || has(a, "family", "usc_child21") || has(a, "family", "lpr_family"))) { p += 8; sr.push("10+ years here with U.S. family and a court case may allow you to ask a judge to stay."); }
  if (a.entry === "ewi") sr.push("Coming in without being checked makes most options much harder.");
  if (a.crime === "arrest") { p -= 10; sr.push("An arrest can hurt your chances. We need to see the papers."); }
  if (a.court === "final") { p = Math.min(p, 3); sr.push("A judge already ordered you deported. Very few options are left."); }
  if (has(a, "family", "none") || !a.family) sr.push("No U.S. citizen or green card family members.");
  p = Math.max(0, Math.min(90, p));

  // ---- Come back ----
  const rr: string[] = [];
  let unlawful: "lt180" | "180to365" | "gt365" | "unknown" = "unknown";
  if (a.statusEnded === "active") unlawful = "lt180";
  else if (a.statusEnded === "lt6") unlawful = "lt180";
  else if (a.statusEnded === "6to12") unlawful = "180to365";
  else if (a.statusEnded === "gt12") unlawful = "gt365";
  else if (a.status === "none" || a.entry === "ewi") unlawful = a.years === "lt1" ? "unknown" : "gt365";
  let bar: Results["reentryBar"] = "unknown";
  if (a.reentry === "yes") { bar = "permanent"; rr.push("Coming back in without being checked after a deportation or after 1+ year with no papers is a permanent bar (INA 212(a)(9)(C))."); }
  else if (a.priorDeport === "yes") { bar = "10yr"; rr.push("A past deportation usually means a 10-year wait (INA 212(a)(9)(A))."); }
  else if (unlawful === "gt365") { bar = "10yr"; rr.push("More than 1 year here without papers means a 10-year wait after you leave (INA 212(a)(9)(B)(i)(II))."); }
  else if (unlawful === "180to365") { bar = "3yr"; rr.push("6 to 12 months without papers means a 3-year wait after you leave (INA 212(a)(9)(B)(i)(I)). Leaving before 1 year keeps it at 3 years."); }
  else if (unlawful === "lt180") { bar = "none"; rr.push("Less than 6 months without papers. If you leave before 6 months, there is usually no waiting period."); }
  else rr.push("We need more dates to know. We will check for you.");
  if (bar !== "none" && bar !== "permanent" && (has(a, "family", "usc_spouse") || has(a, "family", "lpr_family"))) rr.push("A U.S. citizen or green card spouse or parent may help you ask to skip the wait (waiver).");

  // ---- Habeas ----
  const hr: string[] = []; let habeas: Results["habeas"] = "prequalified";
  if (a.court === "final") { habeas = "not_eligible"; hr.push("With a final deportation order, release by habeas is usually not possible."); }
  else if (a.crime === "arrest" || a.court === "dk") { habeas = "review"; hr.push("The attorney must check your arrest or court papers first."); }
  else hr.push("No final deportation order. If ICE holds you, you may qualify for a habeas corpus petition. We will prepare it now.");

  // ---- Home ----
  const hor: string[] = []; let home: Results["home"] = "none";
  if (a.ownHome === "yes") {
    const v = num(a, "homeValue"), o = num(a, "owed"), m = num(a, "monthly");
    if (v !== null && o !== null && m !== null) {
      const loan = v * 1000 * 0.6 - o * 1000; const need = m * 4;
      if (loan >= need) { home = "save_my_home"; hor.push(`A loan at 60% of the home's value could give about $${Math.round(loan).toLocaleString()} — enough to pay the home for 120 days (about $${need.toLocaleString()}).`); }
      else { home = "trust_899"; hor.push("There is not enough equity for a home loan to cover 120 days. A $899 trust can still protect the home for your family."); }
    } else { home = "trust_899"; hor.push("We need your home numbers. You qualify at least for the $899 trust; we may qualify you for more."); }
    if (a.repairs === "yes") hor.push("Repairs may be needed before renting or selling.");
    if (a.liens === "yes") hor.push("Liens or judgments must be checked.");
  } else hor.push("You do not own a home, so no home trust is needed.");

  // ---- Business ----
  const br: string[] = []; let business = false;
  if (a.trade && a.trade !== "none") {
    business = a.customers === "10to29" || a.customers === "30plus" || a.workers === "1to2" || a.workers === "3plus";
    if (business) br.push("Your work has regular customers. It can become a business you can sell or run from another country.");
    else br.push("With fewer than 10 regular customers and no workers, it is hard to sell. Grow your customer list first.");
    if (a.records === "cash") br.push("We understand this is a cash business and you have not kept records. To sell it or run it from abroad, you must start keeping records now. We will link you to simple tools for this.");
  }

  // ---- Documents ----
  const docs: string[] = ["Authorization for the law firm to get your documents"];
  const noId = has(a, "id", "none") || !a.id;
  if (noId) docs.push("Credible witness ID statement (because you have no ID)", "Help from a paralegal to get a consular ID");
  else docs.push("Power of attorney (needs notary and ID)");
  if (has(a, "kids", "under18") || has(a, "kids", "us_born")) docs.push("School permission for your children", "Doctor permission for your children", "Permission for children to travel / get a passport");
  if (home !== "none") docs.push("Home deed and mortgage statement");
  if (business) docs.push("List of customers and money records");

  return { stayPercent: p, stayBand: p > 15 ? "high" : "low", stayReasons: sr, reentryBar: bar, reentryReasons: rr, habeas, habeasReasons: hr, home, homeReasons: hor, business, businessReasons: br, documents: docs };
}
