// sprites/cat.js — Three Tails, the hi-res hero sprite.
// The body is authored as a 32×52 texel pixel-art map (16×26 logical px:
// the ears overhang 4px above the 16×22 hitbox) drawn at 2 texels per
// logical pixel. Legs are separate 32×6 pose maps drawn below the hitbox;
// the three tails, trailing scarf and whiskers are drawn procedurally so
// they can wave and twitch.
// PURE: draws at world/screen coords passed in — never reads G.
"use strict";

const CAT_PAL = {
  o:"#231204",            // outline, dark warm brown
  F:"#ff9b3d",            // fur base
  H:"#ffbd6b",            // fur highlight
  f:"#e0741a",            // fur shade / tabby stripe
  d:"#a8500e",            // deep fur shade
  b:"#ffeacb",            // cream muzzle & belly
  B:"#eec89b",            // cream shadow
  p:"#ff7ba1",            // pink inner-ear / nose
  P:"#d1517a",            // pink shade
  e:"#49dc4e",            // iris green
  E:"#1d7a26",            // iris dark rim
  k:"#07230d",            // pupil
  w:"#ffffff",            // eye shine
  r:"#e8433f",            // scarf red
  R:"#a92c2c",            // scarf shadow
};
const CAT_BODY = [
"....oo....................oo....",
"...oHFo..................oFFo...",
"...oHpFo................oFpFo...",
"..oHppFFo..............oFppFo...",
"..oHpppFFo............oFpppFo...",
".oHFpppFFo............oFpppFFo..",
".oHFFpFFFFo..........oFFFpFFFo..",
".oHFFFFFFFFoooooooooooFFFFFFFo..",
".oHHFFFFFFFFFFFFFFFFFFFFFFFFFo..",
"oHHFFFFfFFFFFffFFFFFFFfFFFFFFFo.",
"oHHFFFffFFFFffffFFFFFFffFFFFFFo.",
"oHFFFFffFFFFffffFFFFFFffFFFFFFo.",
"oHFFFFffFFFFffffFFFFFFffFFFFFFo.",
"oHFFFFfFFFFFffffFFFFFFFfFFFFFFo.",
"oHFFFFFFFFFFFffFFFFFFFFFFFFFFFo.",
"oHFFFFFFFFFFFFFFFFFFFFFFFFFFFFo.",
"oHFFooooFFFFFFFFFFFFFFooooFFFFo.",
"oHFooeeeoFFFFFFFFFFFFooeeeoFFFo.",
"oHFoweekkoFFFFFFFFFFoweekkoFFFo.",
"oHFoweekkoFFFFFFFFFFoweekkoFFFo.",
"oFFoeeekkoFFFFFFFFFFoeeekkoFFFo.",
"oFFoEeekkoFFFFFFFFFFoEeekkoFFFo.",
"oFFooEEEoFFFbbbbFFFFooEEEoFFFFo.",
"oFFFooooFFbbppppbbFFFooooFFFFdo.",
".oFFFFFFFbbbppppbbbFFFFFFFFFdo..",
".oFFFFFFFbbbbPPbbbbbFFFFFFFFdo..",
"oFFFFFFFbbbbbbbbbbbbFFFFFFFFFdo.",
"oFFFFFFFbbbobbbbobbbFFFFFFFFFdo.",
".oFFFFFFbbbbooooBbbbFFFFFFFFdo..",
".odFFFFFFbbbbbbBBbFFFFFFFFFddo..",
"..oodFFFFFbbbbBBbFFFFFFFFdoo....",
"....ooFFFFFFFFFFFFFFFFFFoo......",
"....orrrrrrrrrrrrrrrrrrrro......",
"...orrrrrrrrrrrrrrrrrrrrrro.....",
"...oRRrrrrrrrrrrrrrrrrrRRRo.....",
"....oRRRRRRRRRRRRRRRRRRRRo......",
"....oFFFFFFFFFFFFFFFFFFFFo......",
"...oFFFFFFbbbbbbbbbbFFFFFFo.....",
"..oFFFFFbbbbbbbbbbbbbbFFFFFo....",
"..offFFbbbbbbbbbbbbbbbbFFffo....",
".offfFFbbbbbbbbbbbbbbbbFFfffo...",
".offFFFbbbbbbbbbbbbbbbbFFFffo...",
".oFFFFFbbbbbbbbbbbbbbbbFFFFFo...",
".offFFFbbbbbbbbbbbbbbbbFFFffo...",
".offFFFbbbbbbbbbbbbbbbbFFFffo...",
".oFFFFFbbbbbbbbbbbbbbbbFFFFFo...",
".offFFFbbbbbbbbbbbbbbbbFFFffo...",
".odfFFFbbbbbbbbbbbbbbbbFFFfdo...",
".odFFFFBbbbbbbbbbbbbbbBFFFFdo...",
".odFFFFFBBbbbbbbbbbbBBFFFFFdo...",
"..odFFFFFFBBBBBBBBBBFFFFFFdo....",
"...ooddFFFFFFFFFFFFFFFFddoo.....",
];
// Leg pose maps (32×6): stand, run stride A/passing B/stride C, jump, fall.
const CAT_LEGS = {
  stand:[
"...oFFFFFo..........oFFFFFo.....",
"...oFFFFFo..........oFFFFFo.....",
"...oFbbbFo..........oFbbbFo.....",
"...obbbbbo..........obbbbbo.....",
"...oooooo...........oooooo......",
"................................",
  ],
  runA:[
".oFFFFFo...............oFFFFFo..",
"..oFFFFFo.............oFFFFFo...",
"...oFbbbFo...........oFbbbFo....",
"....obbbbo...........obbbbo.....",
"....ooooo.............ooooo.....",
"................................",
  ],
  runB:[
"......oFFFFo.....oFFFFo.........",
"......oFFFFo.....oFFFFo.........",
"......oFbbFo.....oFbbFo.........",
"......obbbbo.....obbbbo.........",
"......ooooo.......ooooo.........",
"................................",
  ],
  runC:[
"...oFFFFFo..........oFFFFFo.....",
"....oFFFFFo........oFFFFFo......",
".....oFbbbFo......oFbbbFo.......",
"......obbbbo......obbbbo........",
"......ooooo........ooooo........",
"................................",
  ],
  jump:[
"....oFFFFo..........oFFFFo......",
"....oFbbFo..........oFbbFo......",
"....obbbbo..........obbbbo......",
"....oooooo..........oooooo......",
"................................",
"................................",
  ],
  fall:[
"...oFFFFo............oFFFFo.....",
"...oFFFFo............oFFFFo.....",
"...oFFFFo............oFFFFo.....",
"...oFbbFo............oFbbFo.....",
"...obbbbo............obbbbo.....",
"...ooooo..............ooooo.....",
  ],
};
const RUN_SEQ = ["runA","runB","runC","runB"];

