// powerups.js — one registry entry per power-up kind. Adding one here is
// (usually) ALL the code you need:
//   tile       — the level-grid character that spawns it (must be unique)
//   color      — box colour; icon (a char) or drawIcon(x,y,s) — box face
//   msg        — HUD flash on pickup
//   timerField — player field auto-INITed by spawnPlayer, auto-TICKED by
//                updatePlayer, auto-CLEARED on damage-respawn, and shown in
//                the HUD while > 0 (via hud.label/color). null = no timer.
//   hud.countField — alternatively, show a stock counter (e.g. fire charges;
//                counters survive respawn).
//   apply(p)   — what pickup does to the player.
// The effect itself is read where it matters (e.g. player.js reads speedT);
// a brand-new effect field needs one `if` in its consuming system.
"use strict";

const POWERUPS = {
  speed: {
    tile:"S", color:"#36e0ff", icon:"»", msg:"SPEED!",
    timerField:"speedT", hud:{ label:"SPD", color:"#36e0ff" },
    apply(p){ p.speedT = TUNE.powerups.speed.duration; },
  },
  jump: {
    tile:"J", color:"#9dff5d", icon:"↑", msg:"HIGH JUMP!",
    timerField:"jumpT", hud:{ label:"JMP", color:"#9dff5d" },
    apply(p){ p.jumpT = TUNE.powerups.jump.duration; },
  },
  star: {
    tile:"V", color:"#ffd23d", icon:"★", msg:"INVINCIBLE!",
    timerField:"starT", hud:{ label:"★", color:"#ffd23d" },
    apply(p){ p.starT = TUNE.powerups.star.duration; },
  },
  fire: {
    tile:"R", color:"#ff6a2b",
    msg:"FIRE BREATH +5  (press X)",  // keep "+5" in sync with TUNE.powerups.fire.charges
    timerField:null, hud:{ label:"🔥", color:"#ff7a1a", countField:"fireCharges" },
    // little flame icon instead of a text glyph
    drawIcon(x, y, s){
      ctx.fillStyle="#ffd23d";
      ctx.beginPath(); ctx.moveTo(x+s/2,y+3); ctx.lineTo(x+s-4,y+s-3); ctx.lineTo(x+4,y+s-3); ctx.fill();
      ctx.fillStyle="#fff4b8"; ctx.fillRect(x+s/2-1,y+s-6,2,3);
    },
    apply(p){ p.fireCharges += TUNE.powerups.fire.charges; },
  },
};

function spawnPowerup(kind, x, y){
  G.powerups.push({ x:x+4, y:y+4, w:TILE-8, h:TILE-8, kind, got:false, t:0 });
}

function updatePowerups(){
  const p = G.player;
  for (const pu of G.powerups){
    if (pu.got) continue; pu.t += 0.1;
    if (aabb(p, pu)){
      pu.got = true; sfx.power();
      spawnParticles(pu.x+pu.w/2, pu.y+pu.h/2, "#fff", 12);
      const def = POWERUPS[pu.kind];
      def.apply(p); msgFlash(def.msg);
    }
  }
}

function drawPowerups(){
  for (const pu of G.powerups){
    if (pu.got) continue;
    const bob = Math.sin(pu.t*2)*2;
    const x=px(pu.x), y=py(pu.y)+bob, s=pu.w;
    const def = POWERUPS[pu.kind];
    ctx.fillStyle="#000"; ctx.fillRect(x-1,y-1,s+2,s+2);
    ctx.fillStyle=def.color; ctx.fillRect(x,y,s,s);
    ctx.fillStyle="rgba(255,255,255,.6)"; ctx.fillRect(x+2,y+2,s-4,3);
    if (def.drawIcon){
      def.drawIcon(x, y, s);
    } else {
      ctx.fillStyle="#0a1a2a"; ctx.font="bold 11px monospace"; ctx.textAlign="center";
      ctx.fillText(def.icon, x+s/2, y+s-3);
      ctx.textAlign="left";
    }
  }
}
