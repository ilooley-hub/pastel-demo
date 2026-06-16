// Generator for the Meridian Software dataset.
// Produces internally-consistent monthly financials that tie out across the
// P&L, cash, AR/AP, customers, headcount, and 2025 budget-vs-actual. Run with:
//   node data/generate-meridian.mjs
// Output: data/meridian.json
//
// All figures are GBP. Edit the assumptions below and re-run to tune the story.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const round = (n) => Math.round(n);
const r1 = (n) => Math.round(n * 10) / 10;

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
      monthIdx: m, // 0..11
    });
  }
}

// ---- MRR trajectory --------------------------------------------------------
// ~5%/mo through 2024, decelerating to ~2% by end of 2025. Lands MRR ~£180k.
const START_MRR = 72000;
const growth2024 = Array(11).fill(0.05); // Feb..Dec 2024
const growth2025 = [
  0.045, 0.043, 0.04, 0.038, 0.035, 0.032, 0.03, 0.027, 0.024, 0.022, 0.02, 0.018,
]; // Jan..Dec 2025
const monthlyGrowth = [...growth2024, ...growth2025]; // 23 transitions

const mrr = [START_MRR];
for (let i = 0; i < monthlyGrowth.length; i++) {
  mrr.push(mrr[i] * (1 + monthlyGrowth[i]));
}
const mrrR = mrr.map(round);

// ---- COGS mix (as % of revenue) — engineer a Q2 2025 hosting spike ---------
// Normal gross margin ~78% (COGS ~22%). Q2 2025 hosting jumps (one large
// customer's usage) and pushes gross margin down to ~68-71%.
const hostingPctFor = (p) => {
  const map = {
    "2025-04": 0.17,
    "2025-05": 0.19,
    "2025-06": 0.16,
    "2025-07": 0.11, // partially resolved after renegotiation
  };
  return map[p.period] ?? 0.09;
};
const SUPPORT_PCT = 0.08;
const OTHER_PCT = 0.05; // payment processing, third-party data

// ---- Opex paths ------------------------------------------------------------
const lerp = (a, b, t) => a + (b - a) * t;

const monthly = periods.map((p, i) => {
  const t = i / (periods.length - 1); // 0..1
  const revenue = mrrR[i];

  // MRR movement components (tie to the MRR delta exactly)
  const prev = i === 0 ? START_MRR : mrrR[i - 1];
  const delta = revenue - prev;
  const churned = round(0.015 * prev);
  const adds = delta + churned;
  const expansion = round(0.35 * adds);
  const newMrr = adds - expansion;

  // COGS
  const hostingPct = hostingPctFor(p);
  const cogs_hosting = round(revenue * hostingPct);
  const cogs_support = round(revenue * SUPPORT_PCT);
  const cogs_other = round(revenue * OTHER_PCT);
  const cogs = cogs_hosting + cogs_support + cogs_other;
  const gross_profit = revenue - cogs;
  const gross_margin_pct = r1((gross_profit / revenue) * 100);

  // Opex
  const opex_rd = round(lerp(78000, 112000, t));
  const ga = round(lerp(34000, 56000, t));
  const sm_plan = lerp(52000, 90000, t); // budgeted S&M path
  const h2_2025 = p.year === 2025 && p.monthIdx >= 6; // Jul-Dec 2025
  const sm_actual = round(sm_plan * (h2_2025 ? 1.08 : 1.0)); // overspend in H2
  const opex_total = opex_rd + sm_actual + ga;

  const operating_income = gross_profit - opex_total; // negative = loss
  const net_burn = -operating_income;

  return {
    period: p.period,
    label: p.label,
    mrr: revenue,
    new_mrr: newMrr,
    expansion_mrr: expansion,
    churned_mrr: -churned,
    revenue,
    cogs_hosting,
    cogs_support,
    cogs_other,
    cogs,
    gross_profit,
    gross_margin_pct,
    opex_sm: sm_actual,
    opex_rd,
    opex_ga: ga,
    opex_total,
    operating_income,
    net_burn,
    _sm_plan: round(sm_plan),
  };
});

