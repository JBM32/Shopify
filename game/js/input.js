// input.js — keyboard + touch, mapped to the shared `keys` action object.
// Systems read keys.left/right/jump/fire and never touch raw events.
"use strict";

const keys = { left:false, right:false, jump:false, fire:false };

function setKey(code, val){
  if (["ArrowLeft","KeyA"].includes(code)) keys.left = val;
  if (["ArrowRight","KeyD"].includes(code)) keys.right = val;
  if (["Space","ArrowUp","KeyW"].includes(code)) keys.jump = val;
  if (["KeyX","KeyF"].includes(code)) keys.fire = val;
}

addEventListener("keydown", e => {
  if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
  ensureAudio();
  if (e.code === "KeyM"){ toggleMusic(); return; }
  if (e.code === "F1"){ e.preventDefault(); DEV.overlay = !DEV.overlay; return; }
  // playtest cheats (debug.js; set DEV.cheats=false to ship without them)
  if (DEV.cheats && (e.code === "KeyO" || e.code === "KeyI") && G.state !== "intro"){
    cheatJumpLevel(e.code === "KeyO" ? 1 : -1); return;
  }
  if (G.state === "intro" && (e.code === "Space" || e.code === "Enter")){ endIntro(); return; }
  setKey(e.code, true);
  if (e.code === "Enter" && G.state !== "play") onOverlayButton();
});
addEventListener("keyup", e => setKey(e.code, false));

// touch pads (shown on coarse-pointer devices via CSS)
function bindPad(id, k){
  const el = document.getElementById(id);
  const on = e => { e.preventDefault(); ensureAudio(); keys[k] = true; };
  const off = e => { e.preventDefault(); keys[k] = false; };
  el.addEventListener("touchstart", on, {passive:false});
  el.addEventListener("touchend", off, {passive:false});
  el.addEventListener("mousedown", on);
  el.addEventListener("mouseup", off);
  el.addEventListener("mouseleave", off);
}
bindPad("pad-left","left"); bindPad("pad-right","right"); bindPad("pad-jump","jump"); bindPad("pad-fire","fire");

// click/tap the canvas to skip the intro
canvas.addEventListener("click", () => { ensureAudio(); if (G.state === "intro") endIntro(); });
