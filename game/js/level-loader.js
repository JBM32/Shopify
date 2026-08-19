// level-loader.js — turns a level's character grid into live G state.
// The legend below is assembled from the built-in structural tiles plus
// every ENEMIES/POWERUPS/BOSSES entry's `tile` char, so NEW CONTENT KINDS
// NEVER TOUCH THIS FILE — give the registry entry a tile char and stamp it
// into a grid.
"use strict";

function rectAt(c, r){ return { x:c*TILE, y:r*TILE, w:TILE, h:TILE }; }

// tile char -> registry kind lookups (built once at load)
const ENEMY_TILES = {}, POWERUP_TILES = {}, BOSS_TILES = {};
for (const k in ENEMIES)  ENEMY_TILES[ENEMIES[k].tile] = k;
for (const k in POWERUPS) POWERUP_TILES[POWERUPS[k].tile] = k;
for (const k in BOSSES)   BOSS_TILES[BOSSES[k].tile] = k;
const STRUCTURAL_TILES = "#=X^KCFP ";

function buildLevel(){
  const lv = LEVELS[G.levelIndex];
  G.theme = THEMES[lv.theme];
  const grid = lv.build();
  G.cols = Math.max(...grid.map(r => r.length));
  G.levelW = G.cols * TILE; G.levelH = ROWS * TILE;

  G.solids = []; G.coins = []; G.enemies = []; G.powerups = []; G.particles = [];
  G.barriers = []; G.hazards = []; G.checkpoints = []; G.fireballs = []; G.flames = [];
  G.flag = null; G.boss = null; G.bossStarted = false;

  let spawn = { x: TILE*2, y: TILE*2 };
  let bossKind = null, bossCol = null;

  for (let r=0; r<ROWS; r++){
    const row = grid[r];
    for (let c=0; c<row.length; c++){
      const ch = row[c];
      const x = c*TILE, y = r*TILE;
      if (ch === "#" || ch === "=") G.solids.push({...rectAt(c,r), type: ch==="="?"plat":"brick"});
      else if (ch === "X"){ const s = {...rectAt(c,r), type:"barrier"}; G.solids.push(s); G.barriers.push(s); }
      else if (ch === "^") G.hazards.push({ x:x+3, y:y+TILE-10, w:TILE-6, h:10 });
      else if (ch === "K") G.checkpoints.push({ tx:x, x:x, y:GROUND_TOP-23, taken:false });
      else if (ch === "C") G.coins.push({ x:x+TILE/2, y:y+TILE/2, got:false, t:Math.random()*6 });
      else if (ch === "F") G.flag = { x:x+TILE/2, y:y, w:6, h:TILE*3 };
      else if (ch === "P") spawn = { x, y };
      else if (ENEMY_TILES[ch])   G.enemies.push(ENEMIES[ENEMY_TILES[ch]].spawn(x, y));
      else if (POWERUP_TILES[ch]) spawnPowerup(POWERUP_TILES[ch], x, y);
      else if (BOSS_TILES[ch]){ bossKind = BOSS_TILES[ch]; bossCol = c; }
    }
  }

  // the boss arena's right edge is the barrier gate (or the level end)
  const barrierX = G.barriers.length ? Math.min(...G.barriers.map(s=>s.x)) : G.levelW;
  if (bossKind != null) G.boss = BOSSES[bossKind].spawn(bossCol, barrierX);

  G.checkpoint = { x: spawn.x, y: spawn.y };
  spawnPlayer(spawn.x, spawn.y);
  G.cam = { x:0, y:0 };
}
