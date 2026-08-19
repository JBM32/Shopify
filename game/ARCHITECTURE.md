# Pixel Dash — architecture guide

**Read this before changing the game.** It tells you where everything lives,
the recipes for common changes, and the few rules that keep changes cheap.

## The design in one paragraph

Plain JS, Canvas 2D, Web Audio. **No build step, no dependencies, no
framework** — the game runs by double-clicking `index.html` from disk, so all
files are classic `<script>` tags (ES modules are blocked by CORS on
`file://`) and all data is `.js` literals (no `fetch`/JSON). Every gameplay
number lives in **`js/tuning.js` (`TUNE`)**. Every content kind lives in a
**registry** — `ENEMIES`, `POWERUPS`, `BOSSES`, `THEMES`, `LEVELS`, `TRACKS` —
where one entry colocates a thing's data, spawn, update and draw. All mutable
game state lives in **one bag, `G`** (`js/core.js`). `main.js` is the only
file that executes anything at load; every other file only declares.

## File map

| File | Owns |
| ---- | ---- |
| `index.html` | thin shell: canvas, overlay DOM, touch pads, ordered script tags |
| `style.css` | all page styling |
| `js/tuning.js` | `TUNE` — every gameplay number (physics, scores, boss stats…) |
| `js/core.js` | canvas/2× view, `G` state bag, `aabb`/`moveAndCollide`, `px`/`py`, `addScore`, `msgFlash` |
| `js/data/tracks.js` | `TRACKS` — chiptune note/drum data per track |
| `js/audio.js` | SFX beeps + the 32-step sequencer; `ensureAudio`, `setTrack(name)`, `toggleMusic` |
| `js/sprites/cat.js` | Three Tails: texel maps + `drawCatSprite` (pure) |
| `js/sprites/dog.js` | Zerox dog sprite + `drawSpriteAt` mirror/scale wrapper (pure) |
| `js/themes.js` | `THEMES` — per-theme palette + background/tile/coin drawing (pure) |
| `js/particles.js` | spawn/update/draw of burst particles |
| `js/projectiles.js` | enemy fireballs + player fire breath (spend, fly, hit) |
| `js/powerups.js` | `POWERUPS` registry + pickup/draw loops |
| `js/enemies.js` | `ENEMIES` registry + shared walk/stomp/kill helpers |
| `js/bosses.js` | `BOSSES` registry + arena/hit/defeat shell + health pips |
| `js/player.js` | spawn/update/damage/draw of the hero |
| `js/stage.js` | tiles, spikes, checkpoints, coins, flag, camera |
| `js/data/levels.js` | `LEVELS` — the level grids (set/fill builders) + metadata |
| `js/level-loader.js` | `buildLevel()` — grid chars → live `G` state (auto legend) |
| `js/hud.js` | the in-game HUD (score, hearts, timers, boss bar, flash msg) |
| `js/intro.js` | the animated intro cutscene |
| `js/input.js` | keyboard/touch → the `keys` action object |
| `js/flow.js` | state machine + DOM overlay; owns `G.state`, score/lives lifecycle |
| `js/debug.js` | `DEV` flags, O/I level cheats, F1 overlay, `?lv=N` boot, `window.PD` |
| `js/main.js` | boot validator, THE update/render order, the 60 Hz loop, `fit()` |

## Change recipes (do the smallest thing on this list)

- **Tweak difficulty / physics / scoring / durations** → edit `js/tuning.js`.
  Nothing else. (Live-experiment first via the console: `PD.TUNE.physics.jump = 13`.)
- **Reskin a theme** → edit hex strings in that theme's `palette` block in
  `js/themes.js`. Draw fns only reference palette keys, so nothing else moves.
- **New enemy** → one entry in `ENEMIES` (`js/enemies.js`; reuse
  `walkAndPatrol`/`isStomping`/`killEnemy`), numbers in `TUNE.enemies`, tile
  char stamped into a level. A recolored walker is ~15 lines.
- **New powerup** → one entry in `POWERUPS` (`js/powerups.js`). `timerField`
  is auto-inited, auto-ticked, auto-cleared on respawn, and auto-shown in the
  HUD. Then read the field where the effect applies (e.g. one `if` in
  `player.js` or `damage()`), and place its tile in a level.
- **New boss** → one entry in `BOSSES` (`js/bosses.js`; the shell already
  does arena trigger, checkpoint, boss music, hits, defeat, gate removal,
  pips, HUD bar), numbers in `TUNE.bosses`, tile + an `X` barrier column in
  a level.
- **New level** → a `buildX()` grid fn + one `LEVELS` entry in
  `js/data/levels.js`. New look? Add a `THEMES` entry. New music? Add a
  `TRACKS` entry. Ids are resolved by name; the boot validator yells about
  typos.
