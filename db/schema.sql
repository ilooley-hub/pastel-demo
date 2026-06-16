-- Lead-capture schema for the Pastel demo (Neon / Postgres).
--
-- The app auto-creates this table on the first successful insert (see
-- src/lib/server/db.ts), so running this by hand is OPTIONAL. It's kept here as
-- documentation and for anyone who prefers to provision the table up front.
--
-- Apply with:  psql "$DATABASE_URL" -f db/schema.sql
-- (or paste into the Neon SQL editor).

CREATE TABLE IF NOT EXISTS leads (
  id                     BIGSERIAL PRIMARY KEY,
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  company                TEXT,
  question               TEXT,                       -- "what would you ask of your own data?"
  sample_questions_asked JSONB NOT NULL DEFAULT '[]'::jsonb, -- questions tried in the demo
  company_viewed         TEXT,                       -- active sample company at submit
  source                 TEXT,                       -- CTA location: header | soft_prompt
  user_agent             TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Handy for sorting the newest leads first.
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
