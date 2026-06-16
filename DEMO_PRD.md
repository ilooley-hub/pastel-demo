Pastel Interactive Demo — Build PRD

Purpose: A public, self-serve "try it yourself" demo that lets a fractional CFO ask natural-language questions of a sample company's financials and see Pastel answer instantly. It is a top-of-funnel pipeline tool, not a product feature. The job is to make a skeptical buyer feel the value in 60 seconds, then capture them.

How to use this doc with Claude Code: Drop this file in the repo root as `DEMO_PRD.md`. Point Claude Code at it. Build in the phase order in section 16. Do not build everything at once. Get phase 1 working and deployed before moving on.

## 1. Goal
One sentence: a prospect lands on a page, asks (or clicks) financial questions about a realistic sample company, gets grounded answers that show their work, and is invited to run it on their own numbers.

Success looks like:
* A fractional CFO plays with it for 2+ minutes without instruction.
* They hit a "that would have taken me 20 minutes" moment.
* They give us an email to run it on their own data.

This is a marketing asset. Every channel (LinkedIn, outbound, ads, communities) points at this one URL.

## 2. Target user and positioning
Buyer: fractional CFO offices that serve multiple client companies. The pitch underneath the tool is that Pastel turns the CFO from a bottleneck their clients wait for into an always-on source of truth they brand and control. The demo should feel like a glimpse of that: a CFO querying a client's books in plain English and getting a board-ready answer.

Do not explain this in the UI. Show it.

## 3. Core experience (user flow)
1. User lands. Sees a sample company already loaded, a row of clickable example questions (chips), and a chat-style input.
2. User clicks a chip or types a question.
3. An answer card appears: headline answer, the key number, a short explanation of the drivers, an expandable "show the numbers" source view, and a small chart where it helps.
4. User asks more. A client switcher at the top lets them flip between 2-3 sample companies to feel the "all my clients in one place" idea.
5. After a few questions, a soft prompt and a persistent button invite them to "Run this on your own numbers," which opens the lead-capture step.

## 4. Tech stack
Use the existing Pastel stack. Do not introduce new frameworks.
* Next.js (App Router), TypeScript
* Tailwind CSS, shadcn/ui components
* Framer Motion for subtle transitions only
* Recharts for charts
* Anthropic Claude API for the query engine, called server-side only
* Neon for lead capture storage, or use formspree.io as I am using that on the pastel website already...I'm flexible.
* Vercel for hosting
* Vercel Analytics or PostHog for product analytics

Brand: Instrument Serif for display headings, DM Sans for body, lavender accent `#C8A2FF`. Match the existing getpastel.ai site.

## 5. Architecture
The query engine works by passing the sample company's financial data to Claude as context, alongside the user's question, and returning a structured, grounded answer.

Data flow:
1. Client sends the question and the selected company id to a Next.js route handler (`/api/query`).
2. The route handler loads that company's dataset from a local JSON file, builds the prompt, and calls the Claude API server-side.
3. Claude returns structured JSON: the answer, the headline number, the driver explanation, the source rows it used, and an optional chart spec.
4. The route handler returns that JSON to the client, which renders the answer card.

Hard rules:
* The Anthropic API key lives in an environment variable and is used only server-side in the route handler. It is never sent to or referenced in client code.
* The model only answers from the provided dataset. No outside knowledge, no invented numbers. This is enforced in the system prompt (see appendix) and made visible through the source view.
* Use a current Sonnet-class Claude model (e.g. `claude-sonnet-4-6`). It is the right balance of reasoning quality and cost for this. Make the model name a single config constant so it is easy to change.

## 6. Sample data spec
Create coherent, internally consistent monthly financial data as JSON files, one per company, in `/data`. The numbers across statements must tie out (revenue on the P&L matches the chart, cash movements match burn, etc). Design the data so the example questions have real, discoverable answers.

