// themes.js — one entry per visual theme. A theme owns its palette and how
// to draw the background, the two tile types, and the coin/gem pickup.
// Reskinning a theme = editing hex strings in its palette block ONLY: draw
// fns must reference P.* keys, never literal colours.
// PURE: draw fns take camera/screen coords as parameters — never read G.
// Registry key === the `theme` field on a LEVELS entry.
"use strict";

const THEMES = {

  // sunny overworld: sky gradient, parallax hills, drifting clouds
  surface: {
    palette: {
      skyTop:"#6db3ff", skyBot:"#bfe3ff",
      hills:"#7fd17f", cloud:"rgba(255,255,255,.85)",
      brick:"#8a5a2b", brickMortar:"#6b4220", brickShine:"rgba(255,255,255,.12)",
      platGrass:"#3aa655", platDirt:"#7a5230", platShade:"rgba(0,0,0,.15)",
      coin:"#ffcf3d", coinShine:"#fff4b8",
    },
    drawBackground(camX){
      const P = this.palette;
      // sky gradient
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,P.skyTop); g.addColorStop(1,P.skyBot);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // parallax hills (slow layer)
      ctx.fillStyle=P.hills;
      const hillSpan = 200;
      for (let i=-1;i<W/hillSpan+2;i++){
        const hx = i*hillSpan - wrap(camX*0.4, hillSpan);
        ctx.beginPath(); ctx.arc(hx, H-26, 90, Math.PI, 0); ctx.fill();
      }
      // clouds (slower layer)
      ctx.fillStyle=P.cloud;
      const cloudSpan = W+160;
      for (let i=0;i<5;i++){
        const cx = i*230 - wrap(camX*0.25 + i*230, cloudSpan);
        themeCloud(cx, 40 + (i%2)*26);
      }
    },
    drawTile(s, x, y){
      const P = this.palette;
      if (s.type==="brick"){
        ctx.fillStyle=P.brick; ctx.fillRect(x,y,TILE,TILE);
        ctx.fillStyle=P.brickMortar;
        ctx.fillRect(x,y+TILE/2-1,TILE,2);
        ctx.fillRect(x+TILE/2-1,y,2,TILE/2);
        ctx.fillRect(x+TILE/4,y+TILE/2,2,TILE/2);
        ctx.fillRect(x+TILE*0.75,y+TILE/2,2,TILE/2);
        ctx.fillStyle=P.brickShine; ctx.fillRect(x,y,TILE,3);
      } else {
        ctx.fillStyle=P.platGrass; ctx.fillRect(x,y,TILE,6);
        ctx.fillStyle=P.platDirt;  ctx.fillRect(x,y+6,TILE,TILE-6);
        ctx.fillStyle=P.platShade; ctx.fillRect(x,y+TILE-3,TILE,3);
      }
    },
    // spinning gold coin
    drawCoin(c, x, y){
      const P = this.palette;
      const wob = Math.abs(Math.cos(c.t))*4+2;
      ctx.fillStyle=P.coin;
      ctx.beginPath(); ctx.ellipse(x,y,wob,7,0,0,7); ctx.fill();
      ctx.fillStyle=P.coinShine;
      ctx.beginPath(); ctx.ellipse(x-1,y-1,Math.max(1,wob-3),4,0,0,7); ctx.fill();
    },
  },

  // dark cavern: jagged far wall, glowing crystals, stalactites, dust motes
  cave: {
    palette: {
      bgTop:"#150f24", bgMid:"#0d0a18", bgBot:"#070510",
      farWall:"#1c1530", stalactite:"#241a3a", dust:"rgba(180,200,255,.5)",
      crystalA:"#36e0ff", crystalB:"#c77aff",
      brick:"#2c2540", plat:"#37304f", mortar:"#221c33",
      capPlat:"#5cf2c8", capBrick:"#6a4fa0",
      glintA:"#7af2ff", glintB:"#c77aff",
      gem:"#36e0ff", gemGlow:"#7af2ff", gemShine:"#d6fbff",
    },
    drawBackground(camX){
      const P = this.palette;
      // deep gradient
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,P.bgTop); g.addColorStop(.6,P.bgMid); g.addColorStop(1,P.bgBot);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // far cave wall (parallax) — jagged rock silhouette
      ctx.fillStyle=P.farWall;
      ctx.beginPath(); ctx.moveTo(0,H);
      for (let x=0;x<=W;x+=20){
        const n = rnd(Math.floor((x+camX*0.3)/20));
        ctx.lineTo(x, 70 + n*60);
      }
      ctx.lineTo(W,H); ctx.fill();
      // background glowing crystals (mid parallax)
      for (let i=0;i<14;i++){
        const bx = i*120 - wrap(camX*0.5 + i*120, W+240);
        const by = 60 + ((i*53)%120);
        const tw = 0.4+0.4*Math.sin(Date.now()/600 + i);
        const hue = i%2 ? P.crystalA : P.crystalB;
        ctx.globalAlpha=0.25*tw; ctx.fillStyle=hue;
        ctx.beginPath(); ctx.arc(bx,by,16,0,7); ctx.fill();
        ctx.globalAlpha=0.9; ctx.fillStyle=hue;
        ctx.beginPath(); ctx.moveTo(bx,by-10); ctx.lineTo(bx+4,by); ctx.lineTo(bx,by+10); ctx.lineTo(bx-4,by); ctx.fill();
        ctx.globalAlpha=1;
      }
      // stalactites hanging from the ceiling (near parallax)
      ctx.fillStyle=P.stalactite;
      for (let x=0;x<=W+40;x+=40){
        const wx = x - wrap(camX*0.7, 40);
        const h = 18 + rnd(Math.floor((x+camX*0.7)/40))*34;
        ctx.beginPath(); ctx.moveTo(wx,0); ctx.lineTo(wx+10,0); ctx.lineTo(wx+5,h); ctx.fill();
      }
      // floating dust motes
      ctx.fillStyle=P.dust;
      for (let i=0;i<26;i++){
        const dx = (i*61 - camX*0.6) % W; const fx = dx<0?dx+W:dx;
        const dy = (i*47 + Date.now()*0.012*(1+i%3)) % H;
        ctx.globalAlpha = 0.3+0.3*Math.sin(Date.now()/500+i);
        ctx.fillRect(fx, dy, 2, 2);
      }
      ctx.globalAlpha=1;
    },
    // dark rock with a glinting crystal vein, mossy cap on platforms
    drawTile(s, x, y){
      const P = this.palette;
      ctx.fillStyle = s.type==="brick" ? P.brick : P.plat;
      ctx.fillRect(x,y,TILE,TILE);
      ctx.fillStyle=P.mortar; ctx.fillRect(x,y+TILE/2,TILE,1); ctx.fillRect(x+TILE/2,y,1,TILE);
      ctx.fillStyle = s.type==="plat" ? P.capPlat : P.capBrick; // top edge / cap
      ctx.fillRect(x,y,TILE,3);
      // tiny crystal glints, deterministic per tile
      const seed = (s.x*7 + s.y*13) % 5;
      if (seed===0){ ctx.fillStyle=P.glintA; ctx.fillRect(x+6,y+12,3,3); }
      if (seed===2){ ctx.fillStyle=P.glintB; ctx.fillRect(x+15,y+15,3,3); }
    },
    // glowing gem
    drawCoin(c, x, y){
      const P = this.palette;
      ctx.globalAlpha=0.35; ctx.fillStyle=P.gemGlow;
      ctx.beginPath(); ctx.arc(x,y,8,0,7); ctx.fill(); ctx.globalAlpha=1;
      ctx.fillStyle=P.gem;
      ctx.beginPath(); ctx.moveTo(x,y-6); ctx.lineTo(x+5,y); ctx.lineTo(x,y+6); ctx.lineTo(x-5,y); ctx.fill();
      ctx.fillStyle=P.gemShine;
      ctx.beginPath(); ctx.moveTo(x,y-6); ctx.lineTo(x+2,y-1); ctx.lineTo(x-2,y-1); ctx.fill();
    },
  },

  // moonlit castle: night sky, far towers with lit windows, a near curtain
  // wall with arched windows, flickering torches and hanging banners
  castle: {
    palette: {
      skyTop:"#120e2a", skyBot:"#3b2c5e", star:"#fff6d8",
      moon:"#f4ecc8", moonShade:"#d9cf9f",
      farTower:"#231c3d", window:"#ffcf6b",
      nearWall:"#2e2747", nearMortar:"#262040", arch:"#120e22",
      torchPole:"#4a3a2a", flameOut:"#ff6a1a", flameIn:"#ffd23d", torchGlow:"rgba(255,170,60,.18)",
      banner:"#a8233a", bannerTrim:"#ffcf3d",
      stone:"#6d6a7c", stoneMortar:"#4c4a5a", stoneTop:"#8d8a9e", stoneShade:"rgba(0,0,0,.18)",
      plank:"#7a4f2a", plankLine:"#5a3818", plankTop:"#9a6a3c", bolt:"#3a3a44",
      coin:"#ffcf3d", coinShine:"#fff4b8", coinJewel:"#e2233f",
    },
    drawBackground(camX){
      const P = this.palette;
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,P.skyTop); g.addColorStop(1,P.skyBot);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      // twinkling stars
      ctx.fillStyle=P.star;
      for (let i=0;i<34;i++){
        ctx.globalAlpha = 0.35 + 0.35*Math.sin(Date.now()/420 + i*1.7);
        const sx = wrap(i*97 - camX*0.05, W), sy = 8 + (i*41)%110;
        ctx.fillRect(sx, sy, i%5===0?2:1, i%5===0?2:1);
      }
      ctx.globalAlpha=1;
      // big moon (barely drifts)
      const mx = W*0.78 - camX*0.02, my = 52;
      ctx.fillStyle=P.moon; ctx.beginPath(); ctx.arc(mx,my,24,0,7); ctx.fill();
      ctx.fillStyle=P.moonShade;
      ctx.beginPath(); ctx.arc(mx-8,my-5,5,0,7); ctx.fill();
      ctx.beginPath(); ctx.arc(mx+7,my+8,4,0,7); ctx.fill();
      // far towers with crenellations and lit windows (slow parallax)
      const span = 150;
      for (let i=-1;i<W/span+2;i++){
        const n = Math.floor(camX*0.25/span) + i;
        const tx = i*span - wrap(camX*0.25, span) + rnd(n)*40;
        const th = 90 + rnd(n+7)*70, tw = 34 + rnd(n+3)*16, top = H-26-th;
        ctx.fillStyle=P.farTower;
        ctx.fillRect(tx, top, tw, th+26);
        for (let c=0;c<tw;c+=10) ctx.fillRect(tx+c, top-7, 6, 7);          // merlons
        ctx.fillStyle=P.window;
        ctx.globalAlpha = 0.7 + 0.3*Math.sin(Date.now()/700 + n);
        ctx.fillRect(tx+tw/2-2, top+16, 4, 7);
        if (th > 120) ctx.fillRect(tx+tw/2-2, top+44, 4, 7);
        ctx.globalAlpha=1;
      }
      // near curtain wall: stone courses, arched windows, torches, banners
      const wallTop = 150, bay = 120;
      ctx.fillStyle=P.nearWall; ctx.fillRect(0, wallTop, W, H-wallTop);
      ctx.fillStyle=P.nearMortar;
      for (let yy=wallTop+14; yy<H; yy+=14) ctx.fillRect(0, yy, W, 1);
      for (let i=-1;i<W/bay+2;i++){
        const bx = i*bay - wrap(camX*0.6, bay);
        const n = Math.floor(camX*0.6/bay) + i;
        // merlons along the top of the near wall
        ctx.fillStyle=P.nearWall;
        ctx.fillRect(bx, wallTop-10, 18, 10); ctx.fillRect(bx+40, wallTop-10, 18, 10); ctx.fillRect(bx+80, wallTop-10, 18, 10);
        // arched window
        ctx.fillStyle=P.arch;
        ctx.fillRect(bx+50, wallTop+22, 16, 22);
        ctx.beginPath(); ctx.arc(bx+58, wallTop+22, 8, Math.PI, 0); ctx.fill();
        // alternate a banner and a torch per bay
        if (n % 2 === 0){
          ctx.fillStyle=P.banner; ctx.fillRect(bx+12, wallTop+6, 16, 34);
          ctx.beginPath(); ctx.moveTo(bx+12,wallTop+40); ctx.lineTo(bx+20,wallTop+34); ctx.lineTo(bx+28,wallTop+40); ctx.fill();
          ctx.fillStyle=P.bannerTrim; ctx.fillRect(bx+12, wallTop+6, 16, 2); ctx.fillRect(bx+18, wallTop+16, 4, 4);
        } else {
          const fl = Math.sin(Date.now()/90 + n*3);
          ctx.fillStyle=P.torchGlow; ctx.beginPath(); ctx.arc(bx+20, wallTop+22, 18+fl*2, 0, 7); ctx.fill();
          ctx.fillStyle=P.torchPole; ctx.fillRect(bx+18, wallTop+24, 4, 14);
          ctx.fillStyle=P.flameOut; ctx.fillRect(bx+16, wallTop+15-fl, 8, 9+fl);
          ctx.fillStyle=P.flameIn;  ctx.fillRect(bx+18, wallTop+19-fl, 4, 5+fl);
        }
      }
    },
    // grey stone blocks; wooden plank ledges with iron bolts
    drawTile(s, x, y){
      const P = this.palette;
      if (s.type==="brick"){
        ctx.fillStyle=P.stone; ctx.fillRect(x,y,TILE,TILE);
        ctx.fillStyle=P.stoneMortar;
        ctx.fillRect(x,y+TILE/2-1,TILE,2);
        const odd = (s.y/TILE)%2;                             // staggered joints
        ctx.fillRect(x+(odd?0:TILE/2-1), y, 2, TILE/2);
        ctx.fillRect(x+(odd?TILE/2-1:0), y+TILE/2, 2, TILE/2);
        ctx.fillStyle=P.stoneTop; ctx.fillRect(x,y,TILE,2);
        ctx.fillStyle=P.stoneShade; ctx.fillRect(x,y+TILE-2,TILE,2);
      } else {
        ctx.fillStyle=P.plank; ctx.fillRect(x,y,TILE,TILE-8);
        ctx.fillStyle=P.plankTop; ctx.fillRect(x,y,TILE,3);
        ctx.fillStyle=P.plankLine; ctx.fillRect(x,y+8,TILE,1); ctx.fillRect(x+TILE-1,y,1,TILE-8);
        ctx.fillStyle=P.bolt; ctx.fillRect(x+3,y+4,2,2); ctx.fillRect(x+TILE-6,y+11,2,2);
      }
    },
    // spinning gold coin set with a ruby
    drawCoin(c, x, y){
      const P = this.palette;
      const wob = Math.abs(Math.cos(c.t))*4+2;
      ctx.fillStyle=P.coin;
      ctx.beginPath(); ctx.ellipse(x,y,wob,7,0,0,7); ctx.fill();
      ctx.fillStyle=P.coinShine;
      ctx.beginPath(); ctx.ellipse(x-1,y-2,Math.max(1,wob-3),3,0,0,7); ctx.fill();
      if (wob > 3){ ctx.fillStyle=P.coinJewel; ctx.fillRect(x-1,y,2,3); }
    },
  },
};

// shared puffy-cloud shape (surface background)
function themeCloud(x,y){
  ctx.beginPath();
  ctx.arc(x,y,14,0,7); ctx.arc(x+16,y+4,18,0,7); ctx.arc(x+36,y,14,0,7);
  ctx.rect(x,y,36,16); ctx.fill();
}
