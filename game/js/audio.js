// audio.js — Web Audio SFX + the 32-step chiptune sequencer.
// Everything is generated (no audio files — required for file://).
// Public surface: ensureAudio, sfx.*, beep, setTrack(name), toggleMusic,
// isMusicOn, setMusicVol. Internals (actx, gains, step clock) are private
// to this file by convention — nothing else should touch them.
"use strict";

let actx;                 // AudioContext, created lazily on a user gesture
let musicGain, noiseBuf;  // music bus; sfx beeps bypass it (mute affects music only)

function beep(freq, dur, type = "square", vol = 0.08){
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(actx.destination);
    const t = actx.currentTime;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch(e){}
}

const sfx = {
  jump:  () => beep(520, .12, "square", .06),
  coin:  () => { beep(880,.07,"square",.06); setTimeout(()=>beep(1175,.1,"square",.06),60); },
  stomp: () => beep(160,.12,"sawtooth",.08),
  power: () => { beep(660,.08); setTimeout(()=>beep(990,.08),70); setTimeout(()=>beep(1320,.12),140); },
  hurt:  () => beep(120,.3,"sawtooth",.1),
  fire:  () => { beep(330,.07,"sawtooth",.05); setTimeout(()=>beep(170,.12,"sawtooth",.05),50); },
  win:   () => { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.16),i*120)); },
  checkpoint: () => { beep(660,.08,"square",.06); setTimeout(()=>beep(990,.1,"square",.06),70); },
  bossIntro:  () => beep(90,.25,"sawtooth",.09),
};

// ---------- music sequencer ----------
const music = { on: true, started: false, step: 0, next: 0, timer: null, trackName: "main" };

const SEMI = {C:-9,"C#":-8,D:-7,"D#":-6,E:-5,F:-4,"F#":-3,G:-2,"G#":-1,A:0,"A#":1,B:2};
function noteFreq(n){
  if (!n) return 0;
  const m = /^([A-G]#?)(\d)$/.exec(n); if (!m) return 0;
  return 440 * Math.pow(2, (SEMI[m[1]] + (parseInt(m[2])-4)*12) / 12);
}

// switch tracks by TRACKS key; no-op if it's already playing
function setTrack(name){
  if (!TRACKS[name] || music.trackName === name) return;
  music.trackName = name; music.step = 0;
  if (actx) music.next = actx.currentTime + 0.06;
}

function tone(freq, t, dur, type, vol){
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(musicGain);
  o.start(t); o.stop(t + dur + 0.02);
}
function makeNoise(){
  const b = actx.createBuffer(1, actx.sampleRate*0.2, actx.sampleRate);
  const d = b.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  return b;
}
function drum(t, hp, vol, dur){
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
  const g = actx.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(musicGain);
  s.start(t); s.stop(t + dur + 0.02);
}
function kick(t){
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + 0.18);
}
function scheduler(){
  const tr = TRACKS[music.trackName] || TRACKS.main;
  const stepDur = 60/tr.bpm/4;
  while (music.next < actx.currentTime + 0.12){
    const s = music.step % 32, t = music.next;
    const lf = noteFreq(tr.lead[s]); if (lf) tone(lf, t, stepDur*1.7, tr.leadType, tr.leadVol);
    const bf = noteFreq(tr.bass[s]); if (bf) tone(bf, t, stepDur*2.2, "triangle", tr.bassVol);
    if (tr.drums !== "none"){
      if (s % 8 === 0) kick(t);                       // beats 1 & 3
      if (tr.drums === "full"){
        if (s % 8 === 4) drum(t, 1500, 0.07, 0.12);   // snare on 2 & 4
        if (s % 2 === 0) drum(t, 7000, 0.03, 0.05);   // hi-hat on eighths
      }
    }
    music.next += stepDur; music.step++;
  }
  music.timer = setTimeout(scheduler, 25);
}
function startMusic(){
  if (music.started) return; music.started = true;
  musicGain = actx.createGain();
  musicGain.gain.value = music.on ? 0.4 : 0;
  musicGain.connect(actx.destination);
  noiseBuf = makeNoise();
  music.next = actx.currentTime + 0.1; music.step = 0;
  scheduler();
}
// Create/resume the audio context on a user gesture, then kick off the loop.
function ensureAudio(){
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    if (!music.started) startMusic();
  } catch(e){}
}
function toggleMusic(){
  music.on = !music.on;
  if (musicGain) musicGain.gain.setTargetAtTime(music.on ? 0.4 : 0, actx.currentTime, 0.02);
}
function isMusicOn(){ return music.on; }
// 0..1 music volume (the default level is 0.4) — handy for a settings menu
function setMusicVol(v){ if (musicGain) musicGain.gain.setTargetAtTime(v, actx.currentTime, 0.02); }
