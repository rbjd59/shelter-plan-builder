import type { Answers } from "./questions";

/*
 * Rules sources (checked Nov 2026):
 * - Unlawful presence bars: INA 212(a)(9)(B) (3-yr after >180 days, 10-yr after 1+ year), 212(a)(9)(C) permanent
 *   (re-entry without inspection after 1+ yr unlawful presence or after removal), 212(a)(9)(A) removal bars
 *   (5 yr expedited, 10 yr ordered, 20 yr second removal). USCIS "Unlawful Presence and Inadmissibility".
 *   No unlawful presence accrues under 18 or while a bona fide asylum application is pending.
 * - TPS: as of fall 2026 only El Salvador, Lebanon, Sudan and Ukraine remain designated; CHNV parole terminated May 2025.
 * - Habeas / bond: 9 of 11 circuits reject Matter of Yajure Hurtado mandatory detention for EWI interior arrests;
 *   the 5th (TX, LA, MS) and 8th (AR, IA, MN, MO, NE, ND, SD) follow it. Supreme Court granted cert Oct 1, 2026.
 *   A final order of removal generally ends habeas release eligibility (owner rule).
 */

export type Results = {
  stayPercent: number; stayBand: "low" | "high"; stayReasons: string[];
  reentryBar: "none" | "3yr" | "5yr" | "10yr" | "20yr" | "permanent" | "unknown"; reentryReasons: string[];
  habeas: "prequalified" | "not_eligible" | "review"; habeasReasons: string[];
  home: "save_my_home" | "trust_899" | "none"; homeReasons: string[];
  business: boolean; businessReasons: string[];
  documents: string[];
};

const has = (a: Answers, k: string, v: string) => { const x = a[k]; return Array.isArray(x) ? x.includes(v) : x === v; };
const num = (a: Answers, k: string) => { const x = Number(a[k]); return Number.isFinite(x) ? x : null; };

export const TPS_STILL_ACTIVE = new Set(["el_salvador"]);
export const ANTI_BOND_STATES = new Set(["texas", "louisiana", "mississippi", "arkansas", "iowa", "minnesota", "missouri", "nebraska", "north_dakota", "south_dakota"]);

const BAR_RANK = { none: 0, unknown: 0, "3yr": 1, "5yr": 2, "10yr": 3, "20yr": 4, permanent: 5 } as const;

