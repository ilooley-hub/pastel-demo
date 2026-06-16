// Server-side dataset loader. These JSON files are the ONLY source of truth the
// model is allowed to answer from. Imported (bundled) rather than read at
// runtime so it works reliably on serverless (Vercel).

import meridian from "../../../data/meridian.json";

type Dataset = {
  meta: { id: string; name: string; sector: string; currency_symbol: string };
  [key: string]: unknown;
};

const DATASETS: Record<string, Dataset> = {
  meridian: meridian as Dataset,
  // Harbor & Co and Vantage Studio are added in Phase 5.
};

export function getDataset(companyId: string): Dataset | null {
  return DATASETS[companyId] ?? null;
}

export function listCompanyIds(): string[] {
  return Object.keys(DATASETS);
}
