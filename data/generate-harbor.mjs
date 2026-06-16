// Generator for the Harbor & Co dataset (seasonal DTC ecommerce brand).
// Lighter than Meridian but internally consistent: seasonal revenue, ~45% gross
// margin, inventory that builds before peak season, a higher accounts-payable
// balance, and a business trending from loss-making toward break-even.
//   node data/generate-harbor.mjs   ->  data/harbor.json
// All figures are GBP. Edit the assumptions and re-run to tune the story.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const round = (n) => Math.round(n);
const r1 = (n) => Math.round(n * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;

// ---- Periods: Jan 2024 .. Dec 2025 (24 months) -----------------------------
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const periods = [];
for (const year of [2024, 2025]) {
  for (let m = 0; m < 12; m++) {
    periods.push({
      period: `${year}-${String(m + 1).padStart(2, "0")}`,
      label: `${MONTHS_SHORT[m]} ${year}`,
      year,
      monthIdx: m,
    });
  }
}

// ---- Seasonal revenue ------------------------------------------------------
// DTC brand: deep Q4 peak (Black Friday + holiday), Jan/Feb trough, summer dip.
const SEASON = [0.74, 0.72, 0.86, 0.92, 0.99, 0.94, 0.88, 0.96, 1.06, 1.20, 1.58, 1.76];
const BASE_START = 172000; // baseline before seasonality, Jan 2024
const BASE_GROWTH = 0.018; // ~1.8%/mo underlying growth

const revenueArr = periods.map((p, i) => {
  const baseline = BASE_START * Math.pow(1 + BASE_GROWTH, i);
  return round(baseline * SEASON[p.monthIdx]);
});

// ---- COGS & opex -----------------------------------------------------------
const COGS_PCT = 0.55; // gross margin ~45%
const MKTG_ANOMALY = { "2025-08": 45000 }; // over-invested paid-social test

const monthly = periods.map((p, i) => {
  const t = i / (periods.length - 1);
  const revenue = revenueArr[i];

  const cogs = round(revenue * COGS_PCT);
  const gross_profit = revenue - cogs;
  const gross_margin_pct = r1((gross_profit / revenue) * 100);

  // Variable opex (scale with revenue)
  const mktg_pct = lerp(0.215, 0.118, t); // improving acquisition efficiency
  const opex_marketing = round(revenue * mktg_pct) + (MKTG_ANOMALY[p.period] ?? 0);
  const opex_fulfilment = round(revenue * 0.10); // pick/pack/ship
  const opex_merchant = round(revenue * 0.025); // payment processing

  // Fixed-ish opex
  const opex_salaries = round(lerp(41000, 58000, t));
  const opex_software = round(lerp(5200, 10200, t));
  const opex_ga = round(lerp(10500, 16500, t));

  const opex_total =
    opex_marketing + opex_fulfilment + opex_merchant +
    opex_salaries + opex_software + opex_ga;
  const operating_income = gross_profit - opex_total;

  return {
    period: p.period,
    label: p.label,
    revenue,
    cogs,
    gross_profit,
    gross_margin_pct,
    opex_marketing,
    opex_fulfilment,
    opex_merchant,
    opex_salaries,
    opex_software,
    opex_ga,
    opex_total,
    operating_income,
  };
});

// ---- Inventory: builds before peak, draws down after -----------------------
const INV_SEASON = [0.90, 0.85, 0.95, 1.00, 1.05, 1.00, 1.05, 1.25, 1.52, 1.72, 1.44, 1.15];
const INV_BASE_START = 232000;
const INV_BASE_GROWTH = 0.013;
let invPrev = round(INV_BASE_START * 0.92 * INV_SEASON[11]); // Dec 2023 closing proxy
monthly.forEach((m, i) => {
  const p = periods[i];
  const invBase = INV_BASE_START * Math.pow(1 + INV_BASE_GROWTH, i);
  m.inventory = round(invBase * INV_SEASON[p.monthIdx]);
  m.inventory_change = m.inventory - invPrev; // +ve = cash tied up
  invPrev = m.inventory;
});

// ---- Cash: operating cash flow net of inventory swings ---------------------
// Anchor closing Dec 2025; work backwards so every month ties out.
const TARGET_CLOSING = 238000;
monthly.forEach((m) => {
  m.cash_flow = m.operating_income - m.inventory_change;
});
const totalFlow = monthly.reduce((s, m) => s + m.cash_flow, 0);
let running = TARGET_CLOSING - totalFlow; // opening Jan 2024
monthly.forEach((m) => {
  m.opening_cash = round(running);
  running += m.cash_flow;
  m.closing_cash = round(running);
});

const last = monthly[monthly.length - 1];
const prev = monthly[monthly.length - 2];

// ---- Trailing-twelve-month roll-ups (smooths out seasonality) --------------
const ttm = (key) => monthly.slice(-12).reduce((s, m) => s + m[key], 0);
const ttm_prior = (key) =>
  monthly.slice(-24, -12).reduce((s, m) => s + m[key], 0);
const ttm_revenue = ttm("revenue");
const ttm_operating_income = ttm("operating_income");
const ttm_revenue_prior = ttm_prior("revenue");
const ttm_oi_prior = ttm_prior("operating_income");

// 2025 best/worst months
const m2025 = monthly.filter((m) => m.period.startsWith("2025"));
const best = m2025.reduce((a, b) => (b.revenue > a.revenue ? b : a));
const worst = m2025.reduce((a, b) => (b.revenue < a.revenue ? b : a));

// ---- Accounts payable (higher for an inventory business) -------------------
const ap = {
  total_outstanding: 312000,
  aging: [
    { bucket: "Current (0-30 days)", amount: 168000 },
    { bucket: "31-60 days", amount: 74000 },
    { bucket: "61-90 days", amount: 46000 },
    { bucket: "90+ days", amount: 24000 },
  ],
  over_60_days: 70000,
  notable_overdue: [
    { vendor: "Lin Textiles (core supplier)", amount: 31500, days_overdue: 64, note: "Largest supplier; key for peak-season restock." },
    { vendor: "Meridian 3PL (fulfilment)", amount: 18800, days_overdue: 71 },
    { vendor: "Packaging Co", amount: 9700, days_overdue: 88 },
  ],
  note: "AP has crept up through peak-season stock buys. Over-60-day balance is concentrated in one core supplier whose terms matter for restock.",
};

// ---- Accounts receivable (small — mostly card-paid DTC, some wholesale) -----
const ar = {
  total_outstanding: 46000,
  note: "DTC orders are card-paid (no AR). Balance is the small wholesale channel.",
  over_60_days: 8500,
};

// ---- Headcount -------------------------------------------------------------
const headcount = {
  total: 13,
  open_roles: 0,
  by_department: [
    { department: "Operations & fulfilment", count: 4 },
    { department: "Marketing & growth", count: 4 },
    { department: "Merchandising & product", count: 3 },
    { department: "G&A", count: 2 },
  ],
  avg_fully_loaded_cost_per_year: 54000,
};

// ---- Expense category summary (top 5 by latest month, with growth) ---------
const first = monthly[0];
const cat = (label, a, b) => ({
  category: label,
  jan_2024: a,
  dec_2025: b,
  growth_pct: r1(((b - a) / a) * 100),
});
const expense_categories = [
  cat("Marketing & advertising", first.opex_marketing, last.opex_marketing),
  cat("Fulfilment & shipping", first.opex_fulfilment, last.opex_fulfilment),
  cat("Salaries", first.opex_salaries, last.opex_salaries),
  cat("Merchant & payment fees", first.opex_merchant, last.opex_merchant),
  cat("G&A / admin", first.opex_ga, last.opex_ga),
  cat("Software & tools", first.opex_software, last.opex_software),
].sort((a, b) => b.dec_2025 - a.dec_2025);

// ---- Source files: the Excels + documents the figures come from ------------
const source_files = [
  { id: "mgmt-accounts", name: "Management accounts — 2024-2025.xlsx", type: "spreadsheet", system: "Xero", updated: "2025-12", description: "Monthly P&L, balance sheet and cash." },
  { id: "shopify", name: "Shopify sales export — 2025.xlsx", type: "spreadsheet", system: "Shopify", updated: "2025-12", description: "Orders, revenue and refunds by month." },
  { id: "inventory", name: "Inventory valuation — Dec 2025.xlsx", type: "spreadsheet", system: "3PL / internal", updated: "2025-12", description: "Stock on hand and inventory value." },
  { id: "ap-ledger", name: "AP ledger — Dec 2025.xlsx", type: "spreadsheet", system: "Xero", updated: "2025-12", description: "Supplier payables and ageing." },
  { id: "purchase-invoices", name: "Purchase invoices — Q4 2025.xlsx", type: "spreadsheet", system: "Xero", updated: "2025-12", description: "Supplier invoices and unit prices charged." },
  { id: "payroll", name: "Payroll summary — 2025.xlsx", type: "spreadsheet", system: "Gusto", updated: "2025-12", description: "Headcount and staff cost." },
  { id: "bank", name: "Bank statements — 2025.pdf", type: "document", system: "Bank", updated: "2025-12", description: "Cash movements and balances." },
  { id: "lin-pricelist", name: "Lin Textiles — price list 2025.pdf", type: "document", system: "Supplier", updated: "2025-01", description: "Agreed 2025 unit pricing for core supplier." },
  { id: "packaging-pricelist", name: "Packaging Co — price list.pdf", type: "document", system: "Supplier", updated: "2025-01", description: "Agreed packaging unit pricing." },
  { id: "3pl-agreement", name: "Meridian 3PL — fulfilment agreement.pdf", type: "document", system: "DocuSign", updated: "2024-11", description: "Fulfilment rates and SLAs." },
];

// ---- Team (so agent flags route to the right person) -----------------------
const team = [
  { name: "Jordan Ellis", role: "Operations Lead" },
  { name: "Sofia Marsh", role: "Finance Lead" },
  { name: "Alex Kim", role: "Founder / Brand" },
];

// ---- Cost assurance: supplier invoices vs agreed price lists ---------------
// Combines documents (supplier price lists) with spreadsheets (purchase
// invoices). Engineered so one core supplier has been over-charging.
const cost_assurance = {
  summary:
    "Supplier invoices (AP) checked against the agreed supplier price lists. One core supplier has been charging above the agreed 2025 rate.",
  total_overcharge: 6840,
  items: [
    {
      supplier: "Lin Textiles",
      contract_file: "Lin Textiles — price list 2025.pdf",
      invoice_file: "Purchase invoices — Q4 2025.xlsx",
      agreed_unit_price: "£4.20/unit",
      invoiced_unit_price: "£4.65/unit",
      units_q4: 15200,
      overcharge: 6840,
      status: "OVER-CHARGED",
      issue: "Q4 invoices billed £0.45/unit above the agreed 2025 price list across 3 POs (15,200 units).",
    },
    {
      supplier: "Packaging Co",
      contract_file: "Packaging Co — price list.pdf",
      invoice_file: "Purchase invoices — Q4 2025.xlsx",
      agreed_unit_price: "£0.38/unit",
      invoiced_unit_price: "£0.38/unit",
      overcharge: 0,
      status: "OK",
      issue: "Invoices match the price list — no action needed.",
    },
  ],
};

// ---- Assemble --------------------------------------------------------------
const dataset = {
  meta: {
    id: "harbor",
    name: "Harbor & Co",
    sector: "Ecommerce (DTC brand)",
    currency: "GBP",
    currency_symbol: "£",
    period_start: periods[0].period,
    period_end: periods[periods.length - 1].period,
    period_granularity: "monthly",
    units: "All figures are in GBP, per month unless stated otherwise. Percentages are stated as percent (e.g. 45 means 45%). Revenue is highly seasonal — compare like-for-like months or use trailing-twelve-month (TTM) figures, not raw month-on-month.",
    fiscal_year_end: "December",
  },
  summary_current: {
    as_of: last.period,
    revenue_last_month: last.revenue,
    revenue_prev_month: prev.revenue,
    revenue_same_month_last_year: monthly[monthly.length - 13].revenue,
    revenue_yoy_growth_pct: r1(
      ((last.revenue - monthly[monthly.length - 13].revenue) /
        monthly[monthly.length - 13].revenue) * 100
    ),
    gross_margin_pct: last.gross_margin_pct,
    cash: last.closing_cash,
    inventory: last.inventory,
    operating_income_last_month: last.operating_income,
    ttm_revenue,
    ttm_revenue_growth_pct: r1(((ttm_revenue - ttm_revenue_prior) / ttm_revenue_prior) * 100),
    ttm_operating_income,
    ttm_operating_income_prior_year: ttm_oi_prior,
    best_month_2025: { period: best.period, label: best.label, revenue: best.revenue },
    worst_month_2025: { period: worst.period, label: worst.label, revenue: worst.revenue },
    seasonality_ratio_peak_to_trough: r1(best.revenue / worst.revenue),
    headcount: headcount.total,
    ap_total: ap.total_outstanding,
    ap_over_60_days: ap.over_60_days,
  },
  monthly,
  inventory_note:
    "Inventory peaks in Sep-Oct as stock is bought in for the Nov-Dec peak, then draws down. This is the main use of cash in the business.",
  accounts_payable: ap,
  accounts_receivable: ar,
  headcount,
  expense_categories,
  cost_assurance,
  team,
  source_files,
};

const out = join(__dirname, "harbor.json");
writeFileSync(out, JSON.stringify(dataset, null, 2));

// ---- Console sanity check --------------------------------------------------
console.log("Wrote", out);
console.log("Dec 2025 revenue:", last.revenue, "| Nov:", prev.revenue, "| GM%:", last.gross_margin_pct);
console.log("Peak/trough 2025:", best.label, best.revenue, "/", worst.label, worst.revenue, "ratio", r1(best.revenue / worst.revenue));
console.log("Cash Dec 2025:", last.closing_cash, "| Inventory:", last.inventory, "| Opening cash Jan 2024:", monthly[0].opening_cash);
console.log("TTM revenue:", ttm_revenue, "| TTM op income:", ttm_operating_income, "| prior-yr TTM OI:", ttm_oi_prior);
console.log("2025 monthly op income:", m2025.map((m) => m.operating_income).join(", "));
console.log("Aug 2025 marketing (anomaly):", monthly.find((m) => m.period === "2025-08").opex_marketing,
  "vs Jul:", monthly.find((m) => m.period === "2025-07").opex_marketing);
