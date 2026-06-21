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
| Mute / unmute music | M | — |

Jump height is variable — tap for a hop, hold for a full leap.

## Intro cutscene

On load, a short animated intro plays: the title appears, **Three Tails** walks
in, the **Zerox** pack marches in from the right, and a "stomp 'em / reach the
flag" beat leads into the menu. Press **Space**, press **Enter**, or
**click/tap** the screen to skip straight to the menu. It's rendered entirely on
the canvas (timeline in `renderIntro()` / `INTRO` timings) — no video file.

## Levels

1. **Sunrise Run** (surface) — the platforming run that ends in the
   camouflaging **Zerox boss** (see below).
2. **The Underdepths** (cave) — a dark cavern with **bottomless pits**,
   **spike hazards**, **glowing gems** to collect, crystals, drifting dust, and
   its own slow, mysterious music track. A **checkpoint (the glowing post)**
   sits about halfway through — once you touch it, losing a life respawns you
   there instead of at the start. Reach its flag to win the game.

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

### Boss fight

The flag now sits at the very end, **behind a giant camouflaging Zerox boss**
and an energy gate. When you enter the arena the music shifts to a dramatic
synth track and the fight begins:

- The boss is **mostly invisible** (a faint shimmer marks its position) and
  prowls back and forth. It periodically **flickers a warning and becomes
  fully visible** — that's your window.
- **Jump on it while it's visible** to land a hit. Touching it any other way
  (or while it's hidden) costs a life, and it gets faster after each hit.
- Land **3 hits** to defeat it. The gate opens, and you walk to the flag to
  win. You respawn at the arena entrance if you lose a life mid-fight.

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
  | `^`  | spikes (hazard) |
  | `K`  | checkpoint |
  | `B`  | Zerox boss spawn |
  | `X`  | boss gate/barrier (removed on defeat) |

  Levels live in the `LEVELS` array, each with a `build()` function (see
  `buildSurface` / `buildCave`) and a `theme` (`surface` or `cave`) that drives
  the background, tile, and gem rendering. Add a new entry to `LEVELS` to add a
  stage.
  | `S` / `J` / `V` | speed / jump / invincibility power-up |
  | `F`  | finish flag |
  | `P`  | player spawn |

- **Audio** — both the sound effects *and* the looping retro chiptune
  background music are synthesized at runtime via the Web Audio API (no audio
  files). The music is a small step-sequencer (`scheduler()` / the `LEAD`,
  `BASS` patterns) with a square-wave lead, triangle bass, and noise-based
  drums. It starts on your first key/click (browser autoplay policy) and is
  muted with **M**. There are two tracks in `TRACKS` — the upbeat `main` theme
  and a faster, minor-key `boss` theme that `setTrack()` swaps to when you
  enter the boss arena. Edit the `LEAD`/`BASS`/`BOSS_LEAD`/`BOSS_BASS` patterns
  to change the tunes.

## Extending it

- **New level:** copy the `LEVEL` array into a new map and swap it in, or add an
  array of levels and advance the index on `win()`.
- **New power-up:** add a legend char in `buildLevel()`, a timer field on the
  player, and handle it in the `powerups` collision block + `drawPowerup()`.
- **Tuning:** the constants `GRAV`, `MOVE`, `MAXVX`, `JUMP`, and `TILE` at the
  top of the script control game feel.
