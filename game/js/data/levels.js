// data/levels.js — the levels. Each level is a 12-row character grid built
// with set()/fill() so columns stay perfectly aligned, plus a LEVELS entry
// naming its theme (themes.js) and music track (data/tracks.js).
//
// Tile legend (built-ins + every registry `tile` char; the loader assembles
// it automatically, and the DEV validator flags any unknown char):
//   #  ground/brick      =  platform         X  boss gate barrier
//   ^  spikes            K  checkpoint post  C  coin/gem
//   F  exit flag         P  player spawn
//   E  zerox dog         G  fire-spitting guinea pig     (enemies.js)
//   U  potato man        H  hot (fire-spitting) potato man
//   Y  evil mini French fry (chases you)
//   S  speed  J  high-jump  V  star  R  fire-breath      (powerups.js)
//   B  Zerox boss  T  Skeleton Lord  Q  Potato Monster   (bosses.js)
//
// Adding a level = write a build fn + push one LEVELS entry (optional
// arrive/arriveBtn = the level-clear screen's call-to-action INTO it). Row 10 & 11
// are the usual floor; GROUND_TOP is row 10's surface.
"use strict";

function makeGrid(w){
  const g = Array.from({length:ROWS}, () => Array(w).fill(" "));
  return {
    g,
    set:  (r,c,ch) => { if (g[r] && c>=0 && c<w) g[r][c] = ch; },
    fill: (r,c1,c2,ch) => { for (let c=c1;c<=c2;c++) if (g[r]&&c>=0&&c<w) g[r][c]=ch; },
    rows: () => g.map(row => row.join(""))
  };
}

// Level 1 — surface run ending in the giant Zerox boss.
function buildSurface(){
  const W2 = 130, { set, fill, rows } = makeGrid(W2);
  fill(10,0,W2-1,"#"); fill(11,0,W2-1,"#");
  set(9,3,"P");
  set(9,14,"E"); set(9,34,"E"); set(9,52,"E"); set(9,70,"E");
  fill(7,8,11,"=");  set(6,9,"C"); set(6,10,"C");
  fill(8,16,20,"="); set(7,18,"S");
  fill(6,24,28,"="); set(5,25,"C"); set(5,26,"C"); set(5,27,"C");
  fill(7,32,36,"=");
  fill(7,38,42,"="); set(6,40,"J");
  fill(5,46,50,"="); set(4,47,"C"); set(4,48,"C");
  fill(4,54,58,"="); set(3,56,"V");
  fill(6,60,66,"="); set(5,62,"C"); set(5,64,"C");
  set(9,50,"G");                                   // fire-spitting guinea pig
  fill(7,72,76,"=");
  fill(6,92,95,"=");  fill(6,108,111,"=");
  set(4,98,"C"); set(4,100,"C"); set(4,102,"C");
  set(6,100,"B");
  for (let r=0;r<=9;r++) set(r,120,"X");
  set(7,126,"F");
  return rows();
}

// Level 2 — THE UNDERDEPTHS: a cave with pits, spikes, gems and crystals,
// ending in the Skeleton Lord's arena.
function buildCave(){
  const W2 = 158, { set, fill, rows } = makeGrid(W2);
  fill(10,0,W2-1,"#"); fill(11,0,W2-1,"#");      // floor, then carve pits
  const pit = (c1,c2) => { fill(10,c1,c2," "); fill(11,c1,c2," "); };
  pit(18,20); pit(40,43); pit(70,73); pit(100,103); pit(122,124);
  set(9,3,"P");
  // opening descent
  fill(6,7,10,"="); set(5,8,"C"); set(5,9,"C");
  set(9,14,"E");
  // pit 18-20 — short leap, gems hover near it
  set(7,18,"C"); set(7,19,"C");
  fill(7,24,27,"="); set(6,25,"S"); set(6,27,"R"); // speed boost + fire breath
  // small spike strip (easy to clear)
  fill(9,31,32,"^"); set(6,30,"C"); set(6,35,"C");
  fill(6,30,30,"="); fill(6,35,35,"=");
  set(9,37,"G");                                   // guinea pig guarding the run
  set(9,46,"E");
  // pit 40-43 with a mid stepping stone
  fill(8,41,42,"="); set(7,42,"C");
  // rising rock steps
  fill(8,52,55,"="); fill(6,58,61,"="); set(5,58,"R"); set(5,59,"C"); set(5,60,"C");
  fill(7,64,67,"="); set(6,65,"J");               // high-jump on a ledge
  set(9,69,"E");
  // pit 70-73 with a mid stepping stone, gems above
  fill(8,71,72,"="); set(5,71,"C"); set(5,72,"C");
  fill(6,77,82,"="); set(5,79,"V");               // invincibility before spikes
  // --- HALFWAY CHECKPOINT ---
  set(9,78,"K");
  // short spike strip with rock caps to hop
  fill(9,86,88,"^"); fill(6,85,85,"="); fill(6,89,90,"=");
  set(5,86,"C"); set(5,90,"C");
  set(9,95,"E");
  // pit 100-103 with a stepping stone
  fill(8,100,101,"="); set(7,102,"C");
  // descent to the depths + gems
  fill(6,108,112,"="); set(5,109,"C"); set(5,110,"C"); set(5,111,"C"); set(5,112,"R");
  set(9,106,"G");                                  // guinea pig in the depths
  set(9,113,"E");
  fill(8,114,117,"=");
  // final short spike strip, then the gateway pit 122-124
  fill(9,118,119,"^");
  // --- skeleton boss arena (cols 126..146) ---
  fill(7,126,129,"="); set(6,127,"C"); set(6,129,"R"); // last fire top-up
  set(6,138,"T");                                   // Skeleton Lord spawn
  for (let r=0;r<=9;r++) set(r,148,"X");            // gate to the flag
  set(7,153,"F");
  return rows();
}

