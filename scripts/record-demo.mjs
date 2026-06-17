// Records the LinkedIn demo video by driving the app in replay mode (instant,
// deterministic answers — no API latency/cost). Produces a clean .webm.
//
// One-time setup:   npm i -D playwright && npx playwright install chromium
// Run (app must be serving — e.g. `npm run dev` in another terminal):
//   node scripts/record-demo.mjs
//   FORMAT=square node scripts/record-demo.mjs
//   FORMAT=portrait BASE_URL=http://localhost:3000 node scripts/record-demo.mjs
//
// FORMAT: vertical (4:5, default) | portrait (9:16) | square (1:1) | wide (16:9)
// Output: recordings/*.webm  →  convert to mp4 with:
//   ffmpeg -i recordings/<file>.webm -movflags +faststart -pix_fmt yuv420p out.mp4

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { SHOTS } from "./shots.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Playwright isn't installed. Run:\n  npm i -D playwright && npx playwright install chromium"
  );
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const FORMAT = process.env.FORMAT || "vertical";
const SIZES = {
  vertical: { width: 1080, height: 1350 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  wide: { width: 1280, height: 720 },
};
const size = SIZES[FORMAT] || SIZES.vertical;
const outDir = join(__dirname, "..", "recordings");
mkdirSync(outDir, { recursive: true });

const dwell = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: outDir, size },
  deviceScaleFactor: 2,
  colorScheme: "light",
});
const page = await context.newPage();

console.error(`Recording ${FORMAT} (${size.width}x${size.height}) from ${BASE_URL} …`);
await page.goto(`${BASE_URL}/?replay=1&delay=900`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }); // hide Next dev overlay
await dwell(1400);

let lastCompany = "Meridian Software"; // loaded by default
for (const shot of SHOTS) {
  if (shot.company !== lastCompany) {
    await page.getByRole("button", { name: new RegExp(shot.company) }).first().click();
    lastCompany = shot.company;
    await dwell(1100); // switching clears the thread
  }

  const input = page.getByRole("textbox").first();
  await input.click();
  await input.fill("");
  await input.pressSequentially(shot.question, { delay: 20 });
  await dwell(350);

  // Count answers BEFORE submitting — the thread resets on company switch, so a
  // global counter would be wrong. The new answer lands at index `before`.
  const before = await page.getByText("Show the numbers").count();
  await input.press("Enter");
  await page.getByText("Show the numbers").nth(before).waitFor({ timeout: 20000 });

  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
  );
  await dwell(3600); // let the viewer read the answer
}

// End on the conversion CTA.
await page.getByRole("button", { name: /Run it on your own numbers/ }).first().click();
await dwell(2400);

await context.close(); // finalizes & writes the video
await browser.close();
console.error(`Done. Video written to ${outDir}/ (${FORMAT} ${size.width}x${size.height}).`);
