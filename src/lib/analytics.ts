import { track } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

/**
 * Thin wrapper around Vercel Analytics' track(). Analytics must never break the
 * UX, so any failure is swallowed. Events only report from production on Vercel;
 * in dev they're logged to the console.
 */
export function trackEvent(name: string, props?: Props): void {
  try {
    track(name, props);
  } catch {
    // ignore
  }
}