Company A — Meridian Software (primary, B2B SaaS). This is the one loaded by default and the richest.
* Period: 24 months, Jan 2024 to Dec 2025, monthly.
* Current MRR around £180k (ARR around £2.16M). Growth ~5% per month through 2024, slowing to ~2% in late 2025.
* Gross margin ~78%, but engineer a visible dip in Q2 2025 (down to ~70%) caused by a hosting and infrastructure cost spike tied to one large customer's usage. This makes "why did margin drop" answerable.
* Cash balance ~£1.4M, monthly net burn ~£120k, runway ~11 to 12 months.
* Headcount 22, with 2 open roles budgeted.
* Customer concentration: top 5 customers are ~38% of revenue.
* AR: ~£210k outstanding, ~£60k of it over 60 days.
* Opex categories: S&M, R&D, G&A. S&M running over budget in H2 2025.
* Include a simple budget vs actual for 2025.

Company B — Harbor & Co (ecommerce brand). Lighter dataset, same structure. Seasonal revenue, lower gross margin (~45%), inventory and a higher AP balance. Enough to answer the example questions.

Company C — Vantage Studio (services / agency). Lighter dataset. Project-based revenue, utilization and a small team, healthier cash, lumpy AR.

The switcher flips between these three. B and C exist mainly to sell the multi-client story, so they need to be credible but not exhaustive.

## 7. Example questions (the chips)
Show these as clickable chips. Group them so the user climbs from simple to impressive. Every chip must return a correct answer from the data.

Lookup
* "What was revenue last month?"
* "How much cash do we have right now?"

Analysis
* "Why did gross margin drop in Q2 2025?"
* "What are our top 5 expense categories and how have they grown?"
* "Show me revenue concentration. How exposed are we to our biggest customers?"

Decision
* "Can we afford to hire two engineers at £80k each? What does it do to runway?"
* "If revenue keeps growing at the current rate, when do we hit breakeven?"

Generation
* "Draft a board update for last month."
* "Summarise the three things I should flag to this client this month."

Monitoring
* "Flag anything unusual in last month's spend."
* "What is overdue in accounts receivable and how worried should I be?"

Adjust the wording to match the loaded company, but keep the five-rung ladder.

## 8. Answer output spec
Each answer renders as a card with:
* Headline answer. One or two sentences in plain English.
* The number. The key figure, large and clear.
* Drivers. A short explanation of what is behind it.
* Show the numbers. A collapsible section revealing the source rows or the calculation used. This is non-negotiable. Finance buyers do not trust black boxes, and they will not put one in front of their own clients. Auditability is the feature.
* Chart. A small Recharts visual only when it adds clarity (a trend, a breakdown). Skip it for simple lookups.

For generation questions (board update, summary), return formatted text the user could actually paste and send.

## 9. UI and screens
Single page. Sections top to bottom:
* Slim header: Pastel logo, a one-line frame ("Ask this company's financials anything"), and the persistent "Run it on your own numbers" button.
* Client switcher: a small control showing the three sample companies. Switching reloads the context and clears the thread.
* Example question chips, grouped subtly by the ladder.
* Input box, always visible, never a blank wall. The chips do the teaching.
* Answer thread below, newest at the bottom, chat-style.
* A clear "demo on sample data" label so it is honest about what they are seeing.

Mobile responsive. Clean, lots of whitespace, on brand.

## 10. Lead capture and conversion
Gate at peak interest, not at the door. Let them play freely first.
* A persistent header button: "Run it on your own numbers."
* After the user has asked 3 questions, surface a soft inline prompt with the same CTA.
* Clicking it opens a modal: name, work email, company, and an optional "what would you most want to ask of your own data" field.
* On submit, store the lead in Supabase (`leads` table: name, email, company, question, created_at, and which sample questions they asked if available), and trigger a notification to the Pastel team. Offer a Calendly link on the confirmation step.
* Do not wall the demo behind the form. Ungated play, gated conversion.

