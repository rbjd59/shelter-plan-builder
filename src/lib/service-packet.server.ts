import { PDFDocument, StandardFonts } from "pdf-lib";
import { CHECKLISTS, LIMITED_POWERS, EXCLUDED_POWERS, type ServiceKind } from "./service-file";
import { businessTrustDetails, BUSINESS_TRUST_FEE } from "./business-trust";
import { FIRM } from "./firm-info";
export async function textPacket(title: string, sections: { heading: string; lines: string[] }[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(title);
  let page = pdf.addPage([612, 792]);
  let y = 742;
  const line = (raw: string, heading = false) => {
    const clean = raw.normalize("NFKD").replace(/[^\x20-\x7E]/g, " ");
    let current = "";
    const size = heading ? 13 : 11;
    const f = heading ? bold : font;
    const draw = () => {
      if (y < 65) {
        page = pdf.addPage([612, 792]);
        y = 742;
      }
      page.drawText(current, { x: 54, y, size, font: f });
      y -= 17;
    };
    for (const word of clean.split(/\s+/)) {
      const next = current ? `${current} ${word}` : word;
      if (f.widthOfTextAtSize(next, size) > 504 && current) {
        draw();
        current = word;
      } else current = next;
    }
    if (current) draw();
  };
  line(title, true);
  line("DRAFT - Attorney review required before signing or use.");
  for (const section of sections) {
    y -= 12;
    line(section.heading, true);
    section.lines.forEach((s) => line(s));
  }
  return pdf.save();
}
export async function familyPacket(answers: Record<string, unknown>, name: string) {
  const val = (key: string) =>
    typeof answers[key] === "string" ? String(answers[key]) : "[to be completed]";
  const trusted = val("authorizedPerson");
  return textPacket("Simple family preparation - " + name, [
    {
      heading: "Limited power of attorney",
      lines: [
        `I, ${name}, choose ${trusted} as my trusted person.`,
        "Only the powers I check and initial on the reviewed final document apply:",
        ...LIMITED_POWERS.map((p) => "[ ] " + p),
        "Excluded: " + EXCLUDED_POWERS.join(", ") + ".",
        "Accounts and spending limits: ___________________",
        "Vehicle plate/VIN: ___________________",
        "Children: " + val("childrenNames"),
        "Start date: __________ End date: __________",
        "This draft does not override custody orders or bank rules. Attorney to confirm state requirements, duration, witnesses and notary block.",
        "My signature: __________________ Date: __________",
        "Trusted person signature: __________________",
        "Witness 1: __________________ Witness 2: __________________",
        "State-specific notary acknowledgment: attorney to complete.",
      ],
    },
    {
      heading: "Letter to the school",
      lines: [
        `I, ${name}, ask the school to allow ${trusted} to pick up my children: ${val("childrenNames")}.`,
        "School name: __________________ Phone: __________________",
        "Please check ID and follow any custody order. This does not change custody.",
        "My signature: __________________ Date: __________",
      ],
    },
    {
      heading: "Letter to my employer - last paycheck",
      lines: [
        `I, ${name}, authorize ${trusted} to collect my last paycheck or speak with payroll about delivery.`,
        "Employer: __________________ Employee number: __________________",
        "This does not change who owns the pay or authorize signing my name on a check.",
        "My signature: __________________ Date: __________",
      ],
    },
    {
      heading: "Vehicle permission and DMV form",
      lines: [
        `I, ${name}, allow ${trusted} to access and maintain my vehicle listed above.`,
        "No sale, title transfer, loan or lien is authorized.",
        "Use the official DMV limited power-of-attorney form for the vehicle registration state when required. Staff must obtain the correct form; this letter is not a DMV substitute.",
        "My signature: __________________ Date: __________",
      ],
    },
    {
      heading: "Keep your papers safe",
      lines: [
        "After the attorney checks them, print and sign as directed with the required witnesses and notary. Keep originals safe. Give your trusted person a copy. Call 305-773-7737 if you need help.",
      ],
    },
  ]);
}
export async function servicePacket(
  kind: ServiceKind,
  client: { full_name: string | null; answers: unknown; property_estimate: unknown },
  file: Record<string, unknown>,
) {
  const answers = (client.answers ?? {}) as Record<string, unknown>;
  const safe = (v: unknown) =>
    v === null || v === undefined || v === ""
      ? "[to be completed]"
      : typeof v === "object"
        ? JSON.stringify(v)
        : String(v);
  const estimate =
    client.property_estimate && typeof client.property_estimate === "object"
      ? (client.property_estimate as Record<string, unknown>)
      : {};
  return textPacket(`${kind.toUpperCase()} preparation - ${client.full_name ?? "Client"}`, [
    {
      heading: "Client and property",
      lines: [
        `Client: ${client.full_name ?? "Not provided"}`,
        `Address: ${safe(answers.homeAddress)}`,
        `Goal: ${safe(kind === "business" ? answers.businessGoal : answers.homePlan)}`,
        `Provider estimate (not loan approval): ${kind === "trust" ? `Home value: ${safe(estimate.value)}; monthly rent: ${safe(estimate.rent)}. ${safe(estimate.message)}` : safe(client.property_estimate)}`,
      ],
    },
    { heading: "Documents to gather", lines: CHECKLISTS[kind].map((s) => "[ ] " + s) },
    {
      heading: "Saved setup and provider references",
      lines: Object.entries(file)
        .filter(
          ([k]) => k !== "business" && (kind !== "trust" || !["notes", "checklist"].includes(k)),
        )
        .map(([k, v]) => `${k}: ${safe(v)}`),
    },
    ...(kind === "trust"
      ? [
          {
            heading: "Revocable trust agreement - attorney review draft",
            lines: [
              "1. Parties and trust name. " +
                safe(client.full_name) +
                " (Settlor) proposes to establish " +
                safe(file.trustName) +
                ". " +
                safe(file.trustee) +
                " is the proposed Trustee. Governing state: [attorney to confirm].",
              "2. Trust property. The Trustee will hold only property actually transferred to this trust by a separately valid instrument. Schedule A legal description: " +
                safe(file.legalDescription) +
                ". No deed or property transfer is effected by signing this draft.",
              "3. Beneficiaries and distributions. Proposed beneficiaries and instructions: " +
                safe(file.beneficiaries) +
                ". Shares, distribution dates, restrictions and contingent beneficiaries: [attorney to complete from Settlor instructions].",
              "4. Revocation and amendment. During the Settlor's lifetime and capacity, the Settlor may amend or revoke by signed written direction delivered to the Trustee, subject to governing law and the final approved instrument. Treatment at death or incapacity: [attorney to complete].",
              "5. Trustee administration. The Trustee shall administer the trust loyally for its beneficiaries, keep trust property and records separate, document receipts and disbursements, avoid unauthorized conflicts, and provide accounts required by law. Trustee compensation and expense approval: [to be agreed].",
              "6. Real-estate actions. Any sale, lease, borrowing, encumbrance or transfer must comply with the final trust powers, title requirements, applicable law and required lender consent. Specific limits, reserve and written approval procedure: [attorney to complete]. No family limited power of attorney grants these powers.",
              "7. Successor trustee. Proposed successor: " +
                safe(file.backupTrustee) +
                ". Appointment, incapacity determination, removal and replacement procedure: [attorney to complete].",
              "8. Existing debts. This trust does not erase mortgages, liens, taxes or other obligations and does not guarantee lender approval or protection from creditors. Counsel must review transfer restrictions, insurance, homestead and tax consequences.",
              "9. Execution and acceptance. This incomplete draft may not be signed or used until attorney approval and all required information and state execution provisions are supplied.",
              "Settlor signature/date: __________________ Trustee acceptance/date: __________________",
              "State-required witnesses and notary acknowledgment: [attorney to supply].",
              "Schedule A: legal description, ownership shares and separately executed transfer documents: __________________",
            ],
          },
        ]
      : []),
    ...(kind === "trust"
      ? []
      : [
          {
            heading: "Partner handoff terms - review draft only",
            lines: [
              "Client sharing consent and the recipient must be verified before any handoff.",
              "Document-preparation services must be separately described and priced at reasonable value. No fee is earned merely for referring a client.",
              "Owner proposes $2,500 for $100,000-$500,000 and $5,000 above $500,000 through $1,000,000; these are NOT approved or payable terms.",
              "Closing-contingent referral charges, escrow deductions, liens and letters of protection are not created here. Attorney must review RESPA Section 8, state licensing, disclosures and any permissible compensation agreement.",
              "For business brokerage, the proposed 10% commission requires a separate reviewed agreement and any required broker license.",
              "Recipient legal name/license: __________________",
              "Services and lawful compensation approved by counsel: __________________",
              "Client consent: __________________ Recipient acceptance: __________________",
            ],
          },
        ]),
  ]);
}
export async function businessTrustPacket(
  client: { full_name: string | null; answers: unknown },
  file: Record<string, unknown>,
) {
  const business = businessTrustDetails(client, file);
  const value = (v: unknown) =>
    v === "" || v === null || v === undefined ? "[to be completed]" : String(v);
  const answers = (client.answers ?? {}) as Record<string, unknown>;
  return textPacket(`Do Not Forget Your Business trust - ${client.full_name ?? "Client"}`, [
    {
      heading: "Client and business",
      lines: [
        `Client / proposed Settlor: ${value(client.full_name)}`,
        `Business name: ${value(business.name)}`,
        `Current company type: ${value(business.entity)}`,
        `Goal: ${value(answers.businessGoal)}`,
        `Business assets and ownership interests proposed for Schedule A: ${value(business.assets)}`,
      ],
    },
    {
      heading: "Trust setup - incomplete attorney-review draft",
      lines: [
        `Trust path: ${business.trustMode === "existing_home" ? "Attorney to review adding business interests to the existing home trust; no second trust presumed." : "Proposed new business trust."}`,
        `Trust name: ${value(business.trustName)}`,
        `Proposed Trustee: ${value(file.trustee)}; successor: ${value(file.backupTrustee)}`,
        `Beneficiaries and instructions: ${value(file.beneficiaries)}`,
        "The Settlor proposes that only business interests lawfully transferred by separate approved instruments be held in trust. This draft transfers nothing.",
        "Attorney to supply governing state, approved trust terms, ownership shares, distribution rules, revocation and amendment provisions, incapacity and successor rules, trustee duties and execution requirements before signing.",
        "Proposed structure: trust-owned Florida C corporation and EIN. Company formation, EIN issuance and ownership transfers are not completed by this document. Counsel must review existing entity conversion, tax and license consequences.",
        "Existing home-trust use requires attorney approval of the trust and separate business transfer documents; it does not authorize any real-estate transfer.",
        "State-required signatures, witnesses, notary and trustee acceptance: [attorney to complete in the approved final instruments].",
      ],
    },
    {
      heading: "Monthly service fee - client record, not a bill",
      lines: [
        `Offered starting service fee: $${business.monthlyFee}/month, subject to signed agreement.`,
        `Client fee status: ${business.feeStatus}; recorded start date: ${value(business.startDate)}`,
        `New trust offered fee: $${BUSINESS_TRUST_FEE}, payable over time under a separate agreed plan. Existing home-trust use and any fee must be confirmed by the attorney; no duplicate trust fee is presumed.`,
        `Trust payment-plan / agreement reference: ${value(business.paymentPlan)}`,
        "No installment amount has been set automatically. No subscription, card charge, payment receipt or collection authorization is created by this file.",
        "Florida filing costs and third-party registered-agent fees are separate. Optional local director: $50/month under a separate agreement.",
        "Any sale commission requires a separate reviewed broker agreement and required licensing. No commission or sale is created by this package.",
      ],
    },
    {
      heading: "Documents and review",
      lines: [
        ...CHECKLISTS.business.map((s) => "[ ] " + s),
        "[ ] Existing trust, if used; business ownership and separate transfer instruments",
        "[ ] Attorney-approved trust/company terms and signed service fee agreement",
        `${FIRM.legalName} - ${FIRM.city}. Legal documents require the Firm's approval before signing or use. The client may choose other providers.`,
        "This is an incomplete preparation draft, not an executed trust, corporation or transfer document.",
      ],
    },
  ]);
}
