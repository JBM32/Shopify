// hud.js — the in-game heads-up display: score, music icon, level tag,
// stock counters (🔥), lives, active powerup timers, the boss health bar,
// and the flash message.
"use strict";

function drawHUD(){
  const p = G.player;
  ctx.fillStyle="rgba(0,0,0,.35)"; ctx.fillRect(0,0,W,22);
  ctx.fillStyle="#ffcf3d"; ctx.font="bold 13px monospace"; ctx.textAlign="left";
  ctx.fillText("● "+String(G.score).padStart(5,"0"), 8, 15);
  ctx.fillStyle = isMusicOn() ? "#9dff5d" : "#777"; // music on/off (M)
  ctx.fillText(isMusicOn() ? "♪" : "♪̸", 78, 15);
  ctx.fillStyle = "#bfa9ff"; ctx.fillText("LV"+(G.levelIndex+1), 96, 15);
  // stock counters (e.g. 🔥×3 fire charges) — any powerup with a countField
  let stockX = 126;
  for (const k in POWERUPS){
    const hud = POWERUPS[k].hud;
    if (hud && hud.countField && p[hud.countField]>0){
      ctx.fillStyle = hud.color;
      ctx.fillText(hud.label+"×"+p[hud.countField], stockX, 15);
      stockX += 46;
    }
  }
  // lives
  ctx.textAlign="right";
  ctx.fillStyle="#ff5d5d"; ctx.fillText("♥".repeat(Math.max(0,G.lives)), W-8, 15);
  // active power timers
  ctx.textAlign="center"; ctx.font="bold 11px monospace";
  const tags=[];
  for (const k in POWERUPS){
    const def = POWERUPS[k];
    if (def.timerField && def.hud && p[def.timerField]>0)
      tags.push([def.hud.label, def.hud.color, p[def.timerField]]);
  }
  tags.forEach((t,i)=>{ ctx.fillStyle=t[1]; ctx.fillText(t[0]+":"+Math.ceil(t[2]/60), W/2 + (i-tags.length/2)*46+23, 15); });
  // boss health bar
  if (G.bossStarted && G.boss && G.boss.alive){
    const boss = G.boss;
    const bw=160, bx=W/2-bw/2, by=24;
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(bx-2,by-2,bw+4,12);
    ctx.fillStyle="#ff2b2b"; ctx.fillRect(bx,by,bw*(boss.maxHits-boss.hits)/boss.maxHits,8);
    ctx.strokeStyle="#fff"; ctx.lineWidth=1; ctx.strokeRect(bx-2,by-2,bw+4,12);
    ctx.fillStyle="#fff"; ctx.font="bold 8px monospace"; ctx.textAlign="center";
    ctx.fillText(BOSSES[boss.kind].hudName, W/2, by+7);
  }
  // flash msg — NOTE: msgT deliberately ticks down here in the renderer (an
  // original quirk kept for parity: messages keep fading on overlay screens)
  if (G.msgT>0){
    ctx.globalAlpha = clamp01(G.msgT/45);
    ctx.fillStyle="#fff"; ctx.font="bold 18px monospace"; ctx.textAlign="center";
    ctx.fillText(G.msg, W/2, 56); ctx.globalAlpha=1; G.msgT--;
  }
  ctx.textAlign="left";
}