// ---- Cash: anchor closing Dec 2025 at £1.40M, work backwards ---------------
const TARGET_CLOSING = 1400000;
const totalBurn = monthly.reduce((s, m) => s + m.net_burn, 0);
const startCash = TARGET_CLOSING + totalBurn; // opening Jan 2024 (post Series A)
let running = startCash;
for (const m of monthly) {
  m.opening_cash = round(running);
  running -= m.net_burn;
  m.closing_cash = round(running);
}

const last = monthly[monthly.length - 1];
const trailing3 = monthly.slice(-3);
const avgBurn3 = round(trailing3.reduce((s, m) => s + m.net_burn, 0) / 3);
const runwayMonths = r1(last.closing_cash / avgBurn3);

// ---- Customers (current, Dec 2025) -----------------------------------------
const revDec = last.revenue;
const topCustomers = [
  { name: "Northwind Trading", pct: 0.12, note: "Heavy API/data usage; primary driver of the Q2 2025 hosting cost spike." },
  { name: "Atlas Retail Group", pct: 0.085, note: "Largest invoice currently overdue (90+ days)." },
  { name: "Beacon Health", pct: 0.07, note: "" },
  { name: "Cedar Financial", pct: 0.055, note: "" },
  { name: "Pinnacle Media", pct: 0.05, note: "" },
].map((c) => ({ ...c, mrr: round(c.pct * revDec), pct_of_revenue: r1(c.pct * 100) }));

const otherNamed = [
  { name: "Lighthouse Logistics", pct: 0.038 },
  { name: "Quill & Co", pct: 0.032 },
  { name: "Summit Analytics", pct: 0.028 },
].map((c) => ({ ...c, mrr: round(c.pct * revDec), pct_of_revenue: r1(c.pct * 100), note: "" }));

const top5Pct = topCustomers.reduce((s, c) => s + c.pct, 0);
const namedPct = top5Pct + otherNamed.reduce((s, c) => s + c.pct, 0);
const otherTail = {
  name: "Other customers (≈45 accounts)",
  mrr: round((1 - namedPct) * revDec),
  pct_of_revenue: r1((1 - namedPct) * 100),
  note: "Long tail; no single account above 2% of revenue.",
};

// ---- Accounts receivable ---------------------------------------------------
const ar = {
  total_outstanding: 210000,
  aging: [
    { bucket: "Current (0-30 days)", amount: 112000 },
    { bucket: "31-60 days", amount: 38000 },
    { bucket: "61-90 days", amount: 34000 },
    { bucket: "90+ days", amount: 26000 },
  ],
  over_60_days: 60000,
  notable_overdue: [
    { customer: "Atlas Retail Group", amount: 18200, days_overdue: 96 },
    { customer: "Beacon Health", amount: 21000, days_overdue: 74 },
    { customer: "Pinnacle Media", amount: 12800, days_overdue: 68 },
    { customer: "Cedar Financial", amount: 8400, days_overdue: 91 },
  ],
};

// ---- Accounts payable ------------------------------------------------------
const ap = {
  total_outstanding: 84000,
  line_items: [
    { vendor: "Cloud hosting (infrastructure)", amount: 41000 },
    { vendor: "Contractors", amount: 18500 },
    { vendor: "Software & tools", amount: 14200 },
    { vendor: "Other", amount: 10300 },
  ],
};

// ---- Headcount -------------------------------------------------------------
const headcount = {
  total: 22,
  open_roles: 2,
  open_roles_detail: "2 budgeted engineering hires, not yet filled.",
  by_department: [
    { department: "Engineering", count: 11 },
    { department: "Sales & Marketing", count: 6 },
    { department: "G&A", count: 3 },
    { department: "Customer Success", count: 2 },
  ],
  avg_fully_loaded_cost_per_year: 95000,
};

