// bosses.js — one registry entry per boss kind + the shared boss shell
// (arena trigger, hit/defeat plumbing, health pips). Adding a boss = add an
// entry here, its numbers in TUNE.bosses, and its tile char in a level
// (with an "X" barrier column after it — defeating the boss removes all
// barriers). One boss per level (the last boss tile in the grid wins).
//   tile        — level-grid character marking the spawn column
//   hurtBy      — {stomp, flame}: which attacks damage it
//   introMsg    — flashed when the player enters the arena
//   hudName     — label on the big HUD health bar
//   hitName     — "<hitName> HIT n/m" flash on each hit
//   spawn(col, barrierX) — build the boss object (arena bounds included)
//   update(b, p) / draw(b, sx, sy, hurtFlash) — behaviour + sprite
"use strict";

const BOSSES = {

  // The Zerox Boss — a giant dog that prowls its arena. Stomp it.
  zerox: {
    tile:"B", hurtBy:{ stomp:true, flame:false },
    introMsg:"⚠  ZEROX BOSS  ⚠", hudName:"ZEROX BOSS", hitName:"BOSS",
    spawn(col, barrierX){
      const T = TUNE.bosses.zerox;
      const bx = col*TILE + TILE/2 - T.w/2;
      return {
        kind:"zerox", x: bx, y: GROUND_TOP - T.h, w: T.w, h: T.h,
        dir: -1, hits: 0, maxHits: T.maxHits, flashT: 0, cooldown: 0,
        alive: true, defeated: false,
        arenaL: Math.max(0, bx - T.arenaTiles*TILE), arenaR: barrierX,
      };
    },
    update(b, p){
      const T = TUNE.bosses.zerox;
      // prowl back and forth across the arena, a little faster as it gets hurt
      const spd = T.speedBase + b.hits*T.speedPerHit;
      b.x += b.dir*spd;
      if (b.x < b.arenaL){ b.x = b.arenaL; b.dir = 1; }
      if (b.x + b.w > b.arenaR){ b.x = b.arenaR - b.w; b.dir = -1; }
      // player interaction — always visible, stomp to hurt it
      if (b.cooldown<=0 && aabb(p,b)){
        const stomping = p.vy>0 && (p.y+p.h) - b.y < T.stompWindow;
        if (stomping || p.starT>0) stompHitBoss(b);
        else damage(false);
      }
    },
    draw(b, sx, sy, hurtFlash){
      const face = b.dir < 0 ? -1 : 1, scale = b.w/DOG_W;
      if (hurtFlash) ctx.globalAlpha = 0.5;
      drawSpriteAt(drawDogSprite, face<0 ? sx+b.w : sx, sy, scale, face, Date.now()/90);
      ctx.globalAlpha = 1;
      // glowing red eyes
      ctx.fillStyle = "#ff2b2b";
      const ey = sy + 20, ex = face>0 ? sx+b.w-30 : sx+16;
      ctx.fillRect(ex, ey, 8, 8); ctx.fillRect(ex + (face>0?-14:14), ey, 8, 8);
    },
  },

  // The Skeleton Lord — a bone-white spectre that hurls aimed fireballs.
  // Stomps bounce off harmlessly; only fire breath hurts it.
  skeleton: {
    tile:"T", hurtBy:{ stomp:false, flame:true },
    introMsg:"☠  SKELETON LORD — USE FIRE (X)!  ☠",
    hudName:"SKELETON LORD — FIRE (X) ONLY", hitName:"SKELETON",
    spawn(col, barrierX){
      const T = TUNE.bosses.skeleton;
      const bx = col*TILE + TILE/2 - T.w/2;
      return {
        kind:"skeleton", x: bx, y: GROUND_TOP - T.h, w: T.w, h: T.h,
        dir: -1, hits: 0, maxHits: T.maxHits, flashT: 0, cooldown: 0, bob: 0, timer: 90,
        alive: true, defeated: false,
        arenaL: Math.max(0, bx - T.arenaTiles*TILE), arenaR: barrierX,
      };
    },
    update(b, p){
      const T = TUNE.bosses.skeleton;
      // stalks the player slowly, bobbing; hurls fireballs; only fire hurts it
      b.dir = p.x < b.x ? -1 : 1;
      b.x += b.dir * (T.speedBase + b.hits*T.speedPerHit);
      b.x = Math.max(b.arenaL+TILE, Math.min(b.arenaR - b.w - 8, b.x));
      b.bob += 0.06;
      b.y = GROUND_TOP - b.h + Math.round(Math.sin(b.bob)*3);
      if (--b.timer <= 0){
        const dx = (p.x+p.w/2)-(b.x+b.w/2), dy = (p.y+p.h/2)-(b.y+26);
        const d = Math.hypot(dx,dy) || 1;
        spawnFireball(b.x+b.w/2, b.y+26, dx/d*T.fireSpeed, dy/d*T.fireSpeed + T.fireLift, T.fireLife);
        b.timer = Math.max(T.cadenceMin, T.fireCadence - b.hits*T.cadencePerHit);
        sfx.fire();
      }
      if (b.cooldown<=0 && aabb(p,b)){ b.cooldown = T.contactCooldown; damage(false); }
    },
    draw(b, sx, sy, hurtFlash){ drawSkeleton(b, sx, sy, hurtFlash); },
  },
};

