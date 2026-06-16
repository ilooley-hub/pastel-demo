// Central config for the query engine. Change the model in one place.

/**
 * Sonnet-class model — the right balance of reasoning quality and cost for this
 * grounded-financial-QA demo (per the PRD). Swap here to change everywhere.
 */
export const QUERY_MODEL = "claude-sonnet-4-6";

/** Upper bound on output tokens. */
export const MAX_OUTPUT_TOKENS = 4000;

/**
 * Thinking trades latency for reasoning depth. For this demo, snappy answers
 * matter (the "60-second wow"), and the data is explicit enough that Sonnet
 * answers correctly without extended thinking — so we keep thinking off and let
 * effort do the tuning. Flip to true if a future, harder dataset needs it.
 */
export const USE_THINKING = false;

/**
 * Effort governs reasoning/verbosity. "low" keeps the demo fast; the questions
 * are bounded and the figures are all present in the dataset.
 */
export const EFFORT: "low" | "medium" | "high" | "max" = "low";
