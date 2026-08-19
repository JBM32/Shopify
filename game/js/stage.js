// stage.js — the static stage furniture: tiles, spikes, checkpoints, coins,
// the exit flag, and the camera. (Coins delegate their look to the theme.)
"use strict";

// ---------- update ----------

function updateCoins(){
  const p = G.player;
  for (const c of G.coins){
    if (c.got) continue;
    c.t += 0.15;
    if (aabb(p, {x:c.x-8,y:c.y-8,w:16,h:16})){
      c.got = true; addScore(TUNE.score.coin, "+"+TUNE.score.coin);
      spawnParticles(c.x, c.y, "#ffcf3d", 6); sfx.coin();
    }
  }
}

function updateHazards(){
  const p = G.player;
  for (const hz of G.hazards){
    if (aabb(p, hz)) { damage(false); break; }
  }
}

// checkpoints — update the respawn point when passed
function updateCheckpoints(){
  const p = G.player;
  for (const cp of G.checkpoints){
    if (!cp.taken && p.x + p.w/2 >= cp.tx){
      cp.taken = true;
      G.checkpoint = { x: cp.x, y: cp.y };
      msgFlash("CHECKPOINT!");
      sfx.checkpoint();
    }
  }
}

// flag — advance to the next level, or win the game
function checkFlag(){
  if (G.flag && aabb(G.player, G.flag)){ reachFlag(); }
}

function updateCamera(){
  const p = G.player;
  G.cam.x = Math.max(0, Math.min(G.levelW - W, p.x + p.w/2 - W/2));
  G.cam.y = Math.max(0, Math.min(G.levelH - H, p.y + p.h/2 - H/2));
}

// ---------- draw ----------

function drawTiles(){
  for (const s of G.solids){
    const x=px(s.x), y=py(s.y);
    if (s.type==="barrier"){
      // pulsing energy gate (theme-independent)
      const pulse = 0.5 + 0.3*Math.sin(Date.now()/180 + s.y);
      ctx.fillStyle = `rgba(255,60,80,${pulse})`; ctx.fillRect(x+4,y,TILE-8,TILE);
      ctx.fillStyle = "#ff2b4b"; ctx.fillRect(x+9,y,TILE-18,TILE);
      ctx.fillStyle = "rgba(255,200,210,.7)"; ctx.fillRect(x+TILE/2-1,y,2,TILE);
      continue;
    }
    G.theme.drawTile(s, x, y);
  }
}

function drawSpikes(){
  for (const hz of G.hazards){
    const x=px(hz.x), y=py(hz.y);
    ctx.fillStyle="#c9c4d6";
    for (let i=0;i<hz.w;i+=6){
      ctx.beginPath();
      ctx.moveTo(x+i, y+hz.h); ctx.lineTo(x+i+3, y); ctx.lineTo(x+i+6, y+hz.h);
      ctx.fill();
    }
    ctx.fillStyle="#6b6680"; ctx.fillRect(x,y+hz.h-2,hz.w,2);
  }
}

// checkpoint posts — lit up once reached
function drawCheckpoints(){
  for (const cp of G.checkpoints){
    const baseX = px(cp.x)+8, groundY = py(GROUND_TOP);
    ctx.fillStyle = "#9aa3c2"; ctx.fillRect(baseX, groundY-46, 3, 46); // pole
    const lit = cp.taken;
    if (lit){
      ctx.globalAlpha = 0.3; ctx.fillStyle = "#36e0ff";
      ctx.beginPath(); ctx.arc(baseX+2, groundY-40, 15, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    }
    const wv = lit ? Math.sin(Date.now()/180)*2 : 0;
    ctx.fillStyle = lit ? "#36e0ff" : "#566079";
    ctx.beginPath();
    ctx.moveTo(baseX+3, groundY-46); ctx.lineTo(baseX+19+wv, groundY-40); ctx.lineTo(baseX+3, groundY-34); ctx.fill();
  }
}

function drawCoins(){
  for (const c of G.coins){
    if (c.got) continue;
    const bob = Math.sin(c.t)*2;
    G.theme.drawCoin(c, px(c.x), py(c.y)+bob);
  }
}

function drawFlag(){
  const flag = G.flag;
  if (!flag) return;
  const x=px(flag.x), y=py(flag.y);
  ctx.fillStyle="#dddddd"; ctx.fillRect(x,y,3,flag.h);
  ctx.fillStyle="#34d058";
  const w = Math.sin(Date.now()/200)*2;
  ctx.beginPath();
  ctx.moveTo(x+3,y+4); ctx.lineTo(x+24+w,y+10); ctx.lineTo(x+3,y+16); ctx.fill();
  ctx.fillStyle="#ffd23d"; ctx.fillRect(x-2,y+flag.h-4,7,4);
}
