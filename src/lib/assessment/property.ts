export type PropertyComp = {
  address: string;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  distanceMiles: number | null;
};

export type PropertyEstimate = {
  status: "available" | "partial" | "unavailable" | "not_requested";
  source: "RentCast" | "none";
  value: number | null;
  valueLow: number | null;
  valueHigh: number | null;
  rent: number | null;
  rentLow: number | null;
  rentHigh: number | null;
  saleComps: PropertyComp[];
  rentComps: PropertyComp[];
  checkedAt: string;
  message: string;
};

export function zillowSearchUrl(address: string) {
  return `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`;
}

export const EMPTY_PROPERTY_ESTIMATE: PropertyEstimate = {
  status: "not_requested",
  source: "none",
  value: null,
  valueLow: null,
  valueHigh: null,
  rent: null,
  rentLow: null,
  rentHigh: null,
  saleComps: [],
  rentComps: [],
  checkedAt: "",
  message: "No home address was given.",
};
