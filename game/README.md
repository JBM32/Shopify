# ★ Pixel Dash — Retro Pixel Platformer

A self-contained HTML5 platformer starring **Three Tails**, a three-tailed
cat. No build step, no dependencies — just open `index.html` in any modern
browser (desktop or mobile).

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
| Breathe fire | X or F (needs 🔥 charges) | 🔥 pad |
| Start / Restart | Enter or the on-screen button | tap button |
| Mute / unmute music | M | — |

Jump height is variable — tap for a hop, hold for a full leap.

## Levels

1. **Sunrise Run** (surface) — a platforming dash over hills that ends at
   the giant **Zerox Boss**: stomp it **3 times** (it gets faster with each
   hit, and bolts away after every stomp).
2. **The Underdepths** (cave) — bottomless pits, spike strips, glowing gems,
   crystals and a halfway **checkpoint post**. Collect **🔥 fire-breath
   power-ups** along the way: the **Skeleton Lord** at the end shrugs off
   stomps and hurls aimed fireballs — only fire (press **X**) hurts it,
   **6 hits** to bring it down. Beat it to reach the final flag.

## Power-ups

- **» Speed** — run faster for 8s
- **↑ High jump** — jump higher for 8s
- **★ Star** — invincible for 7s (mow through enemies)
- **🔥 Fire breath** — +5 charges; press X to torch enemies and the
  Skeleton Lord (charges survive respawns)

## Enemies

- **Zerox** — tailless dogs that patrol and turn at ledges. Stomp them.
- **Fire guinea pigs** — sit tight and spit fireballs when you're close.

Everything else: coins (+10), an animated intro cutscene (Space/click to
skip), chiptune music with separate surface / boss / cave tracks — all
generated in code, no assets.

## For developers (human or AI)

**Read `ARCHITECTURE.md` first.** The code is split into small single-purpose
files: all tuning numbers in `js/tuning.js`, all content as registry entries
(enemies, power-ups, bosses, themes, levels, tracks), all mutable state in
one `G` bag, and strict load-order rules that make edits safe. It also lists
copy-paste recipes for the common changes (new enemy, new level, reskin…).

Dev conveniences: **O / I** jump between levels, **F1** toggles a debug
overlay, `index.html?lv=2` boots straight into level 2, and `window.PD`
exposes all state and registries in the console. Flip `DEV.cheats` in
`js/debug.js` to `false` to ship without cheats.
