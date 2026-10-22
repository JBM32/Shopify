// enemies.js — one registry entry per enemy kind, colocating its stats
// hookup, spawn, update AND draw. Adding an enemy = add one entry here
// (reuse the shared helpers below!), put its numbers in TUNE.enemies, and
// stamp its tile char into a level. Nothing else to wire up.
//   tile     — the level-grid character that spawns it (must be unique)
//   spawn(x,y) — returns the entity ({kind, x,y,w,h, vx,vy, alive, ...})
//   update(e)  — one frame of behaviour (gravity, movement, player contact)
//   draw(e)    — its sprite
// The registry key === e.kind === the grep key for everything about it.
"use strict";

// ---- shared helpers: keep these the path of least resistance ------------

// gravity with terminal velocity
function enemyGravity(e){
  e.vy += TUNE.physics.grav; if (e.vy > TUNE.physics.maxFall) e.vy = TUNE.physics.maxFall;
}

// vertical landing on solids (enemies never head-bonk, matching the original)
function enemyLand(e){
  e.y += e.vy;
  for (const s of G.solids){ if (aabb(e,s)){ if(e.vy>0){e.y=s.y-e.h;} e.vy=0; } }
}

// horizontal patrol that turns at walls and at ledges
function walkAndPatrol(e){
  e.x += e.vx;
  let hit=false;
  for (const s of G.solids){ if (aabb(e,s)){ e.x -= e.vx; e.vx*=-1; hit=true; break; } }
  if (!hit){
    // turn at ledges
    const aheadX = e.vx>0 ? e.x+e.w+1 : e.x-1;
    const footY = e.y+e.h+1;
    let ground=false;
    for (const s of G.solids){ if (aheadX>=s.x&&aheadX<=s.x+s.w&&footY>=s.y&&footY<=s.y+s.h){ground=true;break;} }
    if (!ground) e.vx*=-1;
  }
  enemyLand(e);
}

// kill + score + burst; bounce/msg are the caller's call (they differ by kind)
function killEnemy(e, burstColor){
  e.alive = false;
  addScore(TUNE.score.enemy);
  spawnParticles(e.x+e.w/2, e.y, burstColor, 10);
  sfx.stomp();
}

// is the player coming down on top of e?
function isStomping(p, e){
  return p.vy>0 && (p.y+p.h) - e.y < TUNE.enemies.stompWindow;
}

// spawn an enemy mid-level (e.g. a boss launching minions); extra fields
// override the kind's spawn defaults. The only way outside code adds to G.enemies.
function spawnEnemy(kind, x, y, extra){
  const e = Object.assign(ENEMIES[kind].spawn(x, y), extra);
  G.enemies.push(e);
  return e;
}

// ---- the registry --------------------------------------------------------

