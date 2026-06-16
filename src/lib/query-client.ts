import { BASE_PATH } from "./base-path";
import type { AnswerPayload } from "./types";

/** Calls the server-side query engine. Throws an Error with a friendly message. */
export async function fetchAnswer(
  question: string,
  companyId: string
): Promise<AnswerPayload> {
  const res = await fetch(`${BASE_PATH}/api/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question, companyId }),
  });

  if (!res.ok) {
    let message = "We couldn't read the numbers just then. Please try again.";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore — use default message
    }
    throw new Error(message);
  }

  return (await res.json()) as AnswerPayload;
}