// ---- shared shell ---------------------------------------------------------

function updateBoss(){
  const b = G.boss, p = G.player;
  if (!b || !b.alive) return;
  const def = BOSSES[b.kind];

  // entering the arena starts the fight + dramatic music + a checkpoint
  if (!G.bossStarted && p.x + p.w > b.arenaL){
    G.bossStarted = true;
    G.checkpoint = { x: b.arenaL + TILE, y: GROUND_TOP - p.h - 1 };
    setTrack("boss");
    msgFlash(def.introMsg);
    sfx.bossIntro();
  }
  if (!G.bossStarted) return;

  if (b.cooldown>0) b.cooldown--;
  if (b.flashT>0) b.flashT--;
  def.update(b, p);
}

// a successful stomp (or star touch) on a stompable boss
function stompHitBoss(b){
  const p = G.player, T = TUNE.bosses[b.kind], def = BOSSES[b.kind];
  b.hits++; p.vy = -T.bounce;               // bounce off
  b.flashT = 20; b.cooldown = T.hitCooldown; // brief grace so one stomp = one hit
  b.dir = p.x < b.x ? 1 : -1;               // bolt away from the player
  addScore(TUNE.score.bossHit); sfx.stomp();
  spawnParticles(b.x+b.w/2, b.y+12, "#ff5d5d", 18);
  if (b.hits >= b.maxHits) defeatBoss(b);
  else msgFlash(def.hitName+" HIT  "+b.hits+"/"+b.maxHits);
}

// a fire-breath hit on a flame-vulnerable boss (called by projectiles.js)
function flameHitBoss(b, fl){
  const def = BOSSES[b.kind];
  b.hits++; b.flashT = 15; addScore(TUNE.score.bossFlameHit);
  spawnParticles(fl.x, fl.y, "#ffd23d", 12); sfx.stomp();
  if (b.hits >= b.maxHits) defeatBoss(b);
  else msgFlash(def.hitName+" HIT  "+b.hits+"/"+b.maxHits);
}

function defeatBoss(b){
  b.alive = false; b.defeated = true;
  for (let i=0;i<46;i++)
    spawnParticles(b.x+Math.random()*b.w, b.y+Math.random()*b.h, i%2?"#ff5d5d":"#ffcf3d", 1);
  G.solids = G.solids.filter(s => s.type !== "barrier");   // open the gate to the flag
  G.barriers = [];
  addScore(TUNE.score.bossDefeat, "BOSS DEFEATED!");
  setTrack(levelTrack());
  sfx.win();
}

