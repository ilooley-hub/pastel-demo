// Captures authentic answers from the running query engine and writes them to
// src/lib/replay-data.ts, so replay/demo-capture mode renders real, identical
// answers instantly (no API latency/cost) for recording.
//
// Usage: with the dev server running (npm run dev) and ANTHROPIC_API_KEY set:
//   node scripts/capture-replay.mjs            (defaults to http://localhost:3000)
//   BASE_URL=http://localhost:3100 node scripts/capture-replay.mjs

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SHOTS } from "./shots.mjs";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const __dirname = dirname(fileURLToPath(import.meta.url));

const out = {};
for (const { companyId, question } of SHOTS) {
  process.stderr.write(`→ ${companyId}: ${question}\n`);
  const res = await fetch(`${BASE_URL}/api/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, companyId }),
  });
  if (!res.ok) {
    process.stderr.write(`  FAILED (${res.status}) — ${await res.text()}\n`);
    continue;
  }
  out[`${companyId}::${question}`] = await res.json();
  await new Promise((r) => setTimeout(r, 1500)); // gentle on the rate limiter
}

const ts = `// AUTO-GENERATED authentic answer fixtures for replay / demo-capture mode.
// Regenerate: run the app with a real ANTHROPIC_API_KEY, then
//   node scripts/capture-replay.mjs
import type { AnswerPayload } from "./types";

export const REPLAY_ANSWERS: Record<string, AnswerPayload> = ${JSON.stringify(out, null, 2)};
`;
const dest = join(__dirname, "..", "src", "lib", "replay-data.ts");
writeFileSync(dest, ts);
process.stderr.write(`\nWrote ${dest} with ${Object.keys(out).length} answers.\n`);
