// Best-effort "new lead" notification to the Pastel team. Server-only.
// If LEAD_NOTIFY_WEBHOOK is set, we POST a JSON payload to it. The body shape
// ({ text, lead }) works directly with a Slack incoming webhook and is also
// generic enough for any other webhook consumer. Failures are swallowed by the
// caller so they never affect the user-facing submission.

import type { LeadInput } from "./db";

export async function notifyTeam(lead: LeadInput, stored: boolean): Promise<void> {
  const url = process.env.LEAD_NOTIFY_WEBHOOK;
  if (!url) return;

  const asked = lead.sampleQuestionsAsked?.length
    ? lead.sampleQuestionsAsked.join(" · ")
    : "—";
  const text = [
    `🌸 New Pastel demo lead: *${lead.name}* <${lead.email}>${lead.company ? ` — ${lead.company}` : ""}`,
    `Viewing: ${lead.companyViewed ?? "?"}  ·  CTA: ${lead.source ?? "?"}  ·  Stored: ${stored ? "yes" : "NO (check DB)"}`,
    `Wants to ask: ${lead.question ?? "—"}`,
    `Tried in demo: ${asked}`,
  ].join("\n");

  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, lead, stored }),
  });
}
