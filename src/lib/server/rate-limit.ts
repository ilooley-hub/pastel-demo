// Per-IP rate limiting for the public API routes. Server-only.
//
// Two backends, chosen automatically:
//   • Upstash Redis (distributed, accurate across serverless instances) when
//     UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
//   • An in-memory sliding window otherwise — zero-config and fine for local dev
//     / low traffic, though counters are per-instance on serverless.
//
// enforceRateLimit() checks several windows (e.g. per-minute AND per-day) and
// fails closed on the first one exceeded.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateWindow = { name: string; limit: number; windowSec: number };
export type RateResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; scope: string };

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);
const redis = hasUpstash ? Redis.fromEnv() : null;

/** Pull the client IP from the proxy headers Vercel sets. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ---- Upstash backend (cached limiters per window) --------------------------
const upstashCache = new Map<string, Ratelimit>();
function upstashFor(w: RateWindow): Ratelimit {
  let rl = upstashCache.get(w.name);
  if (!rl) {
    rl = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(w.limit, `${w.windowSec} s`),
      prefix: `pastel:rl:${w.name}`,
      analytics: false,
    });
    upstashCache.set(w.name, rl);
  }
  return rl;
}

// ---- In-memory backend (sliding window log) --------------------------------
const memStore = new Map<string, number[]>();
function memCheck(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const hits = (memStore.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - hits[0]!)) / 1000));
    memStore.set(key, hits);
    return { ok: false, retryAfterSec, scope: key };
  }
  hits.push(now);
  memStore.set(key, hits);
  // Opportunistic cleanup so the map can't grow unbounded on a long-lived instance.
  if (memStore.size > 5000) {
    for (const [k, v] of memStore) {
      if (v.every((t) => now - t >= windowMs)) memStore.delete(k);
    }
  }
  return { ok: true };
}

/**
 * Enforce all windows for an identifier (typically an IP). Returns the first
 * window that's exceeded, or { ok: true }.
 */
export async function enforceRateLimit(
  identifier: string,
  windows: RateWindow[]
): Promise<RateResult> {
  for (const w of windows) {
    if (redis) {
      const res = await upstashFor(w).limit(identifier);
      if (!res.success) {
        const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
        return { ok: false, retryAfterSec, scope: w.name };
      }
    } else {
      const res = memCheck(`${w.name}:${identifier}`, w.limit, w.windowSec * 1000);
      if (!res.ok) return res;
    }
  }
  return { ok: true };
}