const ENEMIES = {

  // Zerox — tailless dog, patrols and turns at walls/ledges. Stompable.
  zerox: {
    tile:"E", colors: DOG_COLORS, burst:"#ff5d5d",
    spawn(x, y){
      return { kind:"zerox", x:x+3, y:y+2, w:TILE-6, h:TILE-4,
               vx:-TUNE.enemies.zerox.speed, vy:0, alive:true };
    },
    update(e){
      const p = G.player;
      enemyGravity(e);
      walkAndPatrol(e);
      if (aabb(p,e)){
        if (p.starT>0){ killEnemy(e, this.burst); }                    // star: mow through (no msg)
        else if (isStomping(p,e)){
          killEnemy(e, this.burst); p.vy = -TUNE.player.stompBounce;
          msgFlash("+"+TUNE.score.enemy);
        } else damage(false);
      }
    },
    draw(e){
      const face = e.vx<0 ? -1 : 1;
      drawSpriteAt(ph => drawDogSprite(ph, this.colors),
                   face<0 ? px(e.x)+e.w : px(e.x), py(e.y), 1, face, Date.now()/120);
    },
  },

  // Guinea pig — stays put, faces the player, and spits fireballs.
  guinea: {
    tile:"G", burst:"#ffae3d",
    spawn(x, y){
      const T = TUNE.enemies.guinea;
      return { kind:"guinea", x:x+3, y:y+2, w:TILE-6, h:TILE-4, vx:0, vy:0,
               alive:true, face:-1, fireT: T.firstMin + Math.floor(Math.random()*T.firstRand) };
    },
    update(e){
      const p = G.player, T = TUNE.enemies.guinea;
      enemyGravity(e);
      e.face = p.x < e.x ? -1 : 1;
      enemyLand(e);
      e.fireT--;
      const inView = e.x > G.cam.x-T.viewPad && e.x < G.cam.x+W+T.viewPad;
      const dy = Math.abs((p.y+p.h/2)-(e.y+e.h/2));
      if (e.fireT<=0 && inView && dy < T.dyRange){
        spawnFireball(e.x+e.w/2+e.face*9, e.y+5, e.face*T.fireVX, T.fireVY, T.fireLife);
        e.fireT = T.cadenceMin + Math.floor(Math.random()*T.cadenceRand);
        sfx.fire();
      }
      if (aabb(p,e)){
        if (p.starT>0 || isStomping(p,e)){
          const stomped = isStomping(p,e);
          killEnemy(e, this.burst);
          if (stomped) p.vy = -TUNE.player.stompBounce;
          msgFlash("+"+TUNE.score.enemy);                              // (star kill flashes too — original quirk)
        } else damage(false);
      }
    },
    draw(e){
      const x=px(e.x), y=py(e.y), w=e.w, h=e.h, dir=e.face<0?-1:1;
      ctx.save();
      ctx.translate(x+w/2,0); ctx.scale(dir,1); ctx.translate(-(x+w/2),0);
      ctx.fillStyle="#000"; ctx.fillRect(x-1,y+3,w+2,h-1);        // outline
      ctx.fillStyle="#a9763f"; ctx.fillRect(x,y+4,w,h-4);          // chubby brown body
      ctx.fillStyle="#000"; ctx.fillRect(x,y+4,2,2); ctx.fillRect(x+w-2,y+4,2,2); // rounded corners
      ctx.fillStyle="#d98f3a"; ctx.fillRect(x+2,y+5,7,6);          // ginger patch
      ctx.fillStyle="#f3ead8"; ctx.fillRect(x+w-9,y+8,9,h-9);      // white face/belly
      ctx.fillStyle="#8a5e30"; ctx.fillRect(x+w-12,y+3,3,2); ctx.fillRect(x+w-7,y+2,3,3); // ears
      ctx.fillStyle="#1a1a1a"; ctx.fillRect(x+w-6,y+9,2,2);        // eye
      ctx.fillStyle="#ff9a9a"; ctx.fillRect(x+w-1,y+12,2,2);       // nose/mouth
      ctx.fillStyle="#6b4420"; ctx.fillRect(x+2,y+h,3,2); ctx.fillRect(x+w-6,y+h,3,2); // feet
      if (e.fireT < 16){ ctx.fillStyle="rgba(255,150,40,.9)"; ctx.fillRect(x+w,y+11,4,4); } // charging spark
      ctx.restore();
    },
  },

  // Spud — the castle's potato man. Zerox behaviour, potato body.
  spud: {
    tile:"U", colors: POTATO_COLORS, burst:"#c79a5b",
    spawn(x, y){ return { ...ENEMIES.zerox.spawn(x, y), kind:"spud" }; },
    update(e){ ENEMIES.zerox.update.call(this, e); },
    draw(e){
      const face = e.vx<0 ? -1 : 1;
      drawSpriteAt(ph => drawPotatoSprite(ph, this.colors, 0),
                   face<0 ? px(e.x)+e.w : px(e.x), py(e.y), 1, face, Date.now()/140);
    },
  },

  // Hot spud — a red-hot potato man. Fire guinea pig behaviour: sits tight,
  // faces the player, spits fireballs.
  hotspud: {
    tile:"H", colors: HOT_POTATO_COLORS, burst:"#ff7a1a",
    spawn(x, y){ return { ...ENEMIES.guinea.spawn(x, y), kind:"hotspud" }; },
    update(e){ ENEMIES.guinea.update.call(this, e); },
    draw(e){
      const face = e.face<0 ? -1 : 1, charge = e.fireT < 16 ? 1 : 0;
      drawSpriteAt(ph => drawPotatoSprite(ph, this.colors, charge),
                   face<0 ? px(e.x)+e.w : px(e.x), py(e.y), 1, face, Date.now()/400);
    },
  },

  // Fry — an evil mini French fry that scurries straight at the player.
  // The Potato Monster spews these (minion:true, launched with air:true);
  // minions crumble when their life runs out or the boss falls.
  fry: {
    tile:"Y", burst:"#ffd23d",
    spawn(x, y){
      const T = TUNE.enemies.fry;
      return { kind:"fry", x:x+8, y:y+TILE-FRY_H-3, w:FRY_W+1, h:FRY_H, vx:-T.speed, vy:0,
               alive:true, air:false, minion:false, life:Infinity, turnT:0,
               spdMul: 1 + (Math.random()-0.5)*T.speedVar };            // so a swarm spreads out
    },
    update(e){
      const p = G.player, T = TUNE.enemies.fry;
      if (e.minion && (--e.life <= 0 || !G.boss || !G.boss.alive)){   // crumble
        e.alive = false; spawnParticles(e.x+e.w/2, e.y+e.h/2, this.burst, 5); return;
      }
      enemyGravity(e);
      if (e.air){
        // launched in an arc: fly, bounce off walls, start running on landing
        e.x += e.vx;
        for (const s of G.solids){ if (aabb(e,s)){ e.x -= e.vx; e.vx *= -1; break; } }
        enemyLand(e);
        if (e.vy === 0){ e.air = false; e.vx = Math.sign(e.vx||1)*T.speed*e.spdMul; }
      } else {
        // chase: re-aim at the player after a short reaction delay
        const want = p.x+p.w/2 < e.x+e.w/2 ? -1 : 1;
        if (Math.abs(p.x-e.x) < T.chaseRange && Math.sign(e.vx) !== want && --e.turnT <= 0){
          e.vx = want*T.speed*e.spdMul; e.turnT = T.turnDelay;
        }
        walkAndPatrol(e);
      }
      if (aabb(p,e)){
        if (p.starT>0){ killEnemy(e, this.burst); }
        else if (isStomping(p,e)){
          killEnemy(e, this.burst); p.vy = -TUNE.player.stompBounce;
          msgFlash("+"+TUNE.score.enemy);
        } else damage(false);
      }
    },
    draw(e){
      const face = e.vx<0 ? -1 : 1;
      drawSpriteAt(drawFrySprite, face<0 ? px(e.x)+e.w : px(e.x), py(e.y), 1, face, Date.now()/55);
    },
  },
};

function updateEnemies(){
  for (const e of G.enemies){
    if (!e.alive) continue;
    ENEMIES[e.kind].update(e);
  }
  // drop dead boss minions so long fights don't grow the array forever
  if (G.enemies.some(e => !e.alive && e.minion)) G.enemies = G.enemies.filter(e => e.alive || !e.minion);
}

function drawEnemies(){
  for (const e of G.enemies){
    if (!e.alive) continue;
    ENEMIES[e.kind].draw(e);
  }
}
