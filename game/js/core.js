// core.js — canvas/view setup, the ONE mutable state bag G, and the tiny
// helpers every system shares. No game rules live here.
"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// The backing store is 2× the logical 480×270 resolution: the world still
// renders on the same chunky pixel grid, but sprites drawn in half-pixel
// steps (the hero) get 4× the detail. All game code works in logical px.
const SS = 2;
const W = canvas.width / SS, H = canvas.height / SS;
ctx.scale(SS, SS);
ctx.imageSmoothingEnabled = false;

const TILE = TUNE.view.tile, ROWS = TUNE.view.rows;
const GROUND_TOP = (ROWS - 2) * TILE;   // y of the floor surface

// ---------- G — the single mutable state bag ----------
// Everything that changes during play lives here; `grep "G\."` maps the
// whole mutable surface. Ownership conventions are in ARCHITECTURE.md
// (short version: flow.js owns the lifecycle fields, level-loader.js resets
// the entity arrays, and each system file mutates only its own array).
const G = {
  state: "intro",            // intro | menu | play | levelclear | over | win
  levelIndex: 0,
  levelStartScore: 0,        // score rewinds here on a level retry
  score: 0,
  lives: TUNE.lives,
  msg: "", msgT: 0,          // HUD flash message
  introMs: 0,                // cutscene clock

  player: null,
  cam: { x: 0, y: 0 },
  checkpoint: null,          // current respawn point
  theme: null,               // resolved THEMES entry for the current level

  flag: null,
  boss: null, bossStarted: false,

  // entity arrays — reset by buildLevel(), each mutated by its own system
  solids: [], barriers: [], hazards: [], checkpoints: [],
  coins: [], powerups: [], enemies: [],
  fireballs: [], flames: [], particles: [],

  cols: 0, levelW: 0, levelH: 0,
};

// ---------- shared helpers ----------
function clamp01(v){ return Math.max(0, Math.min(1, v)); }
// wrap a parallax x into the visible band so layers scroll & repeat seamlessly
function wrap(x, span){ return ((x % span) + span) % span; }
// deterministic pseudo-random so procedural scenery is stable while scrolling
function rnd(n){ const s = Math.sin(n * 127.1) * 43758.5; return s - Math.floor(s); }

// world → screen (camera space, snapped to the logical pixel grid)
function px(x){ return Math.round(x - G.cam.x); }
function py(y){ return Math.round(y - G.cam.y); }

function aabb(a, b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

// axis-separated tile collision against G.solids; sets o.onGround
function moveAndCollide(o){
  // X axis
  o.x += o.vx;
  for (const s of G.solids){
    if (aabb(o, s)){
      if (o.vx > 0) o.x = s.x - o.w;
      else if (o.vx < 0) o.x = s.x + s.w;
      o.vx = 0;
    }
  }
  // Y axis
  o.y += o.vy;
  o.onGround = false;
  for (const s of G.solids){
    if (aabb(o, s)){
      if (o.vy > 0){ o.y = s.y - o.h; o.onGround = true; }
      else if (o.vy < 0){ o.y = s.y + s.h; }
      o.vy = 0;
    }
  }
}

function addScore(n, flash){ G.score += n; if (flash) msgFlash(flash); }
function msgFlash(t){ G.msg = t; G.msgT = 45; }