function drawBoss(){
  const b = G.boss;
  if (!b || !b.alive) return;
  const def = BOSSES[b.kind], sx = px(b.x), sy = py(b.y);
  // ground shadow
  ctx.globalAlpha = 0.22; ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.ellipse(sx+b.w/2, py(GROUND_TOP), b.w/2.2, 6, 0, 0, 7); ctx.fill();
  ctx.globalAlpha = 1;

  const hurtFlash = b.flashT>0 && Math.floor(Date.now()/40)%2;
  def.draw(b, sx, sy, hurtFlash);

  // health pips above the boss
  const mp = b.maxHits, pw = mp*15-4;
  for (let i=0;i<mp;i++){
    const bx = sx+b.w/2-pw/2+i*15;
    ctx.fillStyle = i < (mp-b.hits) ? "#ff5d5d" : "#3a3a3a";
    ctx.fillRect(bx, sy-16, 11, 8);
    ctx.strokeStyle = "#000"; ctx.strokeRect(bx, sy-16, 11, 8);
  }
}

// The Skeleton Lord's sprite (kept beside its registry entry)
function drawSkeleton(b, x, y, hurtFlash){
  const bone = hurtFlash ? "#ffde9e" : "#e8e4da", dark = "#b9b2a4";
  const cx = x + b.w/2;
  const armSwing = Math.sin(b.bob*2)*4;
  const charging = b.timer < 22;
  // legs
  ctx.fillStyle=bone;
  ctx.fillRect(cx-14, y+66, 6, 22); ctx.fillRect(cx+8, y+66, 6, 22);
  ctx.fillStyle=dark; ctx.fillRect(cx-15, y+86, 8, 4); ctx.fillRect(cx+7, y+86, 8, 4); // feet
  // pelvis
  ctx.fillStyle=bone; ctx.fillRect(cx-13, y+60, 26, 7);
  // spine
  ctx.fillRect(cx-3, y+30, 6, 32);
  // ribs
  for (let i=0;i<4;i++){
    ctx.fillRect(cx-16, y+34+i*7, 32, 4);
  }
  ctx.fillStyle=dark; ctx.fillRect(cx-16, y+36, 32, 1);
  // arms (front arm rises to throw)
  ctx.fillStyle=bone;
  ctx.fillRect(cx-24, y+32+armSwing, 8, 5);  ctx.fillRect(cx-26, y+32+armSwing, 6, 18); // back arm
  const fa = charging ? -8 : armSwing;
  ctx.fillRect(cx+16, y+32+fa, 8, 5); ctx.fillRect(cx+20, y+32+fa, 6, 18);              // front arm
  // fireball forming in the front hand while charging
  if (charging){
    const r = 4 + (22-b.timer)*0.25;
    ctx.globalAlpha = 0.5; ctx.fillStyle="#ff7a1a";
    ctx.beginPath(); ctx.arc(cx+23, y+52+fa, r+3, 0, 7); ctx.fill(); ctx.globalAlpha=1;
    ctx.fillStyle="#ffd23d"; ctx.beginPath(); ctx.arc(cx+23, y+52+fa, r, 0, 7); ctx.fill();
  }
  // skull
  ctx.fillStyle="#000"; ctx.fillRect(cx-17, y-1, 34, 30);
  ctx.fillStyle=bone; ctx.fillRect(cx-16, y, 32, 22);
  ctx.fillRect(cx-12, y+22, 24, 7);                          // jaw
  ctx.fillStyle=dark; ctx.fillRect(cx-12, y+22, 24, 2);
  // teeth
  ctx.fillStyle="#fff";
  for (let i=0;i<5;i++) ctx.fillRect(cx-10+i*5, y+24, 3, 4);
  // glowing eye sockets + nasal cavity
  const glow = charging ? "#ffd23d" : "#ff7a1a";
  ctx.fillStyle="#141414";
  ctx.fillRect(cx-11, y+7, 9, 8); ctx.fillRect(cx+2, y+7, 9, 8);
  ctx.fillStyle=glow;
  ctx.fillRect(cx-9, y+9, 5, 4); ctx.fillRect(cx+4, y+9, 5, 4);
  ctx.fillStyle="#141414"; ctx.fillRect(cx-1, y+15, 3, 4);
}
