// Records the LinkedIn demo video by driving the app in replay mode (instant,
// deterministic answers — no API latency/cost). Produces a clean .webm.
//
// CINEMATIC mode (default): a scripted "virtual camera" zooms into the question
// as it's typed, then pulls out and pushes into the answer as it reveals — the
// Screen-Studio / Gemini-ad feel. Set CINEMATIC=0 for a flat, static capture.
//
// One-time setup:   npm i -D playwright && npx playwright install chromium
// Run (app must be serving — e.g. `npm run dev` in another terminal):
//   npm run record:demo
//   FORMAT=square CINEMATIC=1 node scripts/record-demo.mjs
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
const CINEMATIC = process.env.CINEMATIC !== "0";
const SIZES = {
  vertical: { width: 1080, height: 1350 },
  portrait: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  wide: { width: 1280, height: 720 },
};
const size = SIZES[FORMAT] || SIZES.vertical;
const outDir = join(__dirname, "..", "recordings");
mkdirSync(outDir, { recursive: true });

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // easeOutExpo-ish
const dwell = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: outDir, size },
  deviceScaleFactor: 2,
  colorScheme: "light",
});
const page = await context.newPage();

console.error(
  `Recording ${FORMAT} (${size.width}x${size.height})${CINEMATIC ? " · cinematic" : ""} from ${BASE_URL} …`
);
await page.goto(`${BASE_URL}/?replay=1&delay=900`, { waitUntil: "networkidle" });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }); // hide Next dev overlay

// ---- Virtual camera: transform the <body> as a pannable/zoomable "camera" ----
if (CINEMATIC) {
  await page.addStyleTag({
    content: `html{overflow:hidden!important;background:#F4F2EB}
              body{will-change:transform;backface-visibility:hidden}`,
  });
  await page.evaluate((ease) => {
    const b = document.body;
    b.style.transformOrigin = "0 0";
    window.__cam = { s: 1, tx: 0, ty: 0 };
    // Untransformed page rect of an element (undo the current camera transform).
    window.__rectOf = (el) => {
      const r = el.getBoundingClientRect();
      const { s, tx, ty } = window.__cam;
      return { x: (r.left - tx) / s, y: (r.top - ty) / s, w: r.width / s, h: r.height / s };
    };
    // Move the camera so `rect` is centered horizontally; vertically either
    // centered (alignY null) or with its top at alignY*viewport.
    window.__camTo = (rect, scale, ms, alignY) => {
      const vw = innerWidth, vh = innerHeight;
      const cx = rect.x + rect.w / 2;
      const tx = vw / 2 - cx * scale;
      const ty = alignY == null ? vh / 2 - (rect.y + rect.h / 2) * scale : alignY * vh - rect.y * scale;
      window.__cam = { s: scale, tx, ty };
      b.style.transition = `transform ${ms}ms ${ease}`;
      b.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    };
    window.__camToInput = (scale, ms, alignY) =>
      window.__camTo(window.__rectOf(document.querySelector('[aria-label="Ask a question about the financials"]')), scale, ms, alignY);
    // Fit the latest answer card to fill the frame (width- or height-bound),
    // centered if it fits vertically, else top-aligned — so every answer reads
    // big and immersive regardless of its height.
    window.__camFitLastAnswer = (maxScale, ms, padX, padY) => {
      const cards = document.querySelectorAll("[data-answer-card]");
      const el = cards[cards.length - 1];
      if (!el) return;
      const rect = window.__rectOf(el);
      let scale = Math.min(maxScale, (innerWidth * padX) / rect.w, (innerHeight * padY) / rect.h);
      scale = Math.max(1.0, scale);
      const fits = rect.h * scale <= innerHeight * padY;
      window.__camTo(rect, scale, ms, fits ? null : 0.06);
    };
    // Ken-Burns push: scale toward the current viewport centre.
    window.__camDrift = (factor, ms) => {
      const { s, tx, ty } = window.__cam;
      const px = (innerWidth / 2 - tx) / s, py = (innerHeight / 2 - ty) / s;
      const ns = s * factor;
      const ntx = innerWidth / 2 - px * ns, nty = innerHeight / 2 - py * ns;
      window.__cam = { s: ns, tx: ntx, ty: nty };
      b.style.transition = `transform ${ms}ms ${ease}`;
      b.style.transform = `translate(${ntx}px, ${nty}px) scale(${ns})`;
    };
    window.__camReset = (ms) => window.__camTo({ x: 0, y: 0, w: innerWidth, h: innerHeight }, 1, ms);
  }, EASE);
}

const camToInput = (scale, ms, alignY) =>
  CINEMATIC && page.evaluate(([s, m, a]) => window.__camToInput(s, m, a), [scale, ms, alignY]);
const camFitAnswer = (maxScale, ms, padX, padY) =>
  CINEMATIC && page.evaluate(([s, m, x, y]) => window.__camFitLastAnswer(s, m, x, y), [maxScale, ms, padX, padY]);
const camDrift = (factor, ms) =>
  CINEMATIC && page.evaluate(([f, m]) => window.__camDrift(f, m), [factor, ms]);
const camReset = (ms) => CINEMATIC && page.evaluate((m) => window.__camReset(m), ms);

await dwell(1400);

let lastCompany = "Meridian Software"; // loaded by default
for (const shot of SHOTS) {
  if (shot.company !== lastCompany) {
    await camReset(700);
    await dwell(500);
    await page.getByRole("button", { name: new RegExp(shot.company) }).first().click();
    lastCompany = shot.company;
    await dwell(1100); // switching clears the thread
  }

  // Punch in tight on the input (high in frame, hero cropped) so the typed
  // question is the focus.
  await camToInput(1.75, 750, 0.2);
  await dwell(280);
  const input = page.getByRole("textbox").first();
  await input.click();
  await input.fill("");
  await camToInput(1.82, 2600, 0.2); // slow push while typing
  await input.pressSequentially(shot.question, { delay: 22 });
  await dwell(350);

  // Submit (count answers first — the thread resets on company switch).
  const before = await page.getByText("Show the numbers").count();
  await camToInput(1.55, 500, 0.2); // small pull-back to anticipate
  await input.press("Enter");
  await page.getByText("Show the numbers").nth(before).waitFor({ timeout: 20000 });

  // Reveal: fit the answer to fill the frame, then a slow Ken-Burns push.
  await camFitAnswer(1.7, 950, 0.92, 0.9);
  await dwell(900);
  await camDrift(1.06, 3200); // slow push-in while reading
  await dwell(2700);
}

// End on the conversion CTA, pulled back to full frame.
await camReset(800);
await dwell(500);
await page.getByRole("button", { name: /Run it on your own numbers/ }).first().click();
await dwell(2400);

await context.close(); // finalizes & writes the video
await browser.close();
console.error(`Done. Video written to ${outDir}/ (${FORMAT} ${size.width}x${size.height}).`);
