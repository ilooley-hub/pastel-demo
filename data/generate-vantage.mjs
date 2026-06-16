// Generator for the Vantage Studio dataset (project-based services / agency).
// Lighter than Meridian but internally consistent: lumpy project revenue, a
// billable-utilization trend with a mid-2025 dip, client-concentration risk,
// healthier cash, lumpy AR, and a stated operating-margin target the business
// is working towards.
//   node data/generate-vantage.mjs   ->  data/vantage.json
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

// ---- Revenue: underlying growth x project lumpiness ------------------------
const BASE_START = 112000;
const BASE_GROWTH = 0.011; // ~1.1%/mo underlying
// Deterministic lumpiness (project starts/ends), mean ~1.0. Kept fixed so
// re-runs are reproducible.
const LUMP = [
  0.93, 1.04, 0.88, 1.11, 0.97, 1.07, 0.85, 0.92, 1.14, 1.01, 0.95, 1.16,
  0.91, 1.09, 0.87, 1.05, 1.18, 0.90, 0.84, 1.12, 1.00, 0.97, 1.06, 1.15,
];

// ---- Billable utilization (%) — trend with a mid-2025 dip ------------------
const UTIL = [
  72, 74, 73, 76, 78, 77, 79, 80, 81, 80, 82, 83, // 2024
  81, 80, 78, 75, 72, 71, 73, 76, 77, 78, 79, 80, // 2025 (dip May-Jun)
];

// ---- One-off cost anomaly --------------------------------------------------
const TRAVEL_ANOMALY = { "2025-09": 24000 }; // company offsite + industry conference

const monthly = periods.map((p, i) => {
  const t = i / (periods.length - 1);
  const revenue = round(BASE_START * Math.pow(1 + BASE_GROWTH, i) * LUMP[i]);

  // COGS = subcontractors (freelance overflow) + other direct project costs.
  // The salaried team is opex below the line, so gross margin runs high (~84%).
  const cogs_subcontractors = round(revenue * 0.11);
  const cogs_direct = round(revenue * 0.05);
  const cogs = cogs_subcontractors + cogs_direct;
  const gross_profit = revenue - cogs;
  const gross_margin_pct = r1((gross_profit / revenue) * 100);

  // Opex — salaries are the main cost of delivery in a services firm
  const opex_salaries = round(lerp(55000, 71000, t)); // the consulting team
  const opex_software = round(lerp(4200, 8200, t));
  const opex_office_ga = round(lerp(10500, 15500, t));
  const opex_marketing_bd = round(lerp(3800, 7200, t));
  const opex_travel = round(lerp(2400, 3800, t)) + (TRAVEL_ANOMALY[p.period] ?? 0);

  const opex_total =
    opex_salaries + opex_software + opex_office_ga + opex_marketing_bd + opex_travel;
  const operating_income = gross_profit - opex_total;
  const operating_margin_pct = r1((operating_income / revenue) * 100);

  return {
    period: p.period,
    label: p.label,
    revenue,
    utilization_pct: UTIL[i],
    cogs_subcontractors,
    cogs_direct,
    cogs,
    gross_profit,
    gross_margin_pct,
    opex_salaries,
    opex_software,
    opex_office_ga,
    opex_marketing_bd,
    opex_travel,
    opex_total,
    operating_income,
    operating_margin_pct,
  };
});

const last = monthly[monthly.length - 1];
const prev = monthly[monthly.length - 2];

// ---- TTM roll-ups (smooth out the lumpiness) -------------------------------
const ttm = (key) => monthly.slice(-12).reduce((s, m) => s + m[key], 0);
const ttmPrior = (key) => monthly.slice(-24, -12).reduce((s, m) => s + m[key], 0);
const ttm_revenue = ttm("revenue");
const ttm_operating_income = ttm("operating_income");
const ttm_operating_margin_pct = r1((ttm_operating_income / ttm_revenue) * 100);
const ttm_revenue_prior = ttmPrior("revenue");
const ttm_oi_prior = ttmPrior("operating_income");
const ttm_op_margin_prior = r1((ttm_oi_prior / ttm_revenue_prior) * 100);
const ttm_revenue_growth_pct = r1(((ttm_revenue - ttm_revenue_prior) / ttm_revenue_prior) * 100);

// 2025 utilization trend points
const u2025 = monthly.filter((m) => m.period.startsWith("2025"));

// ---- Cash: healthy; tracks operating income (anchor Dec 2025) --------------
const TARGET_CLOSING = 545000;
const totalOI = monthly.reduce((s, m) => s + m.operating_income, 0);
let running = TARGET_CLOSING - totalOI; // opening Jan 2024
monthly.forEach((m) => {
  m.opening_cash = round(running);
  running += m.operating_income;
  m.closing_cash = round(running);
});
const avgOI3 = round(monthly.slice(-3).reduce((s, m) => s + m.operating_income, 0) / 3);

// ---- Client concentration --------------------------------------------------
const clientDefs = [
  { name: "Brightline Bank", pct: 0.21, note: "Largest client; master services agreement up for renewal in Q1 2026." },
  { name: "Cairn Energy", pct: 0.14, note: "" },
  { name: "Wexford Retail", pct: 0.11, note: "" },
  { name: "Halcyon Health", pct: 0.09, note: "" },
  { name: "Toll & Park", pct: 0.07, note: "" },
];
const top_clients = clientDefs.map((c) => ({
  name: c.name,
  pct_of_revenue: r1(c.pct * 100),
  ttm_billings: round(c.pct * ttm_revenue),
  note: c.note,
}));
const top1Pct = clientDefs[0].pct;
const top3Pct = clientDefs.slice(0, 3).reduce((s, c) => s + c.pct, 0);
const top5Pct = clientDefs.reduce((s, c) => s + c.pct, 0);

