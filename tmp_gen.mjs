import { buildIntakePdfs } from "./src/lib/email/intake-pdfs.server.ts";
import fs from "fs";
const answers = {
  full_name: "Juan Carlos Hernandez",
  other_names_used: "J. Hernandez",
  facility_name: "Krome North Service Processing Center",
  facility_address: "18201 SW 12th St, Miami, FL 33194",
  booking_number: "A123456789",
  a_number: "A123456789",
  warden_name: "Smith",
  warden_title: "Warden",
  date_taken_into_custody: "2026-03-15",
  detainer_date: "2026-04-01",
  court_district: "Florida Southern",
  prior_immigration_proceedings: "Petitioner has been in ICE custody for over 90 days following a removal order. He has no criminal convictions, has strong family ties in the community including a US-citizen wife and two children, and has been employed in construction for 8 years. He is not a flight risk and not a danger to the community.",
  ground_one: "I am not convicted of a serious crime making me deportable. I am not a danger to the community. I am not a flight risk.",
  ground_two: "Other: My country is not currently accepting deportees and ICE has no reasonable likelihood of removal in the foreseeable future.",
  relief_requested: "Petitioner respectfully requests that this Court order his immediate release from ICE custody, or in the alternative, order a bond hearing before an immigration judge.",
  ifp_employer: "",
  ifp_monthly_pay: "$0",
  ifp_other_income: "",
  ifp_cash_on_hand: "$45",
  ifp_property: "None",
  ifp_monthly_expenses: "$0 (detained)",
  ifp_dependents: "Wife and 2 children",
  ifp_debts: "None",
};
const { habeas, ifp } = await buildIntakePdfs(answers);
fs.writeFileSync("/mnt/documents/AO242-test-v2.pdf", habeas);
fs.writeFileSync("/mnt/documents/AO240-test-v2.pdf", ifp);
console.log("OK", habeas.length, ifp.length);
