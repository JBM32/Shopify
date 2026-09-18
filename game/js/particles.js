// particles.js — the little burst squares (coin sparkles, stomp puffs, ...).
"use strict";

function spawnParticles(x, y, color, n = 8){
  for (let i=0;i<n;i++)
    G.particles.push({ x, y, vx:(Math.random()-.5)*4, vy:(Math.random()-1.2)*3,
      life:1, color });
}

function updateParticles(){
  for (const pt of G.particles){ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.2; pt.life-=0.03; }
  G.particles = G.particles.filter(pt => pt.life>0);
}

function drawParticles(){
  for (const pt of G.particles){
    ctx.globalAlpha = clamp01(pt.life);
    ctx.fillStyle = pt.color;
    ctx.fillRect(px(pt.x), py(pt.y), 3,3);
  }
  ctx.globalAlpha=1;
}
