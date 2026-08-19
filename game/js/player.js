// player.js — Three Tails: spawn, per-frame movement/physics, damage &
// checkpoint respawn, and pose selection for the hero sprite.
"use strict";

function spawnPlayer(x, y){
  const p = {
    x, y, w: TUNE.player.w, h: TUNE.player.h, vx: 0, vy: 0,
    onGround: false, face: 1, anim: 0,
    hurtT: 0, fireCd: 0,
  };
  // every registered powerup gets its timer/counter field auto-inited,
  // so a new powerup needs no edits here
  for (const k in POWERUPS){
    const def = POWERUPS[k];
    if (def.timerField) p[def.timerField] = 0;
    if (def.hud && def.hud.countField) p[def.hud.countField] = 0;
  }
  G.player = p;
}

function updatePlayer(){
  const p = G.player, PH = TUNE.physics;
  p.anim += Math.abs(p.vx)*0.2 + 0.05;

  // timers (powerup effects + i-frames)
  if (p.hurtT>0) p.hurtT--;
  for (const k in POWERUPS){
    const tf = POWERUPS[k].timerField;
    if (tf && p[tf]>0) p[tf]--;
  }

  const accel = PH.move * (p.speedT>0 ? TUNE.powerups.speed.accelMult : 1);
  if (keys.left){ p.vx -= accel; p.face=-1; }
  if (keys.right){ p.vx += accel; p.face=1; }
  if (!keys.left && !keys.right) p.vx *= PH.friction;
  const maxv = PH.maxVX * (p.speedT>0 ? TUNE.powerups.speed.maxMult : 1);
  p.vx = Math.max(-maxv, Math.min(maxv, p.vx));

  if (keys.jump && p.onGround){
    p.vy = -(PH.jump * (p.jumpT>0 ? TUNE.powerups.jump.jumpMult : 1));
    p.onGround = false; sfx.jump();
  }
  if (!keys.jump && p.vy < -PH.varJumpCap) p.vy = -PH.varJumpCap; // variable jump height

  p.vy += PH.grav;
  if (p.vy > PH.maxFall) p.vy = PH.maxFall;
  moveAndCollide(p);

  // fall off world
  if (p.y > G.levelH + TUNE.player.fallPad) damage(true);
}

// take a hit (fell = fell out of the world, which pierces star/i-frames)
function damage(fell){
  const p = G.player;
  if (p.starT>0 && !fell) return;
  if (p.hurtT>0 && !fell) return;
  G.lives--; sfx.hurt(); p.hurtT = TUNE.player.hurtFrames;
  spawnParticles(p.x+p.w/2, p.y+p.h/2, "#ff3d3d", 12);
  if (G.lives <= 0){ gameOver(); return; }
  // respawn at the latest checkpoint (level start, a checkpoint post, or the
  // boss arena entrance); timed powerups clear, stock counters (🔥) survive
  p.x = G.checkpoint.x; p.y = G.checkpoint.y; p.vx=0; p.vy=0;
  for (const k in POWERUPS){
    const tf = POWERUPS[k].timerField;
    if (tf) p[tf] = 0;
  }
}

function drawPlayer(){
  const p = G.player;
  if (p.hurtT>0 && Math.floor(Date.now()/80)%2) return; // hit blink
  const x=px(p.x), y=py(p.y);
  let pose;
  if (!p.onGround)               pose = p.vy < 0 ? "jump" : "fall";
  else if (Math.abs(p.vx) > 0.3) pose = RUN_SEQ[Math.floor(p.anim)%4];
  else                           pose = "stand";
  const blink = p.onGround && Date.now()%3400 < 140; // idle blink every ~3.4s
  drawCatSprite(x, y, p.face, pose, Date.now(), p.starT>0, blink);
}
