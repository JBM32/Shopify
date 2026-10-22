// player.js — Three Tails: spawn, per-frame movement/physics, damage &
// checkpoint respawn, and pose selection for the hero sprite.
"use strict";

function spawnPlayer(x, y){
  const p = {
    x, y, w: TUNE.player.w, h: TUNE.player.h, vx: 0, vy: 0,
    onGround: false, face: 1, anim: 0,
    hurtT: 0, fireCd: 0,
    jumping: false,      // airborne from our own jump (release cap applies)
    jumpWas: false,      // jump key last frame — one jump per press
    coyoteT: 0, jumpBufT: 0,
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
  const p = G.player;
  p.anim += Math.abs(p.vx)*0.2 + 0.05;

  // timers (powerup effects + i-frames)
  if (p.hurtT>0) p.hurtT--;
  for (const k in POWERUPS){
    const tf = POWERUPS[k].timerField;
    if (tf && p[tf]>0) p[tf]--;
  }

  // --- run: Mario-style ramp-up, quick stop, firm skid on turnaround ---
  const M = TUNE.move, spd = p.speedT>0 ? TUNE.powerups.speed : null;
  const dir = (keys.right?1:0) - (keys.left?1:0);
  const maxv = M.maxSpeed * (spd ? spd.maxMult : 1);
  if (dir){
    p.face = dir;
    if (p.vx*dir < 0) p.vx += dir * (p.onGround ? M.skid : M.airTurn);                 // reversing: brake
    else if (Math.abs(p.vx) < maxv) p.vx += dir * (p.onGround ? M.accel : M.airAccel) * (spd ? spd.accelMult : 1);
  } else {
    const brake = p.onGround ? M.decel : M.airDrag;
    p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - brake);
  }
  p.vx = Math.max(-maxv, Math.min(maxv, p.vx));

  // --- jump: one per press, buffered, with coyote time off ledges ---
  const pressed = keys.jump && !p.jumpWas;
  p.jumpWas = keys.jump;
  if (pressed) p.jumpBufT = M.jumpBuffer; else if (p.jumpBufT>0) p.jumpBufT--;
  if (p.onGround){ p.coyoteT = M.coyote; p.jumping = false; } else if (p.coyoteT>0) p.coyoteT--;
  if (p.jumpBufT>0 && p.coyoteT>0){
    p.vy = -(M.jump * (p.jumpT>0 ? TUNE.powerups.jump.jumpMult : 1));
    p.onGround = false; p.jumping = true; p.jumpBufT = 0; p.coyoteT = 0; sfx.jump();
  }
  // variable height: letting go early cuts the rise. A jump ends once you
  // start falling, so a stomp bounce (launched while falling) is never cut.
  if (p.vy > 0) p.jumping = false;
  if (p.jumping && !keys.jump && p.vy < -M.releaseCap) p.vy = -M.releaseCap;

  // floaty while rising with jump held, heavier otherwise
  p.vy += (p.vy < 0 && keys.jump) ? M.holdGrav : M.fallGrav;
  if (p.vy > M.maxFall) p.vy = M.maxFall;
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
