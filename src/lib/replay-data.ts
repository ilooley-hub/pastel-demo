// AUTO-GENERATED authentic answer fixtures for replay / demo-capture mode.
// Regenerate: run the app with a real ANTHROPIC_API_KEY, then
//   node scripts/capture-replay.mjs
import type { AnswerPayload } from "./types";

export const REPLAY_ANSWERS: Record<string, AnswerPayload> = {
  "meridian::What was revenue last month?": {
    "answer": "Revenue in December 2025 was £177,899, up £3,146 (1.8%) from £174,753 in November 2025.",
    "headline_number": "£177,899",
    "drivers": "MRR equals revenue for a pure SaaS business. New MRR of £3,749 and expansion MRR of £2,018 were partially offset by churned MRR of £2,621, driving the month-on-month increase.",
    "source_rows": [
      {
        "label": "Revenue — Dec 2025",
        "period": "2025-12",
        "value": "£177,899"
      },
      {
        "label": "Revenue — Nov 2025",
        "period": "2025-11",
        "value": "£174,753"
      },
      {
        "label": "New MRR — Dec 2025",
        "period": "2025-12",
        "value": "£3,749"
      },
      {
        "label": "Expansion MRR — Dec 2025",
        "period": "2025-12",
        "value": "£2,018"
      },
      {
        "label": "Churned MRR — Dec 2025",
        "period": "2025-12",
        "value": "-£2,621"
      }
    ],
    "sources_used": [
      {
        "name": "Management accounts — 2024-2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Monthly revenue and MRR movement figures"
      },
      {
        "name": "Stripe billing export — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "MRR breakdown: new, expansion, churned"
      }
    ],
    "agent": null,
    "chart": null
  },
  "meridian::Why did gross margin drop in Q2 2025?": {
    "answer": "Gross margin fell from 78% in Q1 2025 to 68–71% in Q2 2025 (Apr–Jun). The sole driver was a sharp spike in hosting costs: cogs_hosting jumped from £12,563 in Mar 2025 to £24,632 in Apr, £28,493 in May, and £24,762 in Jun — roughly double the prior run-rate. This was caused by Northwind Trading's heavy API and data usage, which drove infrastructure costs well above plan. All other cost lines (support, other COGS) continued their normal gradual increases.",
    "headline_number": "68%",
    "drivers": "Northwind Trading's API/data usage drove hosting costs to peak at £28,493 in May 2025, up from ~£12,500 in Mar. No other cost category showed an unusual move. Revenue growth continued normally, so the margin compression was entirely a COGS/hosting issue. Costs partially normalised in Jul–Aug as hosting dropped back toward £14–17k, and margin recovered to 76–78%.",
    "source_rows": [
      {
        "label": "Gross margin %",
        "period": "2025-03",
        "value": "78%"
      },
      {
        "label": "Gross margin %",
        "period": "2025-04",
        "value": "70%"
      },
      {
        "label": "Gross margin %",
        "period": "2025-05",
        "value": "68%"
      },
      {
        "label": "Gross margin %",
        "period": "2025-06",
        "value": "71%"
      },
      {
        "label": "Gross margin %",
        "period": "2025-07",
        "value": "76%"
      },
      {
        "label": "Gross margin %",
        "period": "2025-08",
        "value": "78%"
      },
      {
        "label": "Hosting COGS",
        "period": "2025-03",
        "value": "£12,563"
      },
      {
        "label": "Hosting COGS",
        "period": "2025-04",
        "value": "£24,632"
      },
      {
        "label": "Hosting COGS",
        "period": "2025-05",
        "value": "£28,493"
      },
      {
        "label": "Hosting COGS",
        "period": "2025-06",
        "value": "£24,762"
      },
      {
        "label": "Hosting COGS",
        "period": "2025-07",
        "value": "£17,535"
      },
      {
        "label": "Northwind Trading — noted as primary driver of Q2 2025 hosting spike",
        "period": "",
        "value": "see customer note"
      }
    ],
    "sources_used": [
      {
        "name": "Management accounts — 2024-2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Monthly COGS breakdown and gross margin %"
      },
      {
        "name": "Northwind Trading — MSA (signed).pdf",
        "type": "document",
        "used_for": "Customer note confirming Northwind as driver of hosting spike"
      }
    ],
    "agent": {
      "name": "Gross Margin Monitor",
      "frequency": "Every month, on each new data sync",
      "watches": "gross_margin_pct and cogs_hosting",
      "condition": "Flag if gross_margin_pct falls more than 3 percentage points below 78%, or if cogs_hosting exceeds £16,000 in any single month",
      "route_to": "Priya Anand"
    },
    "chart": {
      "type": "line",
      "title": "Hosting COGS vs Gross Margin % — Jan to Aug 2025",
      "unit": "£",
      "series": [
        {
          "name": "Hosting COGS (£)",
          "points": [
            {
              "x": "Jan 2025",
              "y": 11582
            },
            {
              "x": "Feb 2025",
              "y": 12080
            },
            {
              "x": "Mar 2025",
              "y": 12563
            },
            {
              "x": "Apr 2025",
              "y": 24632
            },
            {
              "x": "May 2025",
              "y": 28493
            },
            {
              "x": "Jun 2025",
              "y": 24762
            },
            {
              "x": "Jul 2025",
              "y": 17535
            },
            {
              "x": "Aug 2025",
              "y": 14734
            }
          ]
        }
      ]
    }
  },
  "meridian::Compare our customer contracts to what we're billing — are we capturing all the revenue?": {
    "answer": "No. Two of three sampled accounts are being under-billed, leaving £28,716/year uncaptured. Northwind Trading has never had its 2025 contractual 7% price uplift applied in Stripe — that's a £1,493/month gap (£17,916/year). Atlas Retail Group has averaged 95,000 API calls/month against a 50,000-call allowance, but the £0.02/call overage has never been invoiced since July 2025 — that's £900/month (£10,800/year), plus £5,400 already backdated and unbilled. Beacon Health is fine — billing matches contract. Both under-billed accounts are owned by Tom Reilly; he should action both immediately.",
    "headline_number": "£28,716/year under-billed",
    "drivers": "Northwind: contract (signed MSA) includes a 7% annual uplift effective 1 Jan 2025, lifting the monthly fee from £21,330 to £22,823. Stripe has never been updated. Atlas Retail: order form sets a base of £8,000/month including 50,000 API calls, with overage at £0.02/call. API usage logs show average monthly calls of 95,000 — 45,000 over the limit — generating £900/month in unbilled overage. This has been missed since July 2025 (6 months = £5,400 backdated). Beacon Health contract checked and billing is correct.",
    "source_rows": [
      {
        "label": "Northwind — contracted monthly (post-uplift)",
        "period": "2025",
        "value": "£22,823"
      },
      {
        "label": "Northwind — billed monthly",
        "period": "2025",
        "value": "£21,330"
      },
      {
        "label": "Northwind — monthly gap",
        "period": "2025",
        "value": "£1,493"
      },
      {
        "label": "Northwind — annual gap",
        "period": "2025",
        "value": "£17,916"
      },
      {
        "label": "Atlas Retail — avg monthly API calls",
        "period": "2025",
        "value": "95,000"
      },
      {
        "label": "Atlas Retail — included API calls",
        "period": "2025",
        "value": "50,000"
      },
      {
        "label": "Atlas Retail — overage calls",
        "period": "2025",
        "value": "45,000"
      },
      {
        "label": "Atlas Retail — monthly overage gap",
        "period": "2025",
        "value": "£900"
      },
      {
        "label": "Atlas Retail — annual gap",
        "period": "2025",
        "value": "£10,800"
      },
      {
        "label": "Atlas Retail — backdated unbilled",
        "period": "Jul–Dec 2025",
        "value": "£5,400"
      },
      {
        "label": "Total annualised under-billing",
        "period": "2025",
        "value": "£28,716"
      }
    ],
    "sources_used": [
      {
        "name": "Northwind Trading — MSA (signed).pdf",
        "type": "document",
        "used_for": "Confirmed 7% annual uplift clause effective 1 Jan 2025, giving contracted monthly rate of £22,823"
      },
      {
        "name": "Stripe billing export — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Confirmed Northwind billed at £21,330/month — uplift never applied"
      },
      {
        "name": "Atlas Retail — Order Form.pdf",
        "type": "document",
        "used_for": "Confirmed £8,000/month base with 50,000 API call allowance and £0.02/call overage rate"
      },
      {
        "name": "API usage log — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Confirmed Atlas Retail average monthly usage of 95,000 calls — overage never invoiced"
      },
      {
        "name": "Beacon Health — MSA.pdf",
        "type": "document",
        "used_for": "Verified CPI uplift terms — billing confirmed correct"
      }
    ],
    "agent": {
      "name": "Monthly billing-vs-contract check",
      "frequency": "Every month, on each new data sync",
      "watches": "Contracted rate and usage allowances vs actual Stripe invoices and API usage log for all customers",
      "condition": "Any customer where billed amount is more than 2% below contracted amount, or where API usage exceeds included allowance and no overage invoice has been raised",
      "route_to": "Tom Reilly (account owner for Northwind Trading and Atlas Retail Group); Priya Anand (FP&A / Finance Lead) for overall sign-off"
    },
    "chart": {
      "type": "bar",
      "title": "Annual revenue gap by under-billed account",
      "unit": "£",
      "series": [
        {
          "name": "Annual under-billing",
          "points": [
            {
              "x": "Northwind Trading",
              "y": 17916
            },
            {
              "x": "Atlas Retail Group",
              "y": 10800
            }
          ]
        }
      ]
    }
  },
  "meridian::Can we afford to hire two engineers at £80k each? What does it do to runway?": {
    "answer": "At £95k fully-loaded cost per head (the dataset's stated average), two engineers cost £190k/year or £15,833/month extra — not £160k, because salary is only part of the bill. Current avg net burn (trailing 3 months) is £124,746/month. Adding those two hires takes monthly burn to ~£140,579. With £1.4m cash, that gives roughly 10.0 months of runway, down from 11.2 months today. You can afford it, but it tightens an already-tight position — you'd want a fundraise or clear path to cash-flow breakeven within 9 months of hiring.",
    "headline_number": "10.0 months",
    "drivers": "Fully-loaded cost (salary + NI + benefits + equipment) is assumed at £95k/year per head (the dataset's own figure) regardless of the £80k base salary stated in the question. Two hires = £190k/year = £15,833/month incremental burn. New monthly burn = £124,746 + £15,833 = £140,579. Runway = £1,400,000 ÷ £140,579 = 9.96 months, rounded to 10.0. Revenue is growing (~1.8% MoM) which will slowly reduce net burn, so 10 months is a conservative floor.",
    "source_rows": [
      {
        "label": "Closing cash (Dec 2025)",
        "period": "2025-12",
        "value": "£1,400,000"
      },
      {
        "label": "Avg net burn (trailing 3 months)",
        "period": "2025-12",
        "value": "£124,746"
      },
      {
        "label": "Current runway",
        "period": "2025-12",
        "value": "11.2 months"
      },
      {
        "label": "Avg fully-loaded cost per head",
        "period": "",
        "value": "£95,000/year"
      },
      {
        "label": "Incremental monthly burn (2 hires)",
        "period": "",
        "value": "£15,833"
      },
      {
        "label": "New monthly burn estimate",
        "period": "",
        "value": "£140,579"
      },
      {
        "label": "New runway estimate",
        "period": "",
        "value": "10.0 months"
      }
    ],
    "sources_used": [
      {
        "name": "Management accounts — 2024-2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Closing cash, net burn figures"
      },
      {
        "name": "Payroll summary — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Avg fully-loaded cost per head (£95k)"
      },
      {
        "name": "Headcount plan — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Confirmed 2 open engineering roles budgeted"
      }
    ],
    "agent": null,
    "chart": {
      "type": "bar",
      "title": "Runway: before vs after hiring two engineers",
      "unit": "months",
      "series": [
        {
          "name": "Runway (months)",
          "points": [
            {
              "x": "Current",
              "y": 11.2
            },
            {
              "x": "After 2 hires",
              "y": 10
            }
          ]
        }
      ]
    }
  },
  "harbor::How seasonal is our revenue across the year?": {
    "answer": "Very seasonal. Revenue swings from a trough of £156,164 in Feb 2025 to a peak of £456,289 in Dec 2025 — a 2.9x peak-to-trough ratio. The pattern is consistent: Q1–Q2 are soft, a build starts in Aug–Sep as inventory is stocked up, and Nov–Dec are the real money months (Black Friday + Christmas). Like-for-like, every month in 2025 beat 2024, with full-year TTM revenue up 23.9%.",
    "headline_number": "2.9x peak-to-trough",
    "drivers": "Seasonality is driven by gifting and festive demand in Nov–Dec, which dwarfs the rest of the year. Feb is structurally the weakest month. The Sep–Oct inventory build (cash outflow) is the operational consequence of this pattern — stock must be bought 6–8 weeks before the peak.",
    "source_rows": [
      {
        "label": "Worst month — Feb 2025",
        "period": "2025-02",
        "value": "£156,164"
      },
      {
        "label": "Best month — Dec 2025",
        "period": "2025-12",
        "value": "£456,289"
      },
      {
        "label": "Peak-to-trough ratio",
        "period": "2025",
        "value": "2.9x"
      },
      {
        "label": "TTM revenue growth YoY",
        "period": "2025-12",
        "value": "23.9%"
      },
      {
        "label": "Nov 2025 revenue",
        "period": "2025-11",
        "value": "£402,380"
      },
      {
        "label": "Nov 2024 revenue",
        "period": "2024-11",
        "value": "£324,835"
      }
    ],
    "sources_used": [
      {
        "name": "Management accounts — 2024-2025.xlsx",
        "type": "spreadsheet",
        "used_for": "Monthly revenue figures across 2024 and 2025"
      }
    ],
    "agent": null,
    "chart": {
      "type": "bar",
      "title": "Monthly Revenue — 2024 vs 2025",
      "unit": "£",
      "series": [
        {
          "name": "2024",
          "points": [
            {
              "x": "Jan",
              "y": 127280
            },
            {
              "x": "Feb",
              "y": 126069
            },
            {
              "x": "Mar",
              "y": 153293
            },
            {
              "x": "Apr",
              "y": 166940
            },
            {
              "x": "May",
              "y": 182875
            },
            {
              "x": "Jun",
              "y": 176765
            },
            {
              "x": "Jul",
              "y": 168460
            },
            {
              "x": "Aug",
              "y": 187083
            },
            {
              "x": "Sep",
              "y": 210289
            },
            {
              "x": "Oct",
              "y": 242348
            },
            {
              "x": "Nov",
              "y": 324835
            },
            {
              "x": "Dec",
              "y": 368355
            }
          ]
        },
        {
          "name": "2025",
          "points": [
            {
              "x": "Jan",
              "y": 157664
            },
            {
              "x": "Feb",
              "y": 156164
            },
            {
              "x": "Mar",
              "y": 189887
            },
            {
              "x": "Apr",
              "y": 206792
            },
            {
              "x": "May",
              "y": 226531
            },
            {
              "x": "Jun",
              "y": 218962
            },
            {
              "x": "Jul",
              "y": 208675
            },
            {
              "x": "Aug",
              "y": 231743
            },
            {
              "x": "Sep",
              "y": 260489
            },
            {
              "x": "Oct",
              "y": 300202
            },
            {
              "x": "Nov",
              "y": 402380
            },
            {
              "x": "Dec",
              "y": 456289
            }
          ]
        }
      ]
    }
  },
  "vantage::How exposed are we to our biggest clients?": {
    "answer": "Revenue is heavily concentrated. The top client (Brightline Bank) represents 21% of TTM billings, and the top 5 together account for 62%. Brightline's MSA is also up for renewal in Q1 2026, making this the single biggest near-term risk. Losing Brightline alone would wipe out roughly £346k of the £1.65m TTM revenue base.",
    "headline_number": "62%",
    "drivers": "Top-5 concentration of 62% is high for a 15-person agency. Any single client departure or renewal failure creates a material revenue hole. Brightline is the most acute risk given the imminent contract renewal. Cairn Energy (14%) and Wexford Retail (11%) add further concentration, and both have current AR issues (overdue invoices and a disputed milestone respectively).",
    "source_rows": [
      {
        "label": "TTM Revenue",
        "period": "2025-12",
        "value": "£1,649,683"
      },
      {
        "label": "Brightline Bank — TTM billings",
        "period": "2025-12",
        "value": "£346,433 (21%)"
      },
      {
        "label": "Cairn Energy — TTM billings",
        "period": "2025-12",
        "value": "£230,956 (14%)"
      },
      {
        "label": "Wexford Retail — TTM billings",
        "period": "2025-12",
        "value": "£181,465 (11%)"
      },
      {
        "label": "Halcyon Health — TTM billings",
        "period": "2025-12",
        "value": "£148,471 (9%)"
      },
      {
        "label": "Toll & Park — TTM billings",
        "period": "2025-12",
        "value": "£115,478 (7%)"
      },
      {
        "label": "Top-3 concentration",
        "period": "2025-12",
        "value": "46%"
      },
      {
        "label": "Top-5 concentration",
        "period": "2025-12",
        "value": "62%"
      },
      {
        "label": "Brightline MSA renewal",
        "period": "Q1 2026",
        "value": "At risk"
      }
    ],
    "sources_used": [
      {
        "name": "Client list & concentration — 2025.xlsx",
        "type": "spreadsheet",
        "used_for": "TTM billings and concentration percentages by client"
      },
      {
        "name": "Brightline Bank — SOW + CO2 (signed).pdf",
        "type": "document",
        "used_for": "MSA renewal timing noted in Q1 2026"
      }
    ],
    "agent": {
      "name": "Client Concentration Monitor",
      "frequency": "Every month, on each new data sync",
      "watches": "Top-1 and top-5 revenue concentration percentages",
      "condition": "Alert if top-1 client exceeds 20% of TTM revenue or top-5 exceeds 60%",
      "route_to": "Sam Ortiz"
    },
    "chart": {
      "type": "bar",
      "title": "Top 5 Client Concentration (% of TTM Revenue)",
      "unit": "%",
      "series": [
        {
          "name": "% of TTM Revenue",
          "points": [
            {
              "x": "Brightline Bank",
              "y": 21
            },
            {
              "x": "Cairn Energy",
              "y": 14
            },
            {
              "x": "Wexford Retail",
              "y": 11
            },
            {
              "x": "Halcyon Health",
              "y": 9
            },
            {
              "x": "Toll & Park",
              "y": 7
            }
          ]
        }
      ]
    }
  }
};
