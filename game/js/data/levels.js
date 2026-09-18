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
//   S  speed  J  high-jump  V  star  R  fire-breath      (powerups.js)
//   B  Zerox boss        T  Skeleton Lord                (bosses.js)
//
// Adding a level = write a build fn + push one LEVELS entry. Row 10 & 11
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

const LEVELS = [
  { id:"surface", name:"SUNRISE RUN",     theme:"surface", track:"main", build:buildSurface },
  { id:"cave",    name:"THE UNDERDEPTHS", theme:"cave",    track:"cave", build:buildCave },
];