## 11. Design system
* Display headings: Instrument Serif.
* Body: DM Sans.
* Accent: lavender `#C8A2FF`. Use it sparingly, for emphasis and the primary CTA.
* Match getpastel.ai spacing and tone. Restrained, premium, no clutter.
* Framer Motion only for small, fast transitions (answer cards appearing, modal). No heavy animation.

## 12. Guardrails, edge cases, cost control
* Off-topic questions. If asked something the dataset cannot answer, respond gracefully: explain it can only answer questions about this company's financials, and suggest a couple of example questions. Never invent an answer.
* No hallucinated numbers. Enforced by the system prompt and the source view. If the model is unsure, it says so.
* Rate limiting. This is public and calls a paid API. Cap requests per session and per IP (e.g. a sensible per-minute and per-day limit) in the route handler to control cost and abuse. Return a friendly message when limits are hit.
* Loading and error states. Show a thinking state while the API runs. Handle API failures with a retry and a graceful message.
* Honesty. Label it clearly as a demo on sample data.

## 13. Analytics
Track, at minimum:
* Page views and unique sessions.
* Chips clicked vs questions typed.
* Number of questions per session.
* Which questions get asked most.
* Conversion: CTA clicks and form submissions.

This tells you which value lands, so you can lead with it in outbound.

## 14. Acceptance criteria
* A user can ask a free-form question and get a grounded, correct answer with a visible source view.
* All example chips return correct answers for all three companies.
* The client switcher changes the data context cleanly.
* Off-topic questions are handled without invented numbers.
* The lead form writes to Supabase and notifies the team.
* The API key is never exposed client-side.
* Rate limiting is active.
* It is responsive and on brand.
* It is deployed on Vercel at a Pastel subdomain.

## 15. Out of scope for v1
* Real customer data upload. That is the sales call, not the demo.
* User accounts or auth.
* Saving or sharing a session.
* More than three sample companies.
* Editing the underlying data in the UI.

Keep v1 tight. These can come later if the tool earns it.

## 16. Suggested build order
1. Skeleton. Next.js page, brand styling, static chips and input, one hardcoded answer. Deploy to Vercel. Prove the shell.
2. Query engine. Build `/api/query`, wire the Claude API server-side with Meridian's data and the system prompt. Get free-form answers returning as structured JSON and rendering in cards with the source view.
3. Example chips and the ladder. Make all chips work and return correct answers.
4. Charts and polish. Add Recharts where it helps. Tighten the card design.
5. Client switcher. Add Harbor & Co and Vantage Studio, wire the switcher.
6. Lead capture. Supabase table, modal, soft prompt, notification, Calendly.
7. Guardrails. Off-topic handling, rate limiting, error states.
8. Analytics. Wire events.
9. Final QA against acceptance criteria, then ship.

## Appendix: starter system prompt for the query engine
Use this as the system prompt sent with each query. The dataset for the selected company is injected where marked.

```
You are the query engine behind a financial intelligence demo for fractional CFOs.
You answer questions about ONE sample company using ONLY the financial data provided below.

DATA FOR {{COMPANY_NAME}}:
{{COMPANY_DATA_JSON}}

Rules:
- Use only the numbers in the data above. Never invent or estimate figures that are not derivable from it.
- If the question cannot be answered from this data, say so plainly and suggest two example questions you can answer.
- Always show your work. Cite the specific rows, periods, and calculations you used.
- Be concise and plain. No jargon, no hedging. Write the way a sharp CFO talks.
- For decision questions (hiring, spend), reason step by step using the data and state your assumptions.
- For generation questions (board update, summary), produce something the user could send as-is.

Return ONLY valid JSON in this shape, no preamble or markdown fences:
{
  "answer": "one to three sentence plain-English answer",
  "headline_number": "the single key figure, formatted, or null",
  "drivers": "short explanation of what is behind the answer",
  "source_rows": [ { "label": "...", "period": "...", "value": "..." } ],
  "chart": { "type": "line|bar|none", "title": "...", "series": [...] } or null
}
```

Parse the JSON safely on the server. If parsing fails, retry once, then return a graceful error.
