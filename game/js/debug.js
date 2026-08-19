// debug.js — dev-only helpers. Flip DEV.cheats to false to ship.
// • O / I keys: jump to next / previous level (keeps lives & score)
// • F1: toggle the debug overlay (state, counts, player position)
// • ?lv=N in the URL: boot straight into level N (works on file:// too)
// • window.PD: console/test handle to all state, tuning and registries
"use strict";

const DEV = {
  cheats: true,   // TEMP PLAYTEST CHEATS — set false before release
  overlay: false, // F1
};

// Jump straight to another level (O = next, I = previous) keeping lives/score.
function cheatJumpLevel(dir){
  const n = G.levelIndex + dir;
  if (n < 0 || n >= LEVELS.length) return;
  G.levelIndex = n; G.levelStartScore = G.score;
  buildLevel(); setTrack(levelTrack());
  G.state = "play"; hideOverlay();
  msgFlash("CHEAT → LV" + (G.levelIndex+1) + " " + LEVELS[G.levelIndex].name);
}

// ?lv=N — skip intro/menu and boot straight into a level (called by main.js)
function bootFromQuery(){
  if (!DEV.cheats) return;
  const m = /[?&]lv=(\d+)/.exec(location.search);
  if (!m) return;
  const n = Math.max(1, Math.min(LEVELS.length, parseInt(m[1], 10))) - 1;
  startGame();
  if (n !== 0){
    G.levelIndex = n; G.levelStartScore = 0;
    buildLevel(); setTrack(levelTrack());
  }
}

function drawDebugOverlay(){
  const p = G.player, lines = [
    "state " + G.state + "  lv " + (G.levelIndex+1) + "  score " + G.score,
    "player " + Math.round(p.x) + "," + Math.round(p.y) + "  vx " + p.vx.toFixed(2) + "  vy " + p.vy.toFixed(2),
    "enemies " + G.enemies.filter(e=>e.alive).length + "  fireballs " + G.fireballs.length +
      "  flames " + G.flames.length + "  particles " + G.particles.length,
    "cam " + Math.round(G.cam.x) + "  boss " + (G.boss ? G.boss.kind+" "+G.boss.hits+"/"+G.boss.maxHits+(G.bossStarted?" ⚔":"") : "—"),
  ];
  ctx.fillStyle="rgba(0,0,0,.6)"; ctx.fillRect(4, H-4-lines.length*10-4, 226, lines.length*10+6);
  ctx.fillStyle="#7dff7d"; ctx.font="8px monospace"; ctx.textAlign="left";
  lines.forEach((l,i)=>ctx.fillText(l, 8, H-6-(lines.length-1-i)*10));
}

// console/test handle: PD.G, PD.TUNE, PD.keys, the registries, buildLevel...
window.PD = { G, TUNE, keys, DEV, ENEMIES, POWERUPS, BOSSES, THEMES, LEVELS, TRACKS,
              buildLevel, startGame, cheatJumpLevel, setTrack };
