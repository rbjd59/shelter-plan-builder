import type { Answers } from "./questions";
import { EMPTY_PROPERTY_ESTIMATE, type PropertyComp, type PropertyEstimate } from "./property";

type AvmResponse = {
  price?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  comparables?: Array<Record<string, unknown>>;
};

const numberOrNull = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? v : null;
const text = (v: unknown) => typeof v === "string" ? v : "";

function comps(rows: AvmResponse["comparables"], priceKey: "price" | "rent"): PropertyComp[] {
  return (rows ?? []).slice(0, 5).map((row) => ({
    address: text(row.formattedAddress),
    price: numberOrNull(row[priceKey]) ?? numberOrNull(row.price),
    bedrooms: numberOrNull(row.bedrooms),
    bathrooms: numberOrNull(row.bathrooms),
    squareFeet: numberOrNull(row.squareFootage),
    distanceMiles: numberOrNull(row.distance),
  }));
}

export async function lookupPropertyEstimate(answers: Answers): Promise<PropertyEstimate> {
  if (answers.ownHome !== "yes") return EMPTY_PROPERTY_ESTIMATE;
  const address = typeof answers.homeAddress === "string" ? answers.homeAddress.trim() : "";
  if (address.length < 8) {
    return { ...EMPTY_PROPERTY_ESTIMATE, status: "unavailable", checkedAt: new Date().toISOString(), message: "We need the full street address to check sale and rent prices." };
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["UDC_RENTCAST_API_KEY"];
  if (!apiKey || !connectionKey) {
    return { ...EMPTY_PROPERTY_ESTIMATE, status: "unavailable", checkedAt: new Date().toISOString(), message: "The automatic price check is not connected. Our team will check the home prices." };
  }

  const params = new URLSearchParams({ address });
  const bedrooms = text(answers.bedrooms).replace("plus", "");
  const bathrooms = text(answers.bathrooms).replace("plus", "");
  if (bedrooms) params.set("bedrooms", bedrooms === "5" ? "5" : bedrooms);
  if (bathrooms) params.set("bathrooms", bathrooms === "3" && text(answers.bathrooms) === "3plus" ? "4" : bathrooms);

  const request = async (path: string): Promise<AvmResponse> => {
    const response = await fetch(`https://connector-gateway.lovable.dev/udc_rentcast${path}?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": connectionKey },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Property estimate failed [${response.status}]: ${body.slice(0, 1000)}`);
      throw new Error("Estimate unavailable");
    }
    return await response.json() as AvmResponse;
  };

  const [saleResult, rentResult] = await Promise.allSettled([
    request("/v1/avm/value"),
    request("/v1/avm/rent/long-term"),
  ]);
  const sale = saleResult.status === "fulfilled" ? saleResult.value : null;
  const rent = rentResult.status === "fulfilled" ? rentResult.value : null;
  const value = numberOrNull(sale?.price);
  const rentValue = numberOrNull(rent?.rent);
  const status = value !== null && rentValue !== null ? "available" : value !== null || rentValue !== null ? "partial" : "unavailable";

  return {
    status,
    source: status === "unavailable" ? "none" : "RentCast",
    value,
    valueLow: numberOrNull(sale?.priceRangeLow),
    valueHigh: numberOrNull(sale?.priceRangeHigh),
    rent: rentValue,
    rentLow: numberOrNull(rent?.rentRangeLow),
    rentHigh: numberOrNull(rent?.rentRangeHigh),
    saleComps: comps(sale?.comparables, "price"),
    rentComps: comps(rent?.comparables, "rent"),
    checkedAt: new Date().toISOString(),
    message: status === "available"
      ? "Sale and rent estimates came from current nearby listings. They are estimates, not an appraisal or a loan offer."
      : status === "partial"
        ? "We found one estimate. Our team will check the other one."
        : "We could not find an automatic estimate. Our team will check similar homes near this address.",
  };
}
