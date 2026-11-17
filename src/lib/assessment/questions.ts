export type Opt = { v: string; l: string };
export type Q = {
  id: string;
  q: string;
  opts?: Opt[];
  multi?: boolean;
  grid?: boolean;
  text?: "name" | "phone" | "email" | "contacts" | "number" | "address" | "text";
  hint?: string;
  placeholder?: string;
  show?: (a: Answers) => boolean;
};
export type Section = { id: string; title: string; intro?: string; questions: Q[] };
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
const hasKids = (a: Answers) => has(a, "kids", "under18") || has(a, "kids", "us_born") || has(a, "kids", "abroad");
const hasWork = (a: Answers) => !!a.trade && a.trade !== "none";
const ownsHome = (a: Answers) => a.ownHome === "yes";
const hasMortgage = (a: Answers) => ownsHome(a) && a.mortgages !== "0";

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
      { v: "active", l: "Still good (not expired)" }, { v: "tps_ended", l: "My TPS was canceled" },
      { v: "parole_ended", l: "My parole ended or was canceled" }, { v: "expired", l: "My visa or work permit expired" },
      { v: "checkin", l: "I still go to ICE check-ins" }, { v: "missed", l: "I missed a court date or a check-in" },
      { v: "denied", l: "My case was denied" }, { v: "dk", l: "I don't know" }] },
    { id: "ended", q: "When did your papers end?", show: (a) => !!a.now && !["active", "checkin", "dk"].includes(String(a.now)), opts: [
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
      { v: "trafficking", l: "Someone forced me to work or traded me" }, { v: "none", l: "None of these" }] },
  ]},
  { id: "back", title: "2. If I leave, can I come back?", questions: [
    { id: "removed", q: "Were you ever deported or sent back?", opts: [
      { v: "never", l: "Never" }, { v: "border", l: "Sent back fast at the border" },
      { v: "judge", l: "A judge deported me" }, { v: "twice", l: "Deported 2 or more times" }, { v: "dk", l: "I don't know" }] },
    { id: "sneakBack", q: "After that — or after 1 year here with no papers — did you leave and cross back in without being checked?", opts: yn() },
    { id: "minorTime", q: "Were you under 18 when your papers ended (or when you came with no papers)?", opts: yn() },
  ]},
  { id: "familyForms", title: "3. My family and forms", intro: "We use these answers to prepare your family-form drafts. The attorney reviews them before we email them to you.", questions: [
    { id: "spouse", q: "Your husband or wife:", opts: [
      { v: "usc", l: "U.S. citizen" }, { v: "lpr", l: "Has a green card" }, { v: "papers", l: "Has other papers" },
      { v: "nopapers", l: "No papers" }, { v: "single", l: "I'm not married" }] },
    { id: "spouseName", q: "Husband or wife's full name (if you know it)", text: "text", show: (a) => !!a.spouse && a.spouse !== "single" },
    { id: "kids", q: "Your children (tap all):", multi: true, opts: [
      { v: "us_born", l: "Born in the U.S." }, { v: "abroad", l: "Born in another country" }, { v: "under18", l: "Some are under 18" }, { v: "none", l: "No children" }] },
    { id: "childrenNames", q: "Names and ages of children under 18", text: "text", hint: "Example: Maria, 8 and Jose, 12. You can ask for help instead.", show: hasKids },
    { id: "id", q: "What ID do you have? (tap all)", multi: true, opts: [
      { v: "passport", l: "Passport" }, { v: "consular", l: "Consular ID" }, { v: "license", l: "Driver's license" }, { v: "none", l: "No ID" }] },
    { id: "formsNeeded", q: "What family papers do you want? (tap all)", multi: true, opts: [
      { v: "poa", l: "Let someone I trust pay bills and sign papers for me" },
      { v: "childcare", l: "Let someone I trust care for my children" },
      { v: "school_doctor", l: "School and doctor permission for my children" },
      { v: "travel", l: "Permission for my children to travel or get a passport" },
      { v: "car_bank", l: "Car and bank papers" }, { v: "none", l: "I don't need family forms" }, { v: "dk", l: "I don't know — help me choose" },
    ].map((o) => ({ v: o.v, l: o.l })), },
    { id: "contacts", q: "3 people we can call in an emergency (name and phone)", text: "contacts", hint: "The first person can be the one you trust to care for your children or sign papers for you." },
  ]},
  { id: "home", title: "4. My home", intro: "Guess if you need to. We use your address to check current sale prices, rent prices, and similar homes nearby.", questions: [
    { id: "ownHome", q: "Do you own a home?", opts: [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }] },
    { id: "homeAddress", q: "What is the home's full street address?", text: "address", placeholder: "123 Main St, Miami, FL 33101", show: ownsHome },
    { id: "bought", q: "About when did you buy it? Pick the closest time.", show: ownsHome, opts: [
      { v: "lt5", l: "Less than 5 years ago" }, { v: "5to10", l: "5 to 10 years ago" }, { v: "10to15", l: "10 to 15 years ago" },
      { v: "15plus", l: "More than 15 years ago" }, { v: "dk", l: "I don't know" }] },
    { id: "purchasePrice", q: "How much did you pay for the home?", text: "number", placeholder: "250000", hint: "Numbers only. A guess is okay.", show: ownsHome },
    { id: "mortgages", q: "How many home loans do you have?", show: ownsHome, opts: [
      { v: "0", l: "None — it is paid off" }, { v: "1", l: "1" }, { v: "2", l: "2" }, { v: "3plus", l: "3 or more" }, { v: "dk", l: "I don't know" }] },
    { id: "owed", q: "About how much do you still owe on all the home loans?", text: "number", placeholder: "180000", hint: "Numbers only. A guess is okay.", show: hasMortgage },
    { id: "monthly", q: "How much does the home cost each month?", text: "number", placeholder: "2200", hint: "Add the loan, tax, insurance, and HOA if you pay one.", show: ownsHome },
    { id: "late", q: "Are you late on a home loan or has the bank started foreclosure?", show: hasMortgage, opts: [
      { v: "current", l: "No — my payments are up to date" }, { v: "late", l: "Yes — I am late" },
      { v: "default", l: "Yes — the bank sent a default or foreclosure notice" }, { v: "dk", l: "I don't know" }] },
    { id: "owners", q: "Whose name is on the home papers? (tap all)", multi: true, show: ownsHome, opts: [
      { v: "me", l: "Me" }, { v: "spouse", l: "My husband or wife" }, { v: "family", l: "Another family member" },
      { v: "company", l: "A company" }, { v: "other", l: "Someone else" }, { v: "dk", l: "I don't know" }] },
    { id: "bedrooms", q: "How many bedrooms?", show: ownsHome, opts: ["1","2","3","4","5plus"].map((v) => ({ v, l: v === "5plus" ? "5 or more" : v })) },
    { id: "bathrooms", q: "How many bathrooms?", show: ownsHome, opts: ["1","1.5","2","2.5","3","3plus"].map((v) => ({ v, l: v === "3plus" ? "More than 3" : v })) },
    { id: "homeAge", q: "About how old is the home?", show: ownsHome, opts: [
      { v: "0to5", l: "0–5 years" }, { v: "5to10", l: "5–10 years" }, { v: "10to20", l: "10–20 years" }, { v: "20plus", l: "More than 20 years" }, { v: "dk", l: "I don't know" }] },
    { id: "condition", q: "What shape is the home in?", show: ownsHome, opts: [
      { v: "good", l: "Good — ready to rent or sell" }, { v: "minor", l: "Needs small fixes or paint" },
      { v: "major", l: "Needs big repairs" }, { v: "dk", l: "I don't know" }] },
    { id: "liens", q: "Does anyone else have a claim on the home (liens, court judgments, unpaid tax)?", show: ownsHome, opts: yn() },
    { id: "homePlan", q: "What do you want to do with the home?", show: ownsHome, opts: [
      { v: "rent", l: "Rent it to someone" }, { v: "sell", l: "Sell it" }, { v: "family", l: "Keep my family living in it" }, { v: "dk", l: "I don't know yet" }] },
    { id: "homeValue", q: "If you already know about what the home is worth today, tap it.", show: ownsHome, hint: "We will still check current prices. Tap I don't know if you are not sure.", opts: [
      { v: "150", l: "Under $200,000" }, { v: "250", l: "$200,000 – $300,000" }, { v: "350", l: "$300,000 – $400,000" },
      { v: "500", l: "$400,000 – $600,000" }, { v: "700", l: "More than $600,000" }, { v: "dk", l: "I don't know" }] },
  ]},
  { id: "business", title: "5. My work or business", intro: "You may have a business even if you work for cash and do not have company papers.", questions: [
    { id: "trade", q: "Do you do any of this work for your own customers?", opts: TRADES },
    { id: "businessName", q: "What name do customers know your work by?", text: "text", hint: "It can be your own name. You can leave this blank.", show: hasWork },
    { id: "businessYears", q: "How long have you done this work?", show: hasWork, opts: [
      { v: "lt1", l: "Less than 1 year" }, { v: "1to3", l: "1–3 years" }, { v: "3to5", l: "3–5 years" }, { v: "5plus", l: "More than 5 years" }] },
    { id: "monthlyIncome", q: "About how much money does this work bring in each month?", show: hasWork, opts: [
      { v: "lt1000", l: "Under $1,000" }, { v: "1000to3000", l: "$1,000–$3,000" }, { v: "3000to6000", l: "$3,000–$6,000" },
      { v: "6000to10000", l: "$6,000–$10,000" }, { v: "10000plus", l: "More than $10,000" }, { v: "dk", l: "I don't know" }] },
    { id: "monthlyCosts", q: "About how much do you pay for workers, gas, supplies, rent and other work costs each month?", show: hasWork, opts: [
      { v: "none", l: "Nothing" }, { v: "lt1000", l: "Under $1,000" }, { v: "1000to3000", l: "$1,000–$3,000" }, { v: "3000to6000", l: "$3,000–$6,000" },
      { v: "6000to10000", l: "$6,000–$10,000" }, { v: "10000plus", l: "More than $10,000" }, { v: "dk", l: "I don't know" }] },
    { id: "equipmentValue", q: "About how much are your work vehicles, tools and equipment worth today?", show: hasWork, opts: [
      { v: "none", l: "Nothing" }, { v: "lt5000", l: "Under $5,000" }, { v: "5000to15000", l: "$5,000–$15,000" },
      { v: "15000to50000", l: "$15,000–$50,000" }, { v: "50000plus", l: "More than $50,000" }, { v: "dk", l: "I don't know" }] },
    { id: "customersWeek", q: "How many customers do you see in a normal week?", show: hasWork, opts: [
      { v: "lt5", l: "Less than 5" }, { v: "5to9", l: "5–9" }, { v: "10to19", l: "10–19" }, { v: "20plus", l: "20 or more" }] },
    { id: "repeatCustomers", q: "Are they mostly the same customers every week or month?", show: hasWork, opts: [
      { v: "yes", l: "Yes, mostly the same" }, { v: "some", l: "Some are the same" }, { v: "no", l: "Mostly new customers" }] },
    { id: "workers", q: "How many people work with you?", show: hasWork, opts: [
      { v: "0", l: "Just me" }, { v: "1to2", l: "1 or 2" }, { v: "3to5", l: "3–5" }, { v: "6plus", l: "6 or more" }] },
    { id: "advertising", q: "Do you tell people about your work in any of these ways? (tap all)", multi: true, show: hasWork, opts: [
      { v: "cards", l: "Cards or flyers" }, { v: "online", l: "Facebook, Google, or another website" },
      { v: "signs", l: "Signs on my car or truck" }, { v: "referrals", l: "Customers tell other people" }, { v: "none", l: "No advertising" }] },
    { id: "entity", q: "What company papers do you have?", show: hasWork, hint: "Sole owner means the work is in your own name. LLC or corporation means the state gave you company papers.", opts: [
      { v: "sole", l: "No company papers — just me (sole owner)" }, { v: "llc", l: "LLC" }, { v: "corporation", l: "Corporation" },
      { v: "dk", l: "I don't know" }] },
    { id: "records", q: "Do you keep records of the money you make?", show: hasWork, opts: [
      { v: "yes", l: "Yes" }, { v: "some", l: "Some records" }, { v: "cash", l: "No — mostly cash" }] },
    { id: "businessGoal", q: "What do you want to do with this work?", show: hasWork, opts: [
      { v: "sell", l: "Sell the business" }, { v: "abroad", l: "Run it while I live in another country" },
      { v: "family", l: "Have my family run it" }, { v: "dk", l: "I don't know yet" }] },
  ]},
  { id: "leave", title: "6. If I have to leave", questions: [
    { id: "where", q: "Where would you go?", opts: [{ v: "home", l: "My home country" }, { v: "other", l: "Another country" }, { v: "dk", l: "I don't know yet" }] },
    { id: "howLong", q: "For how long?", opts: [{ v: "short", l: "A short time" }, { v: "forever", l: "To live there" }, { v: "dk", l: "I don't know" }] },
    { id: "residency", q: "Do you want papers to live in that country (residency)?", opts: yn() },
    { id: "lawyerMoney", q: "Do you have money to pay a lawyer for those papers?", opts: yn() },
  ]},
];
