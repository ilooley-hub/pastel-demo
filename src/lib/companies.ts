import type { CompanyMeta } from "./types";

/**
 * Public metadata for the three sample companies that power the client switcher.
 * The full financial datasets live in /data and are loaded server-side only.
 */
export const COMPANIES: CompanyMeta[] = [
  {
    id: "meridian",
    name: "Meridian Software",
    sector: "B2B SaaS",
    tagline: "£2.16M ARR · Series A",
    currency: "£",
  },
  {
    id: "harbor",
    name: "Harbor & Co",
    sector: "Ecommerce",
    tagline: "Seasonal DTC brand",
    currency: "£",
  },
  {
    id: "vantage",
    name: "Vantage Studio",
    sector: "Agency",
    tagline: "Project-based services",
    currency: "£",
  },
];

export const DEFAULT_COMPANY_ID = "meridian";

export function getCompany(id: string): CompanyMeta {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0];
}