// Level 3 — SPUDSWORTH CASTLE: courtyard, moat, gatehouse, great hall,
// battlements and a tower, then the Potato Monster's throne room. Here the
// Zerox dogs and fire guinea pigs are little potato men (U / H).
function buildCastle(){
  const W2 = 178, { set, fill, rows } = makeGrid(W2);
  fill(10,0,W2-1,"#"); fill(11,0,W2-1,"#");
  const pit = (c1,c2) => { fill(10,c1,c2," "); fill(11,c1,c2," "); };
  const wall = (c, rTop) => { for (let r=rTop;r<=9;r++) set(r,c,"#"); };
  set(9,3,"P");
  // --- courtyard ---
  fill(7,7,10,"="); set(6,8,"C"); set(6,9,"C");
  set(9,13,"U");
  fill(7,16,18,"="); set(6,17,"S");
  set(9,21,"H");                                    // hot potato on guard
  wall(25,8); wall(26,8); set(7,25,"C"); set(7,26,"C");
  // --- the moat (one plank to hop on) ---
  pit(30,34); fill(8,32,32,"="); set(6,32,"C");
  // --- gatehouse ---
  set(9,38,"U");
  fill(9,42,43,"^"); fill(6,41,44,"="); set(5,42,"R"); set(5,44,"C");
  set(9,47,"U");
  wall(50,7); wall(51,7); set(6,51,"H");            // hot potato turret on the wall
  fill(7,54,57,"="); set(6,55,"C"); set(6,56,"C");
  // --- great hall: a grand staircase over a spike pit ---
  fill(8,61,63,"="); fill(6,65,67,"="); fill(4,69,71,"=");
  fill(9,64,68,"^");
  set(3,69,"C"); set(3,70,"V"); set(3,71,"C");
  fill(6,73,75,"="); set(5,74,"C");
  set(8,77,"J");
  set(9,79,"H"); set(9,82,"U");
  fill(8,83,84,"="); wall(86,6); set(5,86,"C");
  // --- HALFWAY CHECKPOINT ---
  set(9,90,"K");
  // --- battlements: gaps, merlons, scurrying fries ---
  pit(94,96); set(7,95,"C");
  set(9,99,"#"); set(9,102,"#"); set(9,105,"#");     // merlon bumps
  set(9,103,"U");
  set(9,108,"Y");                                    // a fry scout — a taste of what's coming
  pit(110,112); set(6,111,"C");
  // --- the tower (step up from the plank) ---
  fill(7,115,116,"="); wall(118,5); wall(119,5);
  set(4,118,"C"); set(4,119,"C");
  set(9,123,"H");
  fill(7,125,127,"="); set(6,126,"R");
  fill(9,129,130,"^");
  set(9,133,"U");
  // --- throne room approach ---
  fill(7,135,137,"="); set(6,135,"C"); set(6,136,"R"); set(6,137,"C");
  // --- Potato Monster arena (cols ~141..165): two planks to dodge fries on ---
  fill(7,145,147,"="); fill(7,158,160,"=");
  set(6,153,"Q");                                    // Potato Monster spawn
  for (let r=0;r<=9;r++) set(r,166,"X");             // gate to the final flag
  set(7,172,"F");
  return rows();
}

const LEVELS = [
  { id:"surface", name:"SUNRISE RUN",     theme:"surface", track:"main", build:buildSurface },
  { id:"cave",    name:"THE UNDERDEPTHS", theme:"cave",    track:"cave", build:buildCave,
    arrive:"Descend!", arriveBtn:"DESCEND ▼" },
  { id:"castle",  name:"SPUDSWORTH CASTLE", theme:"castle", track:"castle", build:buildCastle,
    arrive:"Storm the castle!", arriveBtn:"STORM THE CASTLE ▲" },
];