// ---- 2025 budget vs actual -------------------------------------------------
const dec2024Mrr = monthly.find((m) => m.period === "2024-12").mrr;
const budget_2025 = monthly
  .filter((m) => m.period.startsWith("2025"))
  .map((m, idx) => {
    const revenue_budget = round(dec2024Mrr * Math.pow(1.035, idx + 1));
    return {
      period: m.period,
      label: m.label,
      revenue_budget,
      revenue_actual: m.revenue,
      revenue_variance: m.revenue - revenue_budget,
      sm_budget: m._sm_plan,
      sm_actual: m.opex_sm,
      sm_variance: m.opex_sm - m._sm_plan,
      rd_budget: round(m.opex_rd * 0.99),
      rd_actual: m.opex_rd,
      ga_budget: m.opex_ga,
      ga_actual: m.opex_ga,
    };
  });

// ---- Expense category summary (top 5, growth Jan 2024 -> Dec 2025) ---------
const first = monthly[0];
const cat = (label, a, b) => ({
  category: label,
  jan_2024: a,
  dec_2025: b,
  growth_pct: r1(((b - a) / a) * 100),
});
const expense_categories = [
  cat("Engineering & product (R&D)", first.opex_rd, last.opex_rd),
  cat("Sales & marketing", first.opex_sm, last.opex_sm),
  cat("Hosting & infrastructure", first.cogs_hosting, last.cogs_hosting),
  cat("G&A / admin", first.opex_ga, last.opex_ga),
  cat("Customer support", first.cogs_support, last.cogs_support),
].sort((a, b) => b.dec_2025 - a.dec_2025);

// ---- Strip internal helper fields off monthly ------------------------------
const monthlyClean = monthly.map(({ _sm_plan, ...rest }) => rest);

// ---- Assemble --------------------------------------------------------------
const dataset = {
  meta: {
    id: "meridian",
    name: "Meridian Software",
    sector: "B2B SaaS",
    currency: "GBP",
    currency_symbol: "£",
    period_start: periods[0].period,
    period_end: periods[periods.length - 1].period,
    period_granularity: "monthly",
    units: "All figures are in GBP, per month unless stated otherwise. Percentages are stated as percent (e.g. 78 means 78%).",
    fiscal_year_end: "December",
  },
  summary_current: {
    as_of: last.period,
    mrr: last.mrr,
    arr: last.mrr * 12,
    revenue_last_month: last.revenue,
    revenue_prev_month: monthly[monthly.length - 2].revenue,
    revenue_mom_growth_pct: r1(
      ((last.revenue - monthly[monthly.length - 2].revenue) /
        monthly[monthly.length - 2].revenue) *
        100
    ),
    gross_margin_pct: last.gross_margin_pct,
    cash: last.closing_cash,
    net_burn_last_month: last.net_burn,
    avg_net_burn_trailing_3mo: avgBurn3,
    runway_months: runwayMonths,
    headcount: headcount.total,
    open_roles: headcount.open_roles,
    top5_customer_concentration_pct: r1(top5Pct * 100),
    ar_total: ar.total_outstanding,
    ar_over_60_days: ar.over_60_days,
  },
  monthly: monthlyClean,
  customers: {
    as_of: last.period,
    top_customers: [...topCustomers, ...otherNamed],
    other: otherTail,
    top5_concentration_pct: r1(top5Pct * 100),
  },
  accounts_receivable: ar,
  accounts_payable: ap,
  headcount,
  budget_vs_actual_2025: budget_2025,
  expense_categories,
};

const out = join(__dirname, "meridian.json");
writeFileSync(out, JSON.stringify(dataset, null, 2));

// Console sanity check
console.log("Wrote", out);
console.log("Dec 2025 MRR:", last.mrr, "ARR:", last.mrr * 12);
console.log("Dec 2025 gross margin %:", last.gross_margin_pct);
console.log(
  "Q2 2025 gross margins:",
  monthly.filter((m) => ["2025-04", "2025-05", "2025-06"].includes(m.period)).map((m) => m.gross_margin_pct)
);
console.log("Cash Dec 2025:", last.closing_cash, "Opening Jan 2024:", monthly[0].opening_cash);
console.log("Avg burn (3mo):", avgBurn3, "Runway months:", runwayMonths);
console.log("Top-5 concentration %:", r1(top5Pct * 100));
