// projectiles.js — enemy fireballs (guinea pigs, Skeleton Lord) and the
// player's fire breath. Spawn helpers + update/draw for both.
"use strict";

function spawnFireball(x, y, vx, vy, life){
  G.fireballs.push({ x, y, vx, vy, life });
}

// ---------- enemy fireballs ----------
function updateFireballs(){
  const p = G.player;
  for (const fb of G.fireballs){
    fb.vy += TUNE.projectiles.fireballGrav; fb.x += fb.vx; fb.y += fb.vy; fb.life--;
    if (aabb(p, {x:fb.x-5,y:fb.y-5,w:10,h:10})){ fb.life=0; spawnParticles(fb.x,fb.y,"#ffae3d",8); damage(false); }
    else for (const s of G.solids){
      if (fb.x>s.x && fb.x<s.x+s.w && fb.y>s.y && fb.y<s.y+s.h){ fb.life=0; spawnParticles(fb.x,fb.y,"#ffae3d",6); break; }
    }
  }
  G.fireballs = G.fireballs.filter(fb => fb.life>0 && fb.y < G.levelH+40);
}

function drawFireballs(){
  for (const fb of G.fireballs){
    const x=px(fb.x), y=py(fb.y);
    const r = 4 + Math.sin(Date.now()/40)*1;
    ctx.globalAlpha=0.4; ctx.fillStyle="#ff7a1a";
    ctx.beginPath(); ctx.arc(x,y,r+3,0,7); ctx.fill(); ctx.globalAlpha=1;
    ctx.fillStyle="#ff3b1a"; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
    ctx.fillStyle="#ffd23d"; ctx.beginPath(); ctx.arc(x-fb.vx*0.3,y-1,r-2,0,7); ctx.fill();
    ctx.fillStyle="rgba(255,150,40,.5)"; ctx.fillRect(x-fb.vx, y-1, 3, 2); // trail
  }
}

// ---------- Three Tails' fire breath ----------
// Spending a charge happens here (not in player.js) to preserve the original
// update order: breath is spent AFTER enemies move, right before flames fly.
function updateFlames(){
  const p = G.player, F = TUNE.powerups.fire;
  if (p.fireCd>0) p.fireCd--;
  if (keys.fire && p.fireCd<=0 && p.fireCharges>0){
    p.fireCharges--; p.fireCd = F.cooldown;
    G.flames.push({ x:p.x+p.w/2+p.face*10, y:p.y+8, vx:p.face*F.speed, vy:0, life:F.life });
    sfx.fire();
  }
  for (const fl of G.flames){
    fl.x += fl.vx; fl.life--;
    const fbox = { x:fl.x-6, y:fl.y-5, w:12, h:10 };
    for (const e of G.enemies){
      if (e.alive && aabb(fbox, e)){
        e.alive=false; fl.life=0; addScore(TUNE.score.enemy, "+"+TUNE.score.enemy);
        spawnParticles(e.x+e.w/2,e.y,"#ffae3d",10); sfx.stomp(); break;
      }
    }
    const b = G.boss;
    if (fl.life>0 && b && b.alive && G.bossStarted && BOSSES[b.kind].hurtBy.flame && aabb(fbox, b)){
      fl.life=0; flameHitBoss(b, fl);
    }
    if (fl.life>0) for (const s of G.solids){
      if (fl.x>s.x && fl.x<s.x+s.w && fl.y>s.y && fl.y<s.y+s.h){ fl.life=0; spawnParticles(fl.x,fl.y,"#ff7a1a",5); break; }
    }
  }
  G.flames = G.flames.filter(fl => fl.life>0);
}

function drawFlames(){
  for (const fl of G.flames){
    const x=px(fl.x), y=py(fl.y);
    const a = clamp01(fl.life/28);
    const r = 5 + Math.sin(Date.now()/35 + fl.x)*1.5;
    ctx.globalAlpha = a*0.5; ctx.fillStyle="#ff7a1a";
    ctx.beginPath(); ctx.arc(x,y,r+3,0,7); ctx.fill();
    ctx.globalAlpha = a; ctx.fillStyle="#ffb23d";
    ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
    ctx.fillStyle="#fff4b8";
    ctx.beginPath(); ctx.arc(x-Math.sign(fl.vx)*2,y-1,r-3,0,7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
