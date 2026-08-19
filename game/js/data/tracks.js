// data/tracks.js — chiptune music data for the 32-step sequencer in audio.js.
// Each track: 32 sixteenth-notes (two bars) for lead and bass; 0 = rest.
// Notes are "C4".."A#5" strings (audio.js converts to Hz). drums: "full"
// (kick + snare + hats), "soft" (kick only), or "none".
// Adding a track = add an entry here, then reference it by key from a
// level's `track` field (data/levels.js) — nothing else to wire up.
"use strict";

// bouncy major-key platformer loop
const TRACKS = {
  main: {
    bpm: 132, leadType: "square", leadVol: 0.05, bassVol: 0.08, drums: "full",
    lead: [
      "E5",0,"E5",0,"G5",0,"E5",0,"C5",0,"D5",0,"E5",0,0,0,
      "D5",0,"C5",0,"A4",0,"C5",0,"B4",0,"G4",0,"A4",0,0,0
    ],
    bass: [
      "C2",0,0,0,"C2",0,0,0,"G2",0,0,0,"G2",0,0,0,
      "A2",0,0,0,"A2",0,0,0,"F2",0,0,0,"G2",0,0,0
    ],
  },
  // dramatic minor-key synth riff for boss fights (faster, sawtooth lead)
  boss: {
    bpm: 152, leadType: "sawtooth", leadVol: 0.05, bassVol: 0.09, drums: "full",
    lead: [
      "A4",0,0,"A4",0,"C5",0,"B4",0,0,"A4",0,"G#4",0,0,0,
      "A4",0,0,"A4",0,"D5",0,"C5",0,"E5",0,"D5",0,"C5",0,"B4",0
    ],
    bass: [
      "D2",0,"D2",0,"D2",0,"D2",0,"D2",0,"D2",0,"D2",0,"D2",0,
      "A#1",0,"A#1",0,"A#1",0,"A#1",0,"C2",0,"C2",0,"C2",0,"C2",0
    ],
  },
  // slow, echoey, mysterious cave theme (sparse triangle lead, deep drone)
  cave: {
    bpm: 104, leadType: "triangle", leadVol: 0.06, bassVol: 0.10, drums: "soft",
    lead: [
      "A4",0,0,0,"C5",0,0,0,"B4",0,0,0,"E4",0,0,0,
      "A4",0,0,0,"D5",0,0,0,"C5",0,0,0,"A4",0,"G4",0
    ],
    bass: [
      "A1",0,0,0,0,0,0,0,"A1",0,0,0,0,0,0,0,
      "F1",0,0,0,0,0,0,0,"E1",0,0,0,0,0,0,0
    ],
  },
};
