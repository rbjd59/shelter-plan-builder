export type Opt = { v: string; l: string };
export type Q = { id: string; q: string; opts?: Opt[]; multi?: boolean; grid?: boolean; text?: "name" | "phone" | "email" | "contacts"; show?: (a: Answers) => boolean };
export type Section = { id: string; title: string; questions: Q[] };
export type Answers = Record<string, string | string[] | undefined>;

const yn = (): Opt[] => [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "dk", l: "I don't know" }];

export const TRADES: Opt[] = [
  ["hvac", "Air conditioning (HVAC)"], ["landscaping", "Landscaping"], ["painting", "Painting"], ["cleaning", "House cleaning"],
  ["pressure", "Pressure washing"], ["plumbing", "Plumbing"], ["lawn", "Lawn care"], ["tree", "Tree care"],
  ["commercial_cleaning", "Office / commercial cleaning"], ["window", "Window cleaning"], ["electric", "Electrician"],
  ["pool", "Pool service"], ["junk", "Junk removal"], ["remodel", "Remodeling"], ["construction", "Construction"],
  ["roofing", "Roofing"], ["pest", "Pest control"], ["handyman", "Handyman"], ["none", "I don't have work like this"],
].map(([v, l]) => ({ v, l }));

const has = (a: Answers, k: string, v: string) => { const x = a[k]; return Array.isArray(x) ? x.includes(v) : x === v; };