// ---- Accounts receivable (lumpy; net-30/45 project invoices) ----------------
const ar = {
  total_outstanding: 192000,
  aging: [
    { bucket: "Current (0-30 days)", amount: 104000 },
    { bucket: "31-60 days", amount: 46000 },
    { bucket: "61-90 days", amount: 28000 },
    { bucket: "90+ days", amount: 14000 },
  ],
  over_60_days: 42000,
  notable_overdue: [
    { client: "Wexford Retail", amount: 22500, days_overdue: 68, note: "Disputed final milestone on a completed project." },
    { client: "Cairn Energy", amount: 14200, days_overdue: 73 },
    { client: "Toll & Park", amount: 7800, days_overdue: 92 },
  ],
  note: "AR is lumpy because it follows project-milestone invoicing. The 90+ bucket is a single disputed milestone.",
};

// ---- Headcount -------------------------------------------------------------
const headcount = {
  total: 15,
  billable: 12,
  open_roles: 0,
  by_department: [
    { department: "Consulting (billable)", count: 12 },
    { department: "Operations & delivery", count: 2 },
    { department: "G&A", count: 1 },
  ],
  avg_fully_loaded_cost_per_year: 74000,
};

// ---- Profit target ---------------------------------------------------------
const profit_target = {
  metric: "operating_margin_pct",
  target_value: 18,
  description: "Partners' stated goal: reach an 18% operating margin on a trailing-twelve-month basis.",
  current_ttm_operating_margin_pct: ttm_operating_margin_pct,
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
  cat("Salaries (team)", first.opex_salaries, last.opex_salaries),
  cat("Subcontractors", first.cogs_subcontractors, last.cogs_subcontractors),
  cat("Office & G&A", first.opex_office_ga, last.opex_office_ga),
  cat("Software & tools", first.opex_software, last.opex_software),
  cat("Marketing & business development", first.opex_marketing_bd, last.opex_marketing_bd),
  cat("Travel", first.opex_travel, last.opex_travel),
].sort((a, b) => b.dec_2025 - a.dec_2025);

// ---- Assemble --------------------------------------------------------------
const dataset = {
  meta: {
    id: "vantage",
    name: "Vantage Studio",
    sector: "Services / agency (project-based)",
    currency: "GBP",
    currency_symbol: "£",
    period_start: periods[0].period,
    period_end: periods[periods.length - 1].period,
    period_granularity: "monthly",
    units: "All figures are in GBP, per month unless stated otherwise. Percentages are stated as percent (e.g. 58 means 58%). Revenue is lumpy because it follows project timing — use trailing-twelve-month (TTM) figures for trends, not raw month-on-month.",
    fiscal_year_end: "December",
  },
  summary_current: {
    as_of: last.period,
    revenue_last_month: last.revenue,
    revenue_prev_month: prev.revenue,
    utilization_last_month_pct: last.utilization_pct,
    gross_margin_pct: last.gross_margin_pct,
    operating_income_last_month: last.operating_income,
    operating_margin_last_month_pct: last.operating_margin_pct,
    cash: last.closing_cash,
    avg_operating_income_trailing_3mo: avgOI3,
    ttm_revenue,
    ttm_revenue_growth_pct,
    ttm_operating_income,
    ttm_operating_margin_pct,
    ttm_operating_margin_prior_year_pct: ttm_op_margin_prior,
    target_operating_margin_pct: profit_target.target_value,
    headcount: headcount.total,
    billable_headcount: headcount.billable,
    top_client_concentration_pct: r1(top1Pct * 100),
    top3_client_concentration_pct: r1(top3Pct * 100),
    top5_client_concentration_pct: r1(top5Pct * 100),
    ar_total: ar.total_outstanding,
    ar_over_60_days: ar.over_60_days,
  },
  monthly,
  clients: {
    as_of: last.period,
    top_clients,
    top1_concentration_pct: r1(top1Pct * 100),
    top3_concentration_pct: r1(top3Pct * 100),
    top5_concentration_pct: r1(top5Pct * 100),
    note: "Revenue is concentrated: the top client is " + r1(top1Pct * 100) + "% and the top 5 are " + r1(top5Pct * 100) + "% of trailing-twelve-month billings.",
  },
  accounts_receivable: ar,
  headcount,
  profit_target,
  expense_categories,
};

const out = join(__dirname, "vantage.json");
writeFileSync(out, JSON.stringify(dataset, null, 2));

// ---- Console sanity check --------------------------------------------------
console.log("Wrote", out);
console.log("Dec 2025 revenue:", last.revenue, "| Nov:", prev.revenue, "| GM%:", last.gross_margin_pct);
console.log("Cash Dec 2025:", last.closing_cash, "| Opening cash Jan 2024:", monthly[0].opening_cash);
console.log("TTM revenue:", ttm_revenue, "growth%", ttm_revenue_growth_pct, "| TTM op margin%:", ttm_operating_margin_pct, "(target 18) | prior-yr:", ttm_op_margin_prior);
console.log("2025 utilization:", u2025.map((m) => m.utilization_pct).join(", "));
console.log("2025 op margin %:", u2025.map((m) => m.operating_margin_pct).join(", "));
console.log("Client concentration: top1", r1(top1Pct * 100), "top3", r1(top3Pct * 100), "top5", r1(top5Pct * 100));
console.log("Sep 2025 travel (anomaly):", monthly.find((m) => m.period === "2025-09").opex_travel, "vs Aug:", monthly.find((m) => m.period === "2025-08").opex_travel);
