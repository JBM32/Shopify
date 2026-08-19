// sprites/dog.js — the Zerox dog (a tailless dog), drawn at local origin
// facing right. One sprite, three users: the patrolling enemy, the giant
// scaled-up Zerox boss, and the intro cutscene — all via drawSpriteAt(),
// which handles position, mirroring and scale.
// PURE: parameters only — never reads G.
"use strict";

const DOG_W = 18, DOG_H = 20;
const DOG_COLORS = { body:"#8a6b4a", dark:"#5f4730", muzzle:"#caa370", collar:"#e23d3d" };

// phase drives the leg shuffle: feet alternate on Math.floor(phase)%2
function drawDogSprite(phase, colors){
  const w = DOG_W, h = DOG_H;
  const c = colors || DOG_COLORS;
  ctx.fillStyle="#000";    ctx.fillRect(-1,-1,w+2,h+2);   // outline
  ctx.fillStyle=c.body;    ctx.fillRect(0,0,w,h);         // body
  ctx.fillStyle=c.dark;    ctx.fillRect(0,0,w,3);         // darker back
  ctx.fillStyle=c.dark;    ctx.fillRect(1,0,4,9);         // floppy ear (back)
  ctx.fillStyle=c.muzzle;  ctx.fillRect(w-6,8,7,6);       // snout (front)
  ctx.fillStyle="#1a1a1a"; ctx.fillRect(w-1,9,2,3);       // nose
  ctx.fillStyle=c.dark;    ctx.fillRect(w-6,13,7,1);      // mouth
  ctx.fillStyle="#fff";    ctx.fillRect(w-9,4,3,3);       // eye
  ctx.fillStyle="#000";    ctx.fillRect(w-8,5,2,2);       // pupil
  ctx.fillStyle=c.dark;    ctx.fillRect(w-9,3,4,1);       // brow
  ctx.fillStyle=c.collar;  ctx.fillRect(w-11,10,2,h-12);  // collar (NO tail)
  // legs shuffle
  const f = Math.floor(phase)%2;
  ctx.fillStyle=c.dark;
  ctx.fillRect(2,   h, 4, 3+(f?1:0));
  ctx.fillRect(w-6, h, 4, 3+(f?0:1));
}

// draw a local-origin sprite fn at (x,y), scaled and mirrored (face -1|1)
function drawSpriteAt(fn, x, y, s, face, phase){
  ctx.save();
  ctx.translate(x, y); ctx.scale(s*face, s);
  fn(phase);
  ctx.restore();
}