export const STATES: Opt[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Washington DC", "Puerto Rico"].map((x) => ({ v: x.toLowerCase().replace(/ /g, "_"), l: x }));

export const SECTIONS: Section[] = [
  { id: "stay", title: "1. Can I stay in the U.S.?", questions: [
    { id: "country", q: "What country are you from?", opts: ["Haiti","Venezuela","Cuba","Nicaragua","Honduras","Guatemala","El Salvador","Mexico","Other"].map((c) => ({ v: c.toLowerCase().replace(" ", "_"), l: c })) },
    { id: "state", q: "What state do you live in?", opts: STATES, grid: true },
    { id: "entry", q: "How did you come in?", opts: [
      { v: "visa", l: "With a visa" },
      { v: "released", l: "Immigration (ICE or Border Patrol) held me, then let me go with papers" },
      { v: "parole", l: "Parole — CBP One app or a sponsor" },
      { v: "ewi", l: "I crossed the border and never talked to immigration" },
      { v: "dk", l: "I don't know" }] },
    { id: "papers", q: "What papers did you get? (tap all)", multi: true, opts: [
      { v: "tps", l: "TPS" }, { v: "parole", l: "Parole" }, { v: "asylum", l: "I asked for asylum" },
      { v: "visa", l: "Visa" }, { v: "daca", l: "DACA" }, { v: "workpermit", l: "Work permit" }, { v: "none", l: "No papers" }, { v: "dk", l: "I don't know" }] },
    { id: "now", q: "What is happening with your papers now?", show: (a) => !has(a, "papers", "none"), opts: [
      { v: "active", l: "Still good (not expired)" },
      { v: "tps_ended", l: "My TPS was canceled" },
      { v: "parole_ended", l: "My parole ended or was canceled" },
      { v: "expired", l: "My visa or work permit expired" },
      { v: "checkin", l: "I still go to ICE check-ins" },
      { v: "missed", l: "I missed a court date or a check-in" },
      { v: "denied", l: "My case was denied" },
      { v: "dk", l: "I don't know" }] },
    { id: "ended", q: "When did your papers end?", show: (a) => !!a.now && !["active", "checkin", "dk"].includes(String(a.now)) , opts: [
      { v: "lt180", l: "Less than 6 months ago" }, { v: "180to365", l: "6 months to 1 year ago" },
      { v: "gt365", l: "More than 1 year ago" }, { v: "dk", l: "I don't know" }] },
    { id: "years", q: "How long have you lived in the U.S.?", opts: [
      { v: "lt1", l: "Less than 1 year" }, { v: "1to2", l: "1 to 2 years" }, { v: "2to10", l: "2 to 10 years" }, { v: "10plus", l: "More than 10 years" }] },
    { id: "asylumTime", q: "When did you ask for asylum?", show: (a) => has(a, "papers", "asylum"), opts: [
      { v: "within1", l: "In my first year here" }, { v: "later", l: "After my first year" }, { v: "dk", l: "I don't know" }] },
    { id: "court", q: "Did a judge order you deported?", opts: [
      { v: "no", l: "No" }, { v: "pending", l: "No — I have a court date" },
      { v: "final", l: "Yes, a judge ordered me deported" }, { v: "dk", l: "I don't know" }] },
    { id: "crime", q: "Have you ever been arrested?", opts: [
      { v: "no", l: "No" }, { v: "tickets", l: "Only traffic tickets" }, { v: "arrest", l: "Arrested, not found guilty" },
      { v: "convicted", l: "Found guilty of a crime" }, { v: "dk", l: "I don't know" }] },
    { id: "family", q: "Who in your family is a U.S. citizen or has a green card? (tap all)", multi: true, opts: [
      { v: "usc_spouse", l: "Husband or wife — U.S. citizen" }, { v: "usc_child21", l: "Child 21 or older — U.S. citizen" },
      { v: "usc_child", l: "Child under 21 — U.S. citizen" }, { v: "usc_parent", l: "Parent — U.S. citizen" },
      { v: "lpr_spouse_parent", l: "Husband, wife or parent — green card" }, { v: "none", l: "No one" }] },
    { id: "special", q: "Did any of these happen to you? (tap all)", multi: true, opts: [
      { v: "crime_victim", l: "I was a crime victim here and helped the police" },
      { v: "abuse", l: "A U.S. citizen or green card family member hurt me" },
      { v: "minor", l: "I came before 18 and a parent left or hurt me (I am under 21)" },
      { v: "trafficking", l: "Someone forced me to work or traded me" },
      { v: "none", l: "None of these" }] },
  ]},
  { id: "back", title: "2. If I leave, can I come back?", questions: [
    { id: "removed", q: "Were you ever deported or sent back?", opts: [
      { v: "never", l: "Never" }, { v: "border", l: "Sent back fast at the border" },
      { v: "judge", l: "A judge deported me" }, { v: "twice", l: "Deported 2 or more times" }, { v: "dk", l: "I don't know" }] },
    { id: "sneakBack", q: "After that — or after 1 year here with no papers — did you leave and cross back in without being checked?", opts: yn() },
    { id: "minorTime", q: "Were you under 18 when your papers ended (or when you came with no papers)?", opts: yn() },
  ]},
  { id: "home", title: "3. My home", questions: [
    { id: "ownHome", q: "Do you own a home?", opts: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }] },
    { id: "homeValue", q: "About how much is your home worth?", show: (a) => a.ownHome === "yes", opts: [
      { v: "150", l: "Under $200,000" }, { v: "250", l: "$200,000 – $300,000" }, { v: "350", l: "$300,000 – $400,000" },
      { v: "500", l: "$400,000 – $600,000" }, { v: "700", l: "More than $600,000" }, { v: "dk", l: "I don't know" }] },
    { id: "owed", q: "About how much do you still owe on the home?", show: (a) => a.ownHome === "yes", opts: [
      { v: "0", l: "Nothing — it's paid off" }, { v: "50", l: "Under $100,000" }, { v: "150", l: "$100,000 – $200,000" },
      { v: "250", l: "$200,000 – $300,000" }, { v: "350", l: "$300,000 – $400,000" }, { v: "500", l: "More than $400,000" }, { v: "dk", l: "I don't know" }] },
    { id: "monthly", q: "About how much do you pay each month for the home (loan, taxes, insurance)?", show: (a) => a.ownHome === "yes", opts: [
      { v: "750", l: "Under $1,000" }, { v: "1500", l: "$1,000 – $2,000" }, { v: "2500", l: "$2,000 – $3,000" },
      { v: "3500", l: "More than $3,000" }, { v: "dk", l: "I don't know" }] },
    { id: "bought", q: "When did you buy it?", show: (a) => a.ownHome === "yes", opts: [
      { v: "lt2", l: "Less than 2 years ago" }, { v: "2to5", l: "2 to 5 years ago" }, { v: "5plus", l: "More than 5 years ago" }, { v: "dk", l: "I don't know" }] },
    { id: "repairs", q: "Does the home need big repairs?", show: (a) => a.ownHome === "yes", opts: yn() },
    { id: "liens", q: "Does anyone else have a claim on the home (liens, court judgments)?", show: (a) => a.ownHome === "yes", opts: yn() },
  ]},
  { id: "business", title: "4. My work or business", questions: [
    { id: "trade", q: "Do you do any of this work for your own customers?", opts: TRADES },
    { id: "customers", q: "How many regular customers do you have?", show: (a) => !!a.trade && a.trade !== "none", opts: [
      { v: "lt10", l: "Less than 10" }, { v: "10to29", l: "10 to 29" }, { v: "30plus", l: "30 or more" }] },
    { id: "workers", q: "How many people work with you?", show: (a) => !!a.trade && a.trade !== "none", opts: [
      { v: "0", l: "Just me" }, { v: "1to2", l: "1 or 2" }, { v: "3plus", l: "3 or more" }] },
    { id: "records", q: "Do you keep records of the money you make?", show: (a) => !!a.trade && a.trade !== "none", opts: [
      { v: "yes", l: "Yes" }, { v: "cash", l: "No — mostly cash" }] },
  ]},
  { id: "family", title: "5. My family and papers", questions: [
    { id: "spouse", q: "Your husband or wife:", opts: [
      { v: "usc", l: "U.S. citizen" }, { v: "lpr", l: "Has a green card" }, { v: "papers", l: "Has other papers" },
      { v: "nopapers", l: "No papers" }, { v: "single", l: "I'm not married" }] },
    { id: "kids", q: "Your children (tap all):", multi: true, opts: [
      { v: "us_born", l: "Born in the U.S." }, { v: "abroad", l: "Born in another country" }, { v: "under18", l: "Some are under 18" }, { v: "none", l: "No children" }] },
    { id: "id", q: "What ID do you have? (tap all)", multi: true, opts: [
      { v: "passport", l: "Passport" }, { v: "consular", l: "Consular ID" }, { v: "license", l: "Driver's license" }, { v: "none", l: "No ID" }] },
    { id: "contacts", q: "3 people we can call in an emergency (name and phone)", text: "contacts" },
  ]},
  { id: "leave", title: "6. If I have to leave", questions: [
    { id: "where", q: "Where would you go?", opts: [{ v: "home", l: "My home country" }, { v: "other", l: "Another country" }, { v: "dk", l: "I don't know yet" }] },
    { id: "howLong", q: "For how long?", opts: [{ v: "short", l: "A short time" }, { v: "forever", l: "To live there" }, { v: "dk", l: "I don't know" }] },
    { id: "residency", q: "Do you want papers to live in that country (residency)?", opts: yn() },
    { id: "lawyerMoney", q: "Do you have money to pay a lawyer for those papers?", opts: yn() },
  ]},
  { id: "you", title: "7. How do we reach you?", questions: [
    { id: "name", q: "Your name", text: "name" },
    { id: "phone", q: "Your phone", text: "phone" },
    { id: "email", q: "Your email (if you have one)", text: "email" },
  ]},
];
