// main.js — the ONLY file that executes on load: content validation, the
// fixed-timestep loop, the update/render ORDER, responsive scaling, boot.
"use strict";

// ---------- DEV boot validator ----------
// Catches the likely no-build-stack mistakes loudly: a level char with no
// legend entry, a level naming a theme/track that doesn't exist, or two
// registry entries claiming the same tile char.
function validateContent(){
  const seen = {};
  for (const ch of STRUCTURAL_TILES) seen[ch] = "structural";
  for (const [reg, name] of [[ENEMIES,"ENEMIES"],[POWERUPS,"POWERUPS"],[BOSSES,"BOSSES"]]){
    for (const k in reg){
      const t = reg[k].tile;
      if (!t) console.error(`[pixel-dash] ${name}.${k} has no tile char`);
      else if (seen[t]) console.error(`[pixel-dash] tile "${t}" of ${name}.${k} already used by ${seen[t]}`);
      else seen[t] = `${name}.${k}`;
    }
  }
  LEVELS.forEach((lv, i) => {
    if (!THEMES[lv.theme]) console.error(`[pixel-dash] level ${i+1} (${lv.name}): unknown theme "${lv.theme}"`);
    if (!TRACKS[lv.track]) console.error(`[pixel-dash] level ${i+1} (${lv.name}): unknown track "${lv.track}"`);
    for (const row of lv.build())
      for (const ch of row)
        if (!seen[ch]) console.error(`[pixel-dash] level ${i+1} (${lv.name}): unknown tile char "${ch}"`);
  });
  // freeze registry SHAPES (entries stay live so PD console tweaks work)
  [ENEMIES, POWERUPS, BOSSES, THEMES, LEVELS, TRACKS].forEach(Object.freeze);
}

// ---------- fixed-order update & render ----------
// ⚠ ORDER IS BEHAVIOR — DO NOT REORDER. This is the original game's exact
// sequence; "tidying" it changes the feel (stomp bounces, same-frame hits,
// respawn interactions). Add new systems at the analogous position.
function update(){
  if (G.state !== "play") return;
  updatePlayer();       // input, physics, tile collision, fall-out
  updateCoins();        // pickups...
  updatePowerups();
  updateHazards();      // spikes
  updateCheckpoints();
  updateEnemies();      // enemies move & touch the player
  updateFlames();       // fire breath spends + flames fly (after enemies!)
  updateFireballs();    // enemy shots
  updateBoss();         // arena trigger + boss pattern
  checkFlag();          // level exit
  updateParticles();
  updateCamera();
}

function render(){
  G.theme.drawBackground(G.cam.x);
  drawTiles();
  drawSpikes();
  drawCheckpoints();
  drawCoins();
  drawPowerups();
  drawFlag();
  drawBoss();
  drawEnemies();
  drawFireballs();
  drawFlames();
  drawParticles();
  drawPlayer();
  drawHUD();
  if (DEV.overlay) drawDebugOverlay();
}

// ---------- main loop (fixed 60 Hz updates, rAF rendering) ----------
let last = performance.now(), acc = 0;
const STEP = 1000/60;
function loop(now){
  const dt = now - last;
  acc += dt; last = now;
  let guard=0;
  while (acc >= STEP && guard++ < 5){ update(); acc -= STEP; }
  if (G.state === "intro"){ G.introMs += dt; renderIntro(G.introMs); }
  else render();
  requestAnimationFrame(loop);
}

// ---------- responsive integer scaling ----------
function fit(){
  const stage = document.getElementById("stage");
  const maxW = Math.min(window.innerWidth-24, 960);
  const scale = Math.max(1, Math.floor(maxW / W));
  const finalW = Math.min(maxW, W*scale);
  canvas.style.width = finalW+"px";
  canvas.style.height = (finalW*H/W)+"px";
}
addEventListener("resize", fit); fit();

// ---------- boot ----------
validateContent();
buildLevel();          // level 0 sits behind the intro/menu
hideOverlay();         // the cutscene plays first; the menu appears after
bootFromQuery();       // DEV: ?lv=N jumps straight into a level
requestAnimationFrame(loop);
