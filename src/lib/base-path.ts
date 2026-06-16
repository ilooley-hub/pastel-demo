/**
 * The base path the app is served under. Empty in local dev; set to "/demo" in
 * production (via NEXT_PUBLIC_BASE_PATH) so the demo can live at getpastel.ai/demo
 * behind a rewrite. Next.js handles next/link, next/font and _next assets
 * automatically, but raw fetch() calls and <img src> to /public must add this.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
