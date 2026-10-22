// sprites/potato.js — the castle's potato men (walker + hot-potato spitter)
// and the Potato Monster's evil mini French fries. Drawn at local origin
// facing right, via drawSpriteAt() (sprites/dog.js) for position/mirror/scale.
// PURE: parameters only — never reads G.
"use strict";

const POTATO_W = 18, POTATO_H = 20;
const POTATO_COLORS = { body:"#c79a5b", shade:"#a67a42", light:"#e2bd7f", spot:"#7d5629",
                        limb:"#5e3f1c", brow:"#3a2410", cheek:null };
const HOT_POTATO_COLORS = { body:"#d98a4a", shade:"#b4652e", light:"#f2b06e", spot:"#8a3f1c",
                            limb:"#5e2f14", brow:"#3a1608", cheek:"#ff4a3a" };

// phase drives the waddle: limbs alternate on Math.floor(phase)%2.
// charge 0..1 = hot potato about to spit (steam + glowing mouth)
function drawPotatoSprite(phase, colors, charge){
  const w = POTATO_W, h = POTATO_H, c = colors || POTATO_COLORS;
  const f = Math.floor(phase)%2;
  // lumpy outline + body (two overlapping rects read as a rounded spud)
  ctx.fillStyle="#000";    ctx.fillRect(1,-1,w-2,h+2); ctx.fillRect(-1,2,w+2,h-4);
  ctx.fillStyle=c.body;    ctx.fillRect(2,0,w-4,h);    ctx.fillRect(0,3,w,h-6);
  ctx.fillStyle=c.shade;   ctx.fillRect(2,h-4,w-4,4);  ctx.fillRect(0,h-7,w,4);
  ctx.fillStyle=c.light;   ctx.fillRect(3,1,6,2);      ctx.fillRect(1,4,2,4);
  // potato "eyes" (the spud kind)
  ctx.fillStyle=c.spot;    ctx.fillRect(3,10,2,2); ctx.fillRect(6,15,2,1); ctx.fillRect(2,14,1,2);
  // angry little face, looking forward
  ctx.fillStyle="#fff";    ctx.fillRect(w-7,5,4,4);  ctx.fillRect(w-12,5,3,4);
  ctx.fillStyle="#000";    ctx.fillRect(w-5,6,2,3);  ctx.fillRect(w-10,6,1,3);
  ctx.fillStyle=c.brow;    ctx.fillRect(w-8,3,3,1);  ctx.fillRect(w-5,4,3,1);   // slanted brows
                           ctx.fillRect(w-13,4,3,1); ctx.fillRect(w-10,3,2,1);
  if (c.cheek){ ctx.fillStyle=c.cheek; ctx.fillRect(w-3,10,2,2); ctx.fillRect(w-13,10,2,2); }
  // scowl (glows when a hot potato is charging)
  ctx.fillStyle = charge>0 ? "#ffb23d" : c.brow;
  ctx.fillRect(w-10,12,6,charge>0?2:1); ctx.fillRect(w-11,13,1,1); ctx.fillRect(w-4,13,1,1);
  // stick arms + stubby legs
  ctx.fillStyle=c.limb;
  ctx.fillRect(-3,9+(f?1:0),3,2); ctx.fillRect(w,9+(f?0:1),3,2);
  ctx.fillRect(4,h,3,2+(f?1:0));  ctx.fillRect(w-7,h,3,2+(f?0:1));
  // steam wisps rising off a hot potato as it charges
  if (charge>0){
    ctx.fillStyle="rgba(235,235,245,.75)";
    const s = Math.floor(phase*2)%3;
    ctx.fillRect(5+s,-4,2,2); ctx.fillRect(10-s,-7,2,2); ctx.fillRect(7,-10+s,2,2);
  }
}

const FRY_W = 7, FRY_H = 13;
const FRY_COLORS = { body:"#ffd23d", shade:"#e8a92a", tip:"#b97a1c", eye:"#ff2b2b" };

// a running, evil mini French fry. phase drives the frantic leg scurry.
function drawFrySprite(phase, colors){
  const w = FRY_W, h = FRY_H, c = colors || FRY_COLORS;
  const f = Math.floor(phase)%2;
  ctx.fillStyle="#000";    ctx.fillRect(-1,-1,w+2,h+2);          // outline
  ctx.fillStyle=c.body;    ctx.fillRect(0,0,w,h);
  ctx.fillStyle=c.shade;   ctx.fillRect(0,0,2,h);                // crinkle side
  ctx.fillStyle=c.tip;     ctx.fillRect(0,0,w,2);                // crispy burnt tip
  // mean red eyes + brows, fanged grin
  ctx.fillStyle="#fff";    ctx.fillRect(2,4,2,2); ctx.fillRect(5,4,2,2);
  ctx.fillStyle=c.eye;     ctx.fillRect(3,5,1,1); ctx.fillRect(6,5,1,1);
  ctx.fillStyle="#000";    ctx.fillRect(2,3,2,1); ctx.fillRect(5,3,2,1);
                           ctx.fillRect(2,8,5,1);
  ctx.fillStyle="#fff";    ctx.fillRect(3,9,1,1); ctx.fillRect(5,9,1,1);
  // flailing arms + scurrying legs
  ctx.fillStyle="#000";
  ctx.fillRect(-2,f?5:7,2,1); ctx.fillRect(w,f?7:5,2,1);
  ctx.fillRect(f?0:1,h,1,3);  ctx.fillRect(f?5:4,h,1,3);
  ctx.fillRect(f?-1:1,h+2,2,1); ctx.fillRect(f?5:3,h+2,2,1);
}
