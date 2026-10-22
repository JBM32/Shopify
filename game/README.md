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

Movement is tuned to feel like Mario: Three Tails builds up speed
smoothly, stops on a dime and skids when you turn. Jump height is variable —
tap for a hop, hold for a full leap (and hold it when you stomp to bounce
higher). Jumps are forgiving: a press just before landing still counts, and
you can still jump for a split second after running off a ledge.

## Levels

1. **Sunrise Run** (surface) — a platforming dash over hills that ends at
   the giant **Zerox Boss**: stomp it **3 times** (it gets faster with each
   hit, and bolts away after every stomp).
2. **The Underdepths** (cave) — bottomless pits, spike strips, glowing gems,
   crystals and a halfway **checkpoint post**. Collect **🔥 fire-breath
   power-ups** along the way: the **Skeleton Lord** at the end shrugs off
   stomps and hurls aimed fireballs — only fire (press **X**) hurts it,
   **6 hits** to bring it down.
3. **Spudsworth Castle** (castle) — a moonlit castle: courtyard, moat,
   gatehouse turret, a grand staircase over a spike pit, battlements and a
   tower climb. Here the dogs and guinea pigs are **little potato men**.
   The **Potato Monster** waits in the throne room, spewing volleys of
   running, evil **mini French fries** that chase you down. Stomp it or
   torch it (**6 hits**) — it spews more fries and starts hopping as it
   gets hurt. Beat it to reach the final flag.

## Power-ups

- **» Speed** — run faster for 8s
- **↑ High jump** — jump higher for 8s
- **★ Star** — invincible for 7s (mow through enemies)
- **🔥 Fire breath** — +5 charges; press X to torch enemies and
  bosses (charges survive respawns)

## Enemies

- **Zerox** — tailless dogs that patrol and turn at ledges. Stomp them.
- **Fire guinea pigs** — sit tight and spit fireballs when you're close.
- **Potato men** (castle) — the castle's walkers; **hot potato men** are
  the castle's fire-spitters (they steam up before they shoot).
- **Mini French fries** — scurry straight at you. Stomp or torch them.

Everything else: coins (+10), an animated intro cutscene (Space/click to
skip), chiptune music with separate surface / boss / cave / castle tracks — all
generated in code, no assets.

## For developers (human or AI)

**Read `ARCHITECTURE.md` first.** The code is split into small single-purpose
files: all tuning numbers in `js/tuning.js`, all content as registry entries
(enemies, power-ups, bosses, themes, levels, tracks), all mutable state in
one `G` bag, and strict load-order rules that make edits safe. It also lists
copy-paste recipes for the common changes (new enemy, new level, reskin…).

Dev conveniences: **O / I** jump between levels, **F1** toggles a debug
overlay, `index.html?lv=3` boots straight into level 3, and `window.PD`
exposes all state and registries in the console. Flip `DEV.cheats` in
`js/debug.js` to `false` to ship without cheats.