export function score(a: Answers): Results {
  const final = a.court === "final" || a.now === "missed";
  const lawfulEntry = a.entry === "visa" || a.entry === "released" || a.entry === "parole";
  const uscClose = has(a, "family", "usc_spouse") || has(a, "family", "usc_child21") || has(a, "family", "usc_parent");
  const anyQualRel = uscClose || has(a, "family", "usc_child") || has(a, "family", "lpr_spouse_parent");
  const special = ["crime_victim", "abuse", "minor", "trafficking"].some((v) => has(a, "special", v));
  const statusActive = a.now === "active" || (has(a, "papers", "tps") && TPS_STILL_ACTIVE.has(String(a.country)) && a.now !== "tps_ended");

  // ---- Can I stay ----
  let p = 2; const sr: string[] = [];
  if (statusActive) { p += 10; sr.push("Your papers are still good right now. That can change, so watch the end date."); }
  if (has(a, "papers", "tps") && !statusActive) sr.push("TPS has ended for most countries (Haiti, Venezuela, Honduras, Nicaragua and others). It does not give you a green card by itself.");
  if (a.country === "cuba" && lawfulEntry && a.years !== "lt1") { p += 40; sr.push("Cubans who came in legally or with parole and lived here 1 year may get a green card (Cuban Adjustment Act)."); }
  if (lawfulEntry && uscClose) { p += 35; sr.push("You came in legally or with parole and have a close U.S. citizen family member (spouse, parent or child 21+). You may be able to get a green card here."); }
  if (has(a, "papers", "asylum") && a.asylumTime === "within1") { p += 12; sr.push("You asked for asylum in your first year. Your case can still be heard."); }
  if (has(a, "papers", "asylum") && a.asylumTime === "later") sr.push("Asylum asked after the first year is usually too late, except in special cases.");
  if (special) { p += 20; sr.push("What happened to you may qualify you for special papers (crime victim, abuse, trafficking or abused child visas)."); }
  if (a.years === "10plus" && a.court === "pending" && anyQualRel && a.crime !== "convicted") { p += 8; sr.push("10+ years here, a court case, and U.S. family may let you ask a judge to stay (very hard to win)."); }
  if (a.entry === "ewi") { sr.push("You crossed without being checked. You cannot get a green card here through family; you would have to leave first."); if (uscClose) p += 3; }
  if (a.crime === "convicted") { p -= 15; sr.push("A crime conviction hurts most options. The attorney must see your papers."); }
  else if (a.crime === "arrest") { p -= 5; sr.push("An arrest can hurt. The attorney must see your papers."); }
  if (final) { p = Math.min(p, special ? 10 : 3); sr.push(a.now === "missed" ? "Missing court can mean a judge ordered you deported without you there." : "A judge already ordered you deported. Very few options are left."); }
  if (!anyQualRel && !special && !lawfulEntry) sr.push("No U.S. citizen or green card family and no special case.");
  p = Math.max(0, Math.min(90, p));

  // ---- Can I come back ----
  const rr: string[] = [];
  const asylumPending = has(a, "papers", "asylum") && a.now !== "denied";
  let up: "lt180" | "180to365" | "gt365" | "none" | "unknown" = "unknown";
  if (statusActive || a.now === "checkin" || asylumPending) up = "none";
  else if (a.ended === "lt180" || a.ended === "180to365" || a.ended === "gt365") up = a.ended;
  else if (a.entry === "ewi" || has(a, "papers", "none")) up = a.years === "lt1" ? "180to365" : "gt365";
  if (a.minorTime === "yes") { rr.push("Time before age 18 does not count. The attorney will count your days."); if (up !== "none") up = "unknown"; }
  if (asylumPending) rr.push("While your asylum case is waiting, the no-papers clock usually does not run.");

  let bar: Results["reentryBar"] = up === "none" || up === "lt180" ? "none" : up === "180to365" ? "3yr" : up === "gt365" ? "10yr" : "unknown";
  const raise = (b: Results["reentryBar"]) => { if (BAR_RANK[b] > BAR_RANK[bar]) bar = b; };
  if (up === "lt180") rr.push("Less than 6 months without papers. If you leave before 6 months, you can usually come back without a wait.");
  if (up === "180to365") rr.push("6 months to 1 year without papers: if you leave, you wait 3 years to come back. Leave before the 1-year mark so it does not become 10 years.");
  if (up === "gt365") rr.push("More than 1 year without papers (counted from when your TPS, parole or visa ended): if you leave, you wait 10 years to come back.");
  if (a.removed === "border") { raise("5yr"); rr.push("Sent back fast at the border: 5-year wait."); }
  if (a.removed === "judge") { raise("10yr"); rr.push("Deported by a judge: 10-year wait."); }
  if (a.removed === "twice") { raise("20yr"); rr.push("Deported 2 or more times: 20-year wait."); }
  if (a.sneakBack === "yes" && (up === "gt365" || (a.removed && a.removed !== "never" && a.removed !== "dk"))) { raise("permanent"); rr.push("You came back in without being checked after 1+ year without papers or after a deportation. That is a permanent bar: you must live outside the U.S. 10 years before you can even ask to come back."); }
  if (a.crime === "convicted") rr.push("Some crimes can block you from ever coming back. The attorney will check.");
  if (["3yr", "10yr"].includes(bar) && (has(a, "family", "usc_spouse") || has(a, "family", "usc_parent") || has(a, "family", "lpr_spouse_parent"))) rr.push("A U.S. citizen or green card husband, wife or parent may let you ask to skip the wait (waiver). Children do not count for this.");
  if (bar === "unknown" && rr.length === 0) rr.push("We need more dates to know. We will check for you.");

  // ---- Habeas ----
  const hr: string[] = []; let habeas: Results["habeas"] = "prequalified";
  const antiBond = ANTI_BOND_STATES.has(String(a.state));
  if (final) { habeas = "not_eligible"; hr.push("With a final deportation order, release by habeas corpus is usually not possible."); }
  else {
    if (a.court === "dk" || a.crime === "convicted" || a.crime === "arrest" || a.now === "dk") { habeas = "review"; hr.push("The attorney must check your court and arrest papers first."); }
    else hr.push("No final deportation order, so a federal judge may order your release or a bond hearing. We will prepare your habeas corpus now, so it is ready if ICE picks you up.");
    if (antiBond) { if (habeas === "prequalified") habeas = "review"; hr.push("Your state's federal appeals court (5th or 8th Circuit) says people who crossed without papers can be held with no bond. Chances are lower here."); }
    else hr.push("Federal courts in your area (9 of 11 appeals courts, including Florida) have ruled that people arrested inside the U.S. can get a bond hearing. The Supreme Court will decide this in 2027.");
    if (a.now === "tps_ended" || a.now === "parole_ended") hr.push("Your TPS or parole ended, so ICE treats you as having no papers. That is when habeas is needed.");
    hr.push("ICE often moves people to Texas or Louisiana. Where you are held decides which court rules apply, so we file fast.");
  }

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
  if (has(a, "id", "none") || !a.id) docs.push("Credible witness ID statement (because you have no ID)", "Help from a paralegal to get a consular ID");
  else docs.push("Power of attorney (needs notary and ID)");
  if (has(a, "kids", "under18") || has(a, "kids", "us_born")) docs.push("School permission for your children", "Doctor permission for your children", "Permission for children to travel / get a passport");
  if (home !== "none") docs.push("Home deed and mortgage statement");
  if (business) docs.push("List of customers and money records");

  return { stayPercent: p, stayBand: p > 15 ? "high" : "low", stayReasons: sr, reentryBar: bar, reentryReasons: rr, habeas, habeasReasons: hr, home, homeReasons: hor, business, businessReasons: br, documents: docs };
}