- **New music track / SFX** → `js/data/tracks.js` / the `sfx` table in
  `js/audio.js`.
- **Settings or pause menu** → overlay markup in `index.html` + wiring in
  `js/flow.js` (it owns states); audio has `setMusicVol()` ready. If you add
  a paused state, reset the loop accumulator on resume (see `loop()` in
  `main.js`) so the game doesn't fast-forward.
- **HUD change** → `js/hud.js` only.

## The rules (they keep the above true)

1. **`main.js` boots, everything else declares.** No top-level side effects
   outside main.js except: pure data literals, sprite-map parsing,
   tile-lookup assembly in `level-loader.js`, and event-listener registration
   in `input.js`/`flow.js` (their handlers only dereference at runtime, so
   script order stays a non-issue).
2. **⚠ ORDER IS BEHAVIOR.** The `update()` and `render()` sequences in
   `main.js` are the original game's exact orders. Do not reorder; add new
   systems at the analogous position.
3. **Numbers live in `TUNE` and are read inside functions** — never copied
   into registry entries at load, so edits and live console tweaks always
   take effect.
4. **The registry key is the grep key**: registry key === `entity.kind` ===
   the name in comments. `grep -ri guinea js/` finds everything about it.
5. **Leaf renderers are pure**: `sprites/*`, `THEMES` draw fns and audio
   primitives never read `G` — they take parameters. Everything that DOES
   read state does it via `G.` (greppable) and writes only what it owns:
   `flow.js` owns `G.state`/score/lives lifecycle, `level-loader.js` resets
   the entity arrays, each system file mutates only its own array. Funnels
   for cross-cutting effects: `damage()`, `addScore()`, `msgFlash()`,
   `setTrack()`.
6. **`use strict` in every file; no new bare globals.** Never name a global
   `Audio`, `name`, `top`, `status` or `self` (window built-ins). New
   top-level names should be a registry entry first, a function second, a
   global never.
7. **Don't generalize into components/ECS.** At this scale, fat registry
   entries + the shared helpers are the sweet spot. If entries start
   duplicating logic, extend the helpers (`walkAndPatrol`, `stompHitBoss`…),
   not the architecture.
8. **Stay `file://`-safe**: no fetch/XHR/JSON files, no ES modules, keep the
   `ensureAudio()`-on-first-gesture pattern, wrap any future `localStorage`
   in try/catch.

## Decision log (don't "fix" these back)

- **Unification (2026-08):** the refactor merged two divergent branches —
  gameplay from `claude/practical-turing-3waqpk` (always-visible Zerox boss,
  fire breath, Skeleton Lord) **wins over** the old camouflage-phase boss;
  canvas/hero from `claude/pixel-dash-cat-design-td4nbb` (960×540 backing at
  2×, texel-map cat) **wins over** the old 480×270 canvas and blocky cat.
- `G.msgT` ticks down inside `drawHUD()` (the renderer), not `update()` — an
  original quirk kept so messages keep fading on overlay screens.
- Guinea-pig star-kills flash "+50" but Zerox star-kills don't — original
  behavior, kept.
- Fire charges (`fireCharges`) and `fireCd` deliberately SURVIVE
  checkpoint respawn; timed powerups clear.
- Enemies never head-bonk solids (only landing is resolved) — original.
- `setTrack()` takes a track NAME and no-ops on the already-playing track
  (this is why `gameOver()` calling it doesn't restart the music).
- Boss spawn: one boss per level; the last boss tile in the grid wins.
- The intro/enemy/boss dog sprites share `drawDogSprite` but keep their
  original animation clocks (walker `Date.now()/120`, boss `/90`, intro its
  scene phase).

## Dev tools

- **O / I** — next / previous level (gate: `DEV.cheats`, currently true;
  flip to false to ship).
- **F1** — debug overlay (state, entity counts, player pos).
- **`?lv=2`** — boot straight into level 2 (`index.html?lv=2`, works on file://).
- **`window.PD`** — console handle: `PD.G` (state), `PD.TUNE`, registries,
  `PD.buildLevel`, `PD.setTrack`… Used by the Playwright smoke test too.

## QA checklist (after touching core systems)

Jump arc + variable jump (tap vs hold) · stomp bounce · checkpoint respawn
clears SPD/JMP/★ but keeps 🔥 · Zerox boss: 3 stomps, 45-frame grace,
gate opens · Skeleton Lord: immune to stomps, 6 flame hits, aimed fireballs
· music switches main→boss→cave correctly · M mutes music but not SFX ·
touch pads on a phone · intro skippable by Space/Enter/click · O/I/F1/?lv=
· no `[pixel-dash]` validator errors in the console.
