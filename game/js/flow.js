// flow.js — the game-state machine and the DOM overlay (menu / level clear /
// game over / win). This file OWNS every G.state transition and the
// score/lives lifecycle; nothing else should write those fields.
"use strict";

const overlay = document.getElementById("overlay");
const ovTitle = document.getElementById("ov-title");
const ovText = document.getElementById("ov-text");
const ovBtn = document.getElementById("ov-btn");

function showOverlay(title, text, btn){
  ovTitle.textContent = title; ovText.textContent = text; ovBtn.textContent = btn;
  overlay.classList.remove("hidden");
}
function hideOverlay(){ overlay.classList.add("hidden"); }

const MENU_TEXT = "Play as Three Tails, the three-tailed cat! LEVEL 1: dash the surface and stomp the giant ZEROX BOSS 3 times. LEVEL 2 — THE UNDERDEPTHS: collect 🔥 fire-breath power-ups (press X to breathe fire) and torch the fireball-hurling SKELETON LORD to reach the final flag!";

function endIntro(){
  if (G.state !== "intro") return;
  G.state = "menu";
  showOverlay("PIXEL DASH", MENU_TEXT, "PLAY");
}

// the current level's music track name (data/tracks.js key)
function levelTrack(){ return LEVELS[G.levelIndex].track || "main"; }

function startGame(){
  ensureAudio();
  G.levelIndex = 0; G.score = 0; G.lives = TUNE.lives; G.levelStartScore = 0;
  G.msg = ""; G.msgT = 0;
  buildLevel(); setTrack(levelTrack());
  G.state = "play"; hideOverlay();
}

function reachFlag(){
  if (G.levelIndex < LEVELS.length - 1){
    G.state = "levelclear"; sfx.win();
    const next = LEVELS[G.levelIndex+1];
    showOverlay("LEVEL CLEAR!", `Level ${G.levelIndex+1} complete — score ${G.score}. Next: ${next.name}. Descend!`, "DESCEND ▼");
  } else {
    win();
  }
}

function advanceLevel(){
  G.levelIndex++; G.levelStartScore = G.score;
  buildLevel(); setTrack(levelTrack());
  G.state = "play"; hideOverlay();
}

// Restart the CURRENT level (used by Retry after a game over) so you don't
// get sent back to an earlier level. Lives refill; score rewinds to the
// level start.
function retryLevel(){
  G.lives = TUNE.lives; G.score = G.levelStartScore; G.msg = ""; G.msgT = 0;
  buildLevel(); setTrack(levelTrack());
  G.state = "play"; hideOverlay();
}

function gameOver(){
  G.state = "over"; setTrack(levelTrack());
  showOverlay("GAME OVER", `You scored ${G.score} on level ${G.levelIndex+1}. Retry restarts ${LEVELS[G.levelIndex].name}.`, "RETRY");
}

function win(){
  G.state = "win"; sfx.win(); setTrack("main");
  const bonus = G.lives * TUNE.score.lifeBonus; G.score += bonus;
  showOverlay("YOU WIN! ★", `You stomped the Zerox boss AND torched the Skeleton Lord! Final score ${G.score} (lives bonus +${bonus}). Legendary.`, "PLAY AGAIN");
}

function onOverlayButton(){
  if (G.state === "levelclear") advanceLevel();
  else if (G.state === "over") retryLevel();
  else startGame();
}

ovBtn.addEventListener("click", onOverlayButton);
