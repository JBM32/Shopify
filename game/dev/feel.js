// dev/feel.js — measures Three Tails' movement feel and checks every pit is
// jumpable. Usage: node game/dev/feel.js   (needs Node + Playwright + Chromium)
// Steps update() frame by frame (deterministic, no wall-clock) on a cleared
// flat floor, so numbers are comparable before/after a TUNE.move change.
// Mario-like targets (24px tiles): top speed ~2.6 px/f reached in ~1/3 s,
// stop < half a tile, full jump ~4.5 tiles high and ~4.5 tiles far.
const path = require('path');

function loadPlaywright(){
  try { return require('playwright'); } catch (e) {}
  try { return require('/opt/node22/lib/node_modules/playwright'); } catch (e) {}
  console.error('playwright not found — npm i -g playwright');
  process.exit(2);
}

(async () => {
  const { chromium } = loadPlaywright();
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '?lv=1');
  await page.waitForTimeout(300);
  const feel = await page.evaluate(() => {
    const G = PD.G, k = PD.keys, out = {};
    const reset = () => { Object.keys(k).forEach(x=>k[x]=false); PD.buildLevel(); G.state='play'; G.lives=99;
      G.enemies.length=0; G.boss=null; G.hazards.length=0; G.powerups.length=0;
      G.solids = G.solids.filter(s => s.y >= 240 && s.type!=='barrier'); G.barriers=[];
      const p=G.player; p.x=24*10; p.y=9*24-p.h; p.vx=0; p.vy=0;
      for (let i=0;i<5;i++) update(); };
    const step = n => { for (let i=0;i<n;i++) update(); };
    // 1. frames to top speed, top speed
    reset(); k.right=true; let f=0, x0=G.player.x, prev=-1;
    while (f<200 && Math.abs(G.player.vx-prev)>1e-6){ prev=G.player.vx; update(); f++; }
    out.topSpeed = +G.player.vx.toFixed(2); out.framesToTop = f;
    // 2. stopping distance from top speed after release
    x0=G.player.x; k.right=false; f=0; while(Math.abs(G.player.vx)>0.05 && f<200){update();f++;}
    out.stopDist = +(G.player.x-x0).toFixed(1); out.stopFrames=f;
    // 3. turnaround from top speed: frames until moving the other way
    reset(); k.right=true; step(60); k.right=false; k.left=true; f=0; x0=G.player.x;
    while(G.player.vx>0 && f<200){update();f++;} out.turnFrames=f; out.turnSkid=+(G.player.x-x0).toFixed(1);
    // 4. tap 1 frame from standstill: distance moved
    reset(); k.left=false; k.right=true; update(); k.right=false; x0=G.player.x; step(60);
    out.tap1Dist = +(G.player.x - x0 + 0).toFixed(1);
    // 5. full jump (held) from top speed: height, distance, airtime
    const jump = (holdFrames) => { reset(); k.right=true; step(60); const p=G.player; const sx=p.x, sy=p.y;
      k.jump=true; let air=0, minY=sy; update(); air++;
      while(!p.onGround && air<300){ if(air>=holdFrames) k.jump=false; update(); air++; minY=Math.min(minY,p.y); }
      k.jump=false; k.right=false; return {h:+(sy-minY).toFixed(0), d:+(p.x-sx).toFixed(0), air}; };
    out.fullJump = jump(999); out.tapJump = jump(2);
    return out;
  });
  const pits = await page.evaluate(() => {
    const G = PD.G, k = PD.keys, res = [];
    for (let lv = 0; lv < PD.LEVELS.length; lv++){
      const grid = PD.LEVELS[lv].build();
      const pits = []; let s = -1;
      for (let c = 0; c < grid[10].length; c++){
        const open = grid[10][c] === ' ';
        if (open && s < 0) s = c;
        if (!open && s >= 0){ pits.push([s, c-1]); s = -1; }
      }
      for (const [a, z] of pits){
        // ignore stepping stones: test the bare pit (worst case)
        Object.keys(k).forEach(x => k[x] = false);
        G.levelIndex = lv; PD.buildLevel(); G.state = 'play'; G.lives = 99;
        G.enemies.length = 0; G.boss = null; G.hazards.length = 0; G.fireballs.length = 0;
        G.solids = G.solids.filter(s => s.y >= 240 && s.type !== 'barrier');
        const p = G.player; p.x = (a-6)*24; p.y = 240 - p.h; p.vx = 0; p.vy = 0;
        k.right = true; let f = 0, jumped = false;
        while (f++ < 400){
          if (!jumped && p.x + p.w >= a*24 + p.w - 2){ k.jump = true; jumped = true; }   // last pixel of ledge
          update();
          if (p.onGround && p.x > (z+1)*24 - 4){ break; }
          if (p.y > 300) break;
        }
        res.push({ level: lv+1, pit: `${a}-${z}`, tiles: z-a+1, cleared: p.onGround && p.y < 300 && p.x > (z+1)*24 - 4 });
      }
    }
    return res;
  });
  await b.close();
  console.log('feel:', JSON.stringify(feel, null, 1));
  pits.forEach(x => console.log(`pit L${x.level} cols ${x.pit} (${x.tiles} tiles, no stepping stones): ${x.cleared ? 'cleared' : 'FAILED'}`));
  if (pits.some(x => !x.cleared)){ console.error('FEEL CHECK FAILED: a pit is no longer jumpable'); process.exit(1); }
})();
