import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { EFFORT, MAX_OUTPUT_TOKENS, QUERY_MODEL, USE_THINKING } from "@/lib/config";
import { getDataset } from "@/lib/server/datasets";
import { buildSystemPrompt } from "@/lib/server/prompt";
import type { AnswerPayload } from "@/lib/types";

export const runtime = "nodejs";

const MAX_QUESTION_LEN = 600;

// JSON schema for structured outputs — guarantees the model returns exactly the
// shape the answer card expects (no fragile free-text JSON parsing).
const ANSWER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: "string" },
    headline_number: { type: ["string", "null"] },
    drivers: { type: "string" },
    source_rows: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          period: { type: "string" },
          value: { type: "string" },
        },
        required: ["label", "period", "value"],
      },
    },
    chart: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            type: { type: "string", enum: ["line", "bar"] },
            title: { type: "string" },
            unit: { type: "string" },
            series: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  points: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        x: { type: "string" },
                        y: { type: "number" },
                      },
                      required: ["x", "y"],
                    },
                  },
                },
                required: ["name", "points"],
              },
            },
          },
          required: ["type", "title", "unit", "series"],
        },
        { type: "null" },
      ],
    },
  },
  required: ["answer", "headline_number", "drivers", "source_rows", "chart"],
} as const;

function textFromMessage(message: Anthropic.Message): string | null {
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : null;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The query engine isn't configured yet (missing API key)." },
      { status: 503 }
    );
  }

  let body: { question?: unknown; companyId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const companyId = typeof body.companyId === "string" ? body.companyId : "";

  if (!question) {
    return NextResponse.json({ error: "Please ask a question." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LEN) {
    return NextResponse.json(
      { error: "That question is a bit long — please shorten it." },
      { status: 400 }
    );
  }

  const dataset = getDataset(companyId);
  if (!dataset) {
    return NextResponse.json({ error: "Unknown company." }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(
    dataset.meta.name,
    JSON.stringify(dataset)
  );

  const client = new Anthropic();

  async function callModel(): Promise<AnswerPayload | null> {
    const message = await client.messages.create({
      model: QUERY_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      thinking: USE_THINKING ? { type: "adaptive" } : { type: "disabled" },
      output_config: {
        effort: EFFORT,
        format: { type: "json_schema", schema: ANSWER_SCHEMA },
      },
      // Cache the dataset+prompt prefix: identical across questions for the same
      // company, so follow-up questions in a session skip re-processing it.
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: question }],
    });

    if (message.stop_reason === "refusal") return null;

    const text = textFromMessage(message);
    if (!text) return null;
    try {
      return JSON.parse(text) as AnswerPayload;
    } catch {
      return null;
    }
  }

  try {
    // Structured outputs make a malformed response very unlikely, but retry once
    // for the rare truncation/refusal before failing gracefully.
    let payload = await callModel();
    if (!payload) payload = await callModel();

    if (!payload) {
      return NextResponse.json(
        { error: "We couldn't produce a grounded answer just then. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "We're seeing a lot of demand right now — please try again in a moment." },
        { status: 429 }
      );
    }
    console.error("[/api/query] error:", err);
    return NextResponse.json(
      { error: "Something went wrong reading the numbers. Please try again." },
      { status: 500 }
    );
  }
}
