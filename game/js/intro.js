// intro.js — the animated intro cutscene (rendered entirely on the canvas,
// no video). Skipped with Space / Enter / click; endIntro() lives in flow.js.
"use strict";

// Local-origin cat for the cutscene, so it can be scaled/placed freely.
function catLocal(phase, pose){
  const ms = phase*120;            // renderIntro passes phase = ms/120
  const blink = pose==="stand" && ms%3400 < 140;
  drawCatSprite(0, 0, 1, pose || RUN_SEQ[Math.floor(phase)%4], ms, false, blink);
}

function introCaption(text, alpha){
  ctx.globalAlpha=clamp01(alpha);
  ctx.fillStyle="#000"; ctx.fillRect(0,H-28,W,28);
  ctx.fillStyle="#ffcf3d"; ctx.font="bold 14px monospace"; ctx.textAlign="center";
  ctx.fillText(text, W/2, H-10);
  ctx.globalAlpha=1; ctx.textAlign="left";
}

// timeline (ms): title card → cat walks in → Zerox pack marches in → finale
const INTRO = { title:1900, cat:4400, dogs:7000, action:9600, end:10800 };

function renderIntro(ms){
  // starfield night sky
  ctx.fillStyle="#0b0d20"; ctx.fillRect(0,0,W,H);
  for (let i=0;i<46;i++){
    ctx.globalAlpha=0.4+0.6*Math.abs(Math.sin(ms/350+i));
    ctx.fillStyle="#fff"; ctx.fillRect((i*97)%W,(i*53)%(H-50),2,2);
  }
  ctx.globalAlpha=1;
  const gY=H-40;
  ctx.fillStyle="#16223c"; ctx.fillRect(0,gY,W,40);     // ground
  ctx.fillStyle="#22365c"; ctx.fillRect(0,gY,W,4);
  const phase=ms/120;

  if (ms < INTRO.title){
    const a = clamp01((ms-200)/700) * (ms>1400 ? clamp01((INTRO.title-ms)/500) : 1);
    ctx.globalAlpha=a;
    ctx.fillStyle="#5d83ff"; ctx.font="bold 34px monospace"; ctx.textAlign="center";
    ctx.fillText("★ PIXEL DASH ★", W/2, H/2-6);
    ctx.fillStyle="#cfe0ff"; ctx.font="bold 12px monospace";
    ctx.fillText("a tale of one cat and many dogs", W/2, H/2+18);
    ctx.globalAlpha=1; ctx.textAlign="left";
  } else {
    // Three Tails walks in from the left and settles on the left third
    const walk = clamp01((ms-INTRO.title)/1400);
    let cx = -40 + walk*(W*0.28+40), cy = gY-44;
    let catPose = walk < 1 ? RUN_SEQ[Math.floor(phase)%4] : "stand";
    if (ms >= INTRO.action){                  // hop happily during the finale
      const jt=(ms-INTRO.action)/420;
      const hop = Math.abs(Math.sin(jt*Math.PI))*30;
      cy -= hop;
      catPose = hop > 2 ? "jump" : "stand";
    }
    drawSpriteAt(ph => catLocal(ph, catPose), cx, cy, 2, 1, phase);

    // The Zerox pack marches in from the right, facing the cat
    if (ms >= INTRO.cat){
      const inn = clamp01((ms-INTRO.cat)/1500);
      for (let i=0;i<3;i++){
        const dx = W+60 - inn*(W*0.42) - i*46;
        drawSpriteAt(drawDogSprite, dx, gY-40, 2, -1, phase+i*0.7);
      }
    }

    let cap;
    if (ms < INTRO.cat)        cap = "MEET THREE TAILS — THE THREE-TAILED CAT";
    else if (ms < INTRO.dogs)  cap = "...BUT THE ZEROX ARE ON THE PROWL";
    else if (ms < INTRO.action)cap = "TAILLESS DOGS. NO MERCY.";
    else                       cap = "STOMP 'EM • GRAB COINS • REACH THE FLAG!";
    introCaption(cap, 1);
  }

  // skip hint
  ctx.globalAlpha=0.6; ctx.fillStyle="#fff"; ctx.font="bold 9px monospace"; ctx.textAlign="right";
  ctx.fillText("SPACE / CLICK TO SKIP ▶", W-8, 14); ctx.globalAlpha=1; ctx.textAlign="left";

  // fade to menu
  if (ms >= INTRO.end-600){
    ctx.globalAlpha=clamp01((ms-(INTRO.end-600))/600);
    ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1;
  }
  if (ms >= INTRO.end) endIntro();
}
