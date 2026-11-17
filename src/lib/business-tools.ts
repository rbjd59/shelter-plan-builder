export type JobPriceInput = {
  workers: number;
  hours: number;
  hourlyPay: number;
  materials: number;
  monthlyOverhead: number;
  monthlyWorkHours: number;
  desiredProfit: number;
};

export type JobPriceResult = {
  labor: number;
  overhead: number;
  totalCost: number;
  price: number;
  profitMargin: number;
  markup: number;
};

const clean = (value: number) => Number.isFinite(value) && value >= 0 ? value : 0;
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateJobPrice(input: JobPriceInput): JobPriceResult {
  const workers = clean(input.workers);
  const hours = clean(input.hours);
  const hourlyPay = clean(input.hourlyPay);
  const materials = clean(input.materials);
  const monthlyOverhead = clean(input.monthlyOverhead);
  const monthlyWorkHours = clean(input.monthlyWorkHours);
  const desiredProfit = clean(input.desiredProfit);
  const labor = workers * hours * hourlyPay;
  const overhead = monthlyWorkHours > 0 ? (monthlyOverhead / monthlyWorkHours) * hours : 0;
  const totalCost = labor + materials + overhead;
  const price = totalCost + desiredProfit;
  return {
    labor: round(labor),
    overhead: round(overhead),
    totalCost: round(totalCost),
    price: round(price),
    profitMargin: price > 0 ? round((desiredProfit / price) * 100) : 0,
    markup: totalCost > 0 ? round((desiredProfit / totalCost) * 100) : 0,
  };
}

export type SavedJob = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  workDate: string;
  amount: number;
  paid: boolean;
  photos: string[];
};

export function jobsToCsv(jobs: SavedJob[]): string {
  const escape = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = [
    ["Customer", "Phone", "Service", "Work date", "Amount", "Paid", "Photo count"],
    ...jobs.map((job) => [job.customer, job.phone, job.service, job.workDate, job.amount, job.paid, job.photos.length]),
  ];
  return rows.map((row) => row.map(escape).join(",")).join("\n");
}
