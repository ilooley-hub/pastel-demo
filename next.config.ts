import type { NextConfig } from "next";

// Serve the whole app under a base path (e.g. "/demo") when set, so the demo can
// live at getpastel.ai/demo behind a rewrite. Unset in local dev → served at /.
// Keep in sync with NEXT_PUBLIC_BASE_PATH (read client-side in lib/base-path).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  basePath,
};

export default nextConfig;
