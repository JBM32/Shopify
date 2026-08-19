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
};

// shared puffy-cloud shape (surface background)
function themeCloud(x,y){
  ctx.beginPath();
  ctx.arc(x,y,14,0,7); ctx.arc(x+16,y+4,18,0,7); ctx.arc(x+36,y,14,0,7);
  ctx.rect(x,y,36,16); ctx.fill();
}
