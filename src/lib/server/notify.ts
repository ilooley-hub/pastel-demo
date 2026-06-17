// "New lead" notifications to the Pastel team. Server-only. Two independent,
// optional channels run on every submission — each guarded by its own env vars
// and isolated so one failing never blocks the other or the user's response:
//   • Email  — via Resend, if RESEND_API_KEY + LEAD_NOTIFY_EMAIL are set
//   • Webhook — Slack-compatible, if LEAD_NOTIFY_WEBHOOK is set

import { Resend } from "resend";
import type { LeadInput } from "./db";

export async function notifyTeam(lead: LeadInput, stored: boolean): Promise<void> {
  const results = await Promise.allSettled([
    notifyEmail(lead, stored),
    notifyWebhook(lead, stored),
  ]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[lead] notification failed:", r.reason);
  }
}

// ---- Email (Resend) --------------------------------------------------------
async function notifyEmail(lead: LeadInput, stored: boolean): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return; // not configured → skip silently

  // Sender must be on a Resend-verified domain in production. The resend.dev
  // address works out of the box for testing to your own account email.
  const from = process.env.LEAD_FROM_EMAIL || "Pastel Demo <onboarding@resend.dev>";
  const recipients = to.split(",").map((s) => s.trim()).filter(Boolean);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: recipients,
    replyTo: lead.email, // reply goes straight to the prospect
    subject: `New Pastel demo lead: ${lead.name}${lead.company ? ` — ${lead.company}` : ""}`,
    html: emailHtml(lead, stored),
  });
  if (error) throw new Error(`Resend: ${error.message ?? JSON.stringify(error)}`);
}

function emailHtml(lead: LeadInput, stored: boolean): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:6px 14px 6px 0;color:#84826f;font:600 12px/1.4 -apple-system,Segoe UI,sans-serif;white-space:nowrap;vertical-align:top">${label}</td>
       <td style="padding:6px 0;color:#17161c;font:14px/1.5 -apple-system,Segoe UI,sans-serif">${value || "—"}</td>
     </tr>`;
  const asked = lead.sampleQuestionsAsked?.length
    ? lead.sampleQuestionsAsked.map((q) => `• ${esc(q)}`).join("<br>")
    : "—";

  return `
  <div style="max-width:560px;margin:0 auto;background:#fbfaf6;border:1px solid #e7e3d6;border-radius:14px;padding:24px">
    <p style="margin:0 0 4px;font:600 12px/1 -apple-system,Segoe UI,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6e62c8">New demo lead</p>
    <h1 style="margin:0 0 16px;font:700 22px/1.2 Georgia,serif;color:#17161c">${esc(lead.name)}</h1>
    <table style="border-collapse:collapse;width:100%">
      ${row("Email", `<a href="mailto:${esc(lead.email)}" style="color:#6e62c8">${esc(lead.email)}</a>`)}
      ${row("Company", esc(lead.company || ""))}
      ${row("Wants to ask", esc(lead.question || ""))}
      ${row("Viewing", esc(lead.companyViewed || ""))}
      ${row("CTA", esc(lead.source || ""))}
      ${row("Tried in demo", asked)}
      ${row("Stored in DB", stored ? "Yes" : "NO — check DATABASE_URL")}
    </table>
    <p style="margin:18px 0 0;color:#a8a690;font:12px/1.4 -apple-system,Segoe UI,sans-serif">Reply to this email to reach the prospect directly.</p>
  </div>`;
}

// ---- Webhook (Slack-compatible) --------------------------------------------
async function notifyWebhook(lead: LeadInput, stored: boolean): Promise<void> {
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

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, lead, stored }),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}
