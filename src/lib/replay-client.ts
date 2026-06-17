import type { AnswerPayload } from "./types";

/**
 * Replay / demo-capture mode: returns a pre-captured (authentic) answer instantly
 * instead of calling the API — for recording marketing videos with no latency,
 * cost, or variability. Enabled via ?replay=1. A short delay keeps the "thinking"
 * beat visible before the answer animates in. The fixtures are loaded lazily so
 * they're never in the normal app bundle.
 */
export async function replayAnswer(
  question: string,
  companyId: string,
  delayMs = 800
): Promise<AnswerPayload> {
  const { REPLAY_ANSWERS } = await import("./replay-data");
  const answer = REPLAY_ANSWERS[`${companyId}::${question}`];
  await new Promise((r) => setTimeout(r, delayMs));
  if (!answer) {
    throw new Error("No replay answer is available for that question.");
  }
  return answer;
}
