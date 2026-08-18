# ★ Pixel Dash — Retro Pixel Platformer

A self-contained HTML5 platformer starring **Three Tails**, a three-tailed cat.
No build step, no dependencies — just open `index.html` in any modern browser
(desktop or mobile).

## Play

```
open game/index.html      # macOS
# or just double-click the file / drag it into a browser tab
```

## Controls

| Action | Keys | Touch |
| ------ | ---- | ----- |
| Move   | ← → or A D | ◀ ▶ pads |
| Jump   | Space / ↑ / W | ▲ pad |
| Start / Restart | Enter or the on-screen button | tap button |
| Breathe fire (needs 🔥 charges) | X or F | 🔥 pad |
| Mute / unmute music | M | — |

Jump height is variable — tap for a hop, hold for a full leap.

## Intro cutscene

On load, a short animated intro plays: the title appears, **Three Tails** walks
in, the **Zerox** pack marches in from the right, and a "stomp 'em / reach the
flag" beat leads into the menu. Press **Space**, press **Enter**, or
**click/tap** the screen to skip straight to the menu. It's rendered entirely on
the canvas (timeline in `renderIntro()` / `INTRO` timings) — no video file.

## Levels

1. **Sunrise Run** (surface) — the platforming run that ends in the giant
   **Zerox boss** (see below).
2. **The Underdepths** (cave) — a dark cavern with **bottomless pits**,
   **spike hazards**, **glowing gems** to collect, crystals, drifting dust, and
   its own slow, mysterious music track. A **checkpoint (the glowing post)**
   sits about halfway through — once you touch it, losing a life respawns you
   there instead of at the start. The **Skeleton Lord** guards the final flag.

Clearing a level shows a **LEVEL CLEAR** screen; hit **Descend** to continue
with your score and lives carried over.

## Goal

Run to the **green flag** at the end of the level. Along the way:

- **Coins (●)** — +10 points each.
- **Zerox (the dogs)** — stomp them from above (+50) or get hit and lose a
  life. You start with **3 lives (♥)**.
- **Fire-spitting guinea pigs** — chubby critters that sit still, face you, and
  lob arcing **fireballs**. Jump the fireballs and **stomp the guinea pig** from
  above (+50) to take it out; a touch from the side or a fireball costs a life.
- **Power-ups** (timed, ~7–8s, shown in the HUD):
  - **» Speed** — run faster.
  - **↑ High-Jump** — jump higher.
  - **★ Invincibility** — flash through enemies; destroy them on contact.

### Boss fights

Each level's flag sits behind an energy gate guarded by a boss. Entering the
arena switches the music to a dramatic synth track, and losing a life
mid-fight respawns you at the arena entrance.

- **Level 1 — the giant Zerox** prowls its arena, always visible, and gets a
  little faster with each hit. **Stomp it 3 times** to open the gate. Touching
  it any other way costs a life.
- **Level 2 — the Skeleton Lord** stalks you and **hurls arcing fireballs**.
  Stomping does nothing — only **fire breath** hurts it. Collect the **🔥
  fire-breath power-ups** spread across the cave (**+5 charges each**, four in
  the level) and press **X** to torch it **6 times**. Fire breath also roasts
  regular enemies.

Reach the flag to win and bank a **+100 bonus per remaining life**.

## How it's built

Everything lives in one file (`index.html`):

- **Rendering** — HTML5 `<canvas>` at a fixed 480×270 internal resolution,
  pixel-scaled up to the window (`image-rendering: pixelated`). All art is
  drawn procedurally with `fillRect`/paths — no image assets.
- **Physics** — fixed 60 Hz update step with gravity, friction, capped
  velocities, and axis-separated AABB collision against the tile grid.
- **Level** — defined as an ASCII map (the `LEVEL` array). Edit the legend
  characters to redesign the stage:

  | Char | Meaning |
  | ---- | ------- |
  | `#`  | solid brick |
  | `=`  | grass platform |
  | `C`  | coin |
  | `E`  | Zerox (dog enemy) |
  | `G`  | fire-spitting guinea pig |
  | `R`  | fire-breath power-up |
  | `^`  | spikes (hazard) |
  | `K`  | checkpoint |
  | `S` / `J` / `V` | speed / jump / invincibility power-up |
  | `B`  | Zerox boss spawn |
  | `T`  | Skeleton Lord spawn |
  | `X`  | boss gate/barrier (removed on defeat) |
  | `F`  | finish flag |
  | `P`  | player spawn |

  Levels live in the `LEVELS` array, each with a `build()` function (see
  `buildSurface` / `buildCave`) and a `theme` (`surface` or `cave`) that drives
  the background, tile, and gem rendering. Add a new entry to `LEVELS` to add a
  stage.

- **Audio** — both the sound effects *and* the looping retro chiptune
  background music are synthesized at runtime via the Web Audio API (no audio
  files). The music is a small step-sequencer (`scheduler()` / the `LEAD`,
  `BASS` patterns) with a square-wave lead, triangle bass, and noise-based
  drums. It starts on your first key/click (browser autoplay policy) and is
  muted with **M**. There are three tracks in `TRACKS` — the upbeat `main`
  theme, a slow mysterious `cave` theme, and a faster minor-key `boss` theme
  that `setTrack()` swaps to when you enter a boss arena. Edit the
  `LEAD`/`BASS` pattern arrays to change the tunes.

## Extending it

- **New level:** add an entry to the `LEVELS` array with a `build()` map
  function and a `theme` — the level-clear flow picks it up automatically.
- **New power-up:** add a legend char in `buildLevel()`, a timer field on the
  player, and handle it in the `powerups` collision block + `drawPowerup()`.
- **Tuning:** the constants `GRAV`, `MOVE`, `MAXVX`, `JUMP`, and `TILE` at the
  top of the script control game feel.