// Parse "rows of palette keys" into per-colour horizontal texel runs
// (col,row,len) once at load, so drawing is a few fillRects per colour.
function parseTexelMap(rows){
  const byColor = {};
  rows.forEach((row,r)=>{
    for (let c=0;c<row.length;){
      const ch=row[c];
      if (ch==="."){ c++; continue; }
      let len=1; while (c+len<row.length && row[c+len]===ch) len++;
      (byColor[ch]=byColor[ch]||[]).push([c,r,len]);
      c+=len;
    }
  });
  return byColor;
}
const CAT_BODY_RUNS = parseTexelMap(CAT_BODY);
const CAT_LEG_RUNS = {}; for (const k in CAT_LEGS) CAT_LEG_RUNS[k]=parseTexelMap(CAT_LEGS[k]);
const TX = 0.5; // texel size in logical px (1 device px on the 2× canvas)

function drawTexelRuns(runs, ox, oy, pal){
  for (const ch in runs){
    ctx.fillStyle = pal[ch] || CAT_PAL[ch];
    for (const [c,r,len] of runs[ch]) ctx.fillRect(ox+c*TX, oy+r*TX, len*TX, TX);
  }
}

// The full hero: three tails + scarf tail + body + legs + whiskers.
// (x,y) = top-left of the 16×22 hitbox in logical px. face: 1 right, -1 left.
// pose: "stand" | "runA" | "runB" | "runC" | "jump" | "fall"; t = time in ms.
function drawCatSprite(x, y, face, pose, t, star, blink){
  const pal = Object.assign({}, CAT_PAL);
  if (star){                                 // invincibility: prismatic fur
    const hue = (t/3)%360;
    pal.F=`hsl(${hue},92%,62%)`; pal.H=`hsl(${hue},95%,74%)`;
    pal.f=`hsl(${(hue+35)%360},90%,50%)`; pal.d=`hsl(${(hue+55)%360},85%,42%)`;
    pal.b="#ffffff"; pal.B="#e8e2ff";
  }
  ctx.save();
  ctx.translate(x+8, 0); ctx.scale(face,1); ctx.translate(-(x+8), 0);
  const phase = t/300;
  // three lush tails: rooted at the rear hip, fanned wide (low sweep, mid
  // arc, high curl) with a slow wave. Each is walked twice — an outline
  // pass then a fur pass — so the segments merge into solid plumes.
  const SEGS = 11;
  const q = v => Math.round(v*2)/2;          // snap to the half-px texel grid
  const tailPath = (tl) => {
    const pts = [];
    let tx = x+1.5, ty = y+19-tl;
    let ang = -0.25 + tl*0.4;                // wide fan: low sweep → high curl
    for (let seg=0; seg<SEGS; seg++){
      ang += 0.04 + tl*0.012                 // high tails curl a bit harder
           + Math.sin(phase + tl*2.1)*0.06;  // whole-tail sway
      tx -= Math.cos(ang)*1.3;
      ty -= Math.sin(ang)*1.3 - Math.sin(phase*2 + tl*2.1 + seg*0.5)*0.12;
      pts.push([tx, ty, 3.0 - seg*0.14]);    // taper
    }
    return pts;
  };
  const tails = [0,2,1].map(tailPath);       // draw low & high first, mid on top
  for (const pts of tails){                  // outline pass
    ctx.fillStyle = pal.o;
    for (const [tx,ty,wsz] of pts) ctx.fillRect(q(tx-wsz/2)-0.5, q(ty-wsz/2)-0.5, wsz+1, wsz+1);
  }
  for (const pts of tails){                  // fur pass
    pts.forEach(([tx,ty,wsz],seg)=>{
      const band = (seg===4||seg===5||seg===7);   // dark rings
      ctx.fillStyle = seg>=8 ? pal.b : band ? pal.f : pal.F;
      ctx.fillRect(q(tx-wsz/2), q(ty-wsz/2), wsz, wsz);
      if (seg<8){ ctx.fillStyle = pal.H;          // lit top edge
        ctx.fillRect(q(tx-wsz/2), q(ty-wsz/2), wsz, 0.5); }
    });
  }
  // trailing scarf end, fluttering behind the shoulders
  let sx = x+2.5, sy = y+12.5;
  for (let seg=0; seg<5; seg++){
    sx -= 1.1; sy += Math.sin(phase*2.6 + seg*0.9)*0.55 + 0.3;
    ctx.fillStyle = seg>=3 ? CAT_PAL.R : CAT_PAL.r;
    ctx.fillRect(q(sx), q(sy), 1.5, 1);
  }
  // body (bobs down half a texel on the passing run frame)
  const bob = (pose==="runB") ? 0.5 : 0;
  drawTexelRuns(CAT_BODY_RUNS, x, y-4+bob, pal);
  // blink: fur-coloured eyelids with a lash line over the eye texels
  if (blink){
    ctx.fillStyle=pal.F;
    ctx.fillRect(x+1.5, y+4.5, 3.5, 2.5); ctx.fillRect(x+9.5, y+4.5, 3.5, 2.5);
    ctx.fillStyle=pal.o;
    ctx.fillRect(x+1.5, y+6.5, 3.5, 0.5); ctx.fillRect(x+9.5, y+6.5, 3.5, 0.5);
  }
  // legs below the hitbox
  drawTexelRuns(CAT_LEG_RUNS[pose] || CAT_LEG_RUNS.stand, x, y+22, pal);
  // whiskers: two fine angled hairs per cheek, twitching now and then
  ctx.fillStyle="rgba(255,255,255,.8)";
  const wj = Math.sin(t/900)>0.85 ? 0.5 : 0;
  for (const side of [-1,1]){
    const cheek = side<0 ? x+0.5 : x+15.5;   // just outside the face
    for (let i=0;i<2;i++){
      const tilt = i===0 ? -0.5 : 0.5;       // top angles up, bottom down
      for (let s=0;s<3;s++)
        ctx.fillRect(cheek + side*(s*1.2) - (side<0?1.2:0), y+9+bob+i*2 + tilt*s + wj, 1.2, 0.5);
    }
  }
  ctx.restore();
}
