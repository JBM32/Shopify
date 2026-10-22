// tuning.js — every gameplay number in one place. Pure data, no logic.
// Read these INSIDE functions (never copy them into registry entries at
// load time) so an edit here — or a live tweak via PD.TUNE in the console —
// always takes effect.
"use strict";

const TUNE = {
  view: { tile: 24, rows: 12 },

  physics: {
    grav: 0.55,        // per-frame gravity for player and enemies
    move: 0.7,         // player run acceleration
    friction: 0.8,     // vx multiplier when no key is held
    maxVX: 4.2,        // player top speed
    jump: 11,          // jump launch speed
    maxFall: 14,       // terminal fall speed (player + enemies)
    varJumpCap: 4,     // releasing jump caps upward speed here (variable jump)
  },

  player: {
    w: 16, h: 22,      // hitbox (the sprite overdraws it)
    hurtFrames: 90,    // i-frames + blink after taking a hit
    stompBounce: 8,    // upward speed after stomping an enemy
    fallPad: 60,       // how far below the level bottom counts as falling out
  },

  score: {
    coin: 10,
    enemy: 50,         // any enemy kill (stomp, star, or flame)
    bossHit: 100,      // stomping a boss
    bossFlameHit: 50,  // hitting a boss with fire breath
    bossDefeat: 300,
    lifeBonus: 100,    // per remaining life on the win screen
  },

  lives: 3,

  powerups: {
    speed: { duration: 60 * 8, accelMult: 1.5, maxMult: 1.45 },
    jump:  { duration: 60 * 8, jumpMult: 1.3 },
    star:  { duration: 60 * 7 },
    fire:  { charges: 5, cooldown: 18, speed: 4.6, life: 42 },
  },

  enemies: {
    stompWindow: 14,   // max px the player's feet may overlap to count as a stomp
    zerox:  { speed: 0.9 },
    guinea: {
      firstMin: 60, firstRand: 60,     // frames before the first fireball
      cadenceMin: 95, cadenceRand: 45, // frames between fireballs
      fireVX: 3.1, fireVY: -1.3, fireLife: 170,
      dyRange: 60,                     // only fires when the player is this close vertically
      viewPad: 30,                     // only fires when on (or near) screen
    },
    // (spud = zerox numbers, hotspud = guinea numbers — same behaviours, potato bodies)
    fry: {
      speed: 1.9,        // scurry speed — faster than you'd like
      speedVar: 0.45,    // each fry gets ±half this as a speed multiplier (swarm spreads)
      chaseRange: 320,   // px: re-aims at the player within this distance
      turnDelay: 14,     // frames before a fry can re-aim (lets you jump over it)
    },
  },

  projectiles: {
    fireballGrav: 0.05, // arc on enemy fireballs
  },

  bosses: {
    zerox: {
      w: 72, h: 80, maxHits: 3, arenaTiles: 12,
      speedBase: 0.7, speedPerHit: 0.25, // prowl speed grows as it gets hurt
      stompWindow: 34, hitCooldown: 45,  // grace so one stomp = one hit
      bounce: 11,                        // player bounce after a boss stomp
    },
    skeleton: {
      w: 60, h: 90, maxHits: 6, arenaTiles: 10,
      speedBase: 0.4, speedPerHit: 0.08,
      fireCadence: 95, cadencePerHit: 7, cadenceMin: 55,
      fireSpeed: 2.9, fireLift: -1.1, fireLife: 210,
      contactCooldown: 30,
    },
    potato: {
      w: 70, h: 64, maxHits: 6, arenaTiles: 12,
      speedBase: 0.55, speedPerHit: 0.12,
      stompWindow: 30, hitCooldown: 45, bounce: 11,  // stompable like Zerox...
      // ...and fire breath works too (both count toward maxHits)
      firstVolley: 80,                    // frames after the fight starts
      cadence: 170, cadencePerHit: 14, cadenceMin: 95, // frames between fry volleys
      windup: 34,                         // frames it quivers, mouth agape, before spewing
      volleyBase: 3, volleyPerHit: 0.5,   // fries per volley (grows as it gets hurt)
      maxFries: 9,                        // live minion cap
      fryVX: 1.2, fryVXRand: 2.4,         // launch speed range
      fryVY: 4.5, fryVYRand: 3,
      backFryChance: 0.3,                 // share of fries flung behind it (pincer!)
      fryLife: 60 * 9,                    // minion fries crumble after this
      hopFromHit: 3,                      // from this many hits it hops after every 2nd volley
      hopVY: 9.5, hopSpeedMult: 3.2,
    },
  },
};
