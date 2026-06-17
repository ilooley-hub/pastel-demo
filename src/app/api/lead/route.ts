// Lead-capture endpoint. Validates input, stores the lead in Neon, and fires a
// best-effort team notification. Server-only; the DB connection string and any
// webhook live in environment variables.

import { NextResponse } from "next/server";
import { LEAD_RATE } from "@/lib/config";
import { insertLead, isDbConfigured, type LeadInput } from "@/lib/server/db";
import { notifyTeam } from "@/lib/server/notify";
import { clientIp, enforceRateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

// Pragmatic email check — good enough to catch typos without rejecting valid
// addresses. Real verification happens when we email them.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const rl = await enforceRateLimit(clientIp(req), [
    { name: "lead-min", limit: LEAD_RATE.perMinute, windowSec: 60 },
    { name: "lead-day", limit: LEAD_RATE.perDay, windowSec: 86400 },
  ]);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many submissions — please try again in a minute." },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid work email." },
      { status: 400 }
    );
  }

  const sampleQuestionsAsked = Array.isArray(body.sampleQuestionsAsked)
    ? body.sampleQuestionsAsked
        .filter((q): q is string => typeof q === "string")
        .slice(0, 50)
        .map((q) => q.slice(0, 300))
    : [];

  const lead: LeadInput = {
    name,
    email,
    company: clean(body.company, 200) || null,
    question: clean(body.question, 2000) || null,
    companyViewed: clean(body.companyViewed, 100) || null,
    source: clean(body.source, 50) || null,
    sampleQuestionsAsked,
    userAgent: req.headers.get("user-agent")?.slice(0, 400) ?? null,
  };

  let stored = false;
  if (isDbConfigured()) {
    try {
      await insertLead(lead);
      stored = true;
    } catch (err) {
      // DB is configured but the write failed — surface it so we don't silently
      // drop a real lead. The user sees a friendly retry message.
      console.error("[lead] insert failed:", err);
      return NextResponse.json(
        { error: "Something went wrong saving that. Please try again." },
        { status: 500 }
      );
    }
  } else {
    // No DATABASE_URL yet (e.g. before credentials are added) — let the funnel
    // work so the demo is usable, but log loudly that nothing was persisted.
    console.warn(
      "[lead] DATABASE_URL not set — lead NOT persisted:",
      JSON.stringify({ name: lead.name, email: lead.email, company: lead.company })
    );
  }

  // Best-effort notification; never blocks or fails the response.
  notifyTeam(lead, stored).catch((e) => console.error("[lead] notify failed:", e));

  return NextResponse.json({ ok: true, stored });
}
