# Repo guide

Two unrelated things live in this repository:

- **`game/` — Pixel Dash**, a self-contained retro HTML5 platformer (no
  build step; runs from `file://`). **Before changing anything in `game/`,
  read `game/ARCHITECTURE.md`** — it maps every file, gives copy-paste
  recipes for the common changes (tweak difficulty, add an enemy / power-up /
  boss / level / theme / track), and records decisions that must not be
  reverted. Gameplay numbers live in `game/js/tuning.js`; content lives in
  registries; keep behavior changes to the smallest file the recipe names.
- **`sections/` — Shopify theme section(s)** for an artist profile page
  (Liquid). Unrelated to the game.

Quick game QA: `node --check` the JS files, then open `game/index.html` in a
browser (Playwright/Chromium works headless; `window.PD` exposes game state
for assertions — see the QA checklist at the end of `game/ARCHITECTURE.md`).
