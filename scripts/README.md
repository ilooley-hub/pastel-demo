# Demo video scripts

Tools for recording the marketing/LinkedIn demo video with fast, deterministic,
beautiful answers (no API latency, cost, or variability).

## How it works

The app supports a **replay mode** (`/?replay=1`): instead of calling the query
engine, it renders pre-captured authentic answers instantly (with a short
"thinking" beat). `?delay=ms` tunes that beat (default 800).

- `shots.mjs` — the shot list (questions across all three companies), shared by
  both scripts so they stay in sync.
- `capture-replay.mjs` — calls the real engine for each shot and writes the
  answers to `src/lib/replay-data.ts`. Re-run whenever you change the shot list
  or want fresh answers.
- `record-demo.mjs` — drives the app in replay mode with Playwright and records
  a clean video to `recordings/` (gitignored).

## One-time setup

```bash
npm i -D playwright && npx playwright install chromium
# ffmpeg is only needed to convert to mp4: brew install ffmpeg
```

## Recording

```bash
# 1. capture authentic answers (needs ANTHROPIC_API_KEY + the dev server running)
npm run dev                 # in one terminal
npm run capture:replay      # in another

# 2. record (FORMAT: vertical 4:5 [default] | portrait 9:16 | square 1:1 | wide 16:9)
FORMAT=vertical npm run record:demo

# 3. convert webm -> mp4 for LinkedIn
ffmpeg -i recordings/*.webm -movflags +faststart -pix_fmt yuv420p -r 30 \
  recordings/pastel-demo.mp4
```
