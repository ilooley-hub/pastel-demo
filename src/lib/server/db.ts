// Neon (serverless Postgres) access for lead capture. Server-only.
// Uses the HTTP driver, which is ideal for serverless route handlers — no
// connection pooling to manage. The connection string is read from the
// environment so it never ships to the client.
//
// Set DATABASE_URL (Neon's Vercel integration also provides POSTGRES_URL) to a
// Neon connection string. When it's unset, isDbConfigured() returns false and
// the lead route degrades gracefully instead of throwing.

import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

export function isDbConfigured(): boolean {
  return connectionString.length > 0;
}

export type LeadInput = {
  name: string;
  email: string;
  company?: string | null;
  question?: string | null; // free-text "what would you ask of your own data"
  sampleQuestionsAsked?: string[]; // questions they tried in the demo
  companyViewed?: string | null; // which sample company was active
  source?: string | null; // where the CTA was clicked: header | soft_prompt
  userAgent?: string | null;
};

// Create the table once per server instance (idempotent and cheap).
let ensured = false;

/** Insert a lead. Throws if DATABASE_URL is not configured or the insert fails. */
export async function insertLead(lead: LeadInput): Promise<string> {
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  const sql = neon(connectionString);
  if (!ensured) {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        question TEXT,
        sample_questions_asked JSONB NOT NULL DEFAULT '[]'::jsonb,
        company_viewed TEXT,
        source TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    ensured = true;
  }
  const rows = (await sql`
    INSERT INTO leads
      (name, email, company, question, sample_questions_asked, company_viewed, source, user_agent)
    VALUES
      (${lead.name}, ${lead.email}, ${lead.company ?? null}, ${lead.question ?? null},
       ${JSON.stringify(lead.sampleQuestionsAsked ?? [])}::jsonb,
       ${lead.companyViewed ?? null}, ${lead.source ?? null}, ${lead.userAgent ?? null})
    RETURNING id
  `) as { id: string }[];
  return rows[0]?.id;
}
