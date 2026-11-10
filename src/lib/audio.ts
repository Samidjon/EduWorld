"use client";

/**
 * Audio helpers. Speech uses the device's speech synthesis (no audio files or network).
 * Sound effects are synthesized with Web Audio so there are no external assets to load.
 */

/**
 * Voice helper (read-aloud of prompts, rules, explanations) is switched OFF by the owner's request.
 * With it off, speak() is a no-op and the "Listen" buttons are hidden by CSS (see globals.css,
 * html[data-voice="off"]). Tasks that cannot be solved without sound (audio recognition) still
 * speak via speak(text, lang, { required: true }). Set to true to bring the helper back.
 */
import { VOICE_HELPER } from "./voice";
export { VOICE_HELPER };

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem("ew_muted", m ? "1" : "0"); } catch { /* storage unavailable */ }
  // background music listens for this
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ew-mute", { detail: m }));
}
export function isMuted() {
  try { muted = localStorage.getItem("ew_muted") === "1"; } catch { /* ignore */ }
  return muted;
}

function ac() {
  if (typeof window === "undefined") return null;
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, a.currentTime + start);
  g.gain.setValueAtTime(0.0001, a.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + start);
  o.stop(a.currentTime + start + dur + 0.05);
}

export type Sfx = "correct" | "tryAgain" | "click" | "coin" | "levelUp" | "unlock" | "foxy" | "oli" | "bruno" | "luna";

export function sfx(name: Sfx) {
  if (isMuted()) return;
  try {
    switch (name) {
      case "correct": tone(660, 0, 0.12, "triangle"); tone(880, 0.1, 0.18, "triangle"); break;
      case "tryAgain": tone(420, 0, 0.15, "sine", 0.08); tone(380, 0.12, 0.2, "sine", 0.06); break; // soft, not a buzzer
      case "click": tone(520, 0, 0.05, "square", 0.04); break;
      case "coin": tone(988, 0, 0.08, "square", 0.05); tone(1318, 0.07, 0.15, "square", 0.05); break;
      case "levelUp": [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.2, "triangle")); break;
      case "unlock": [392, 523, 784].forEach((f, i) => tone(f, i * 0.12, 0.25, "sine")); break;
      // character signatures
      case "foxy": tone(740, 0, 0.08, "triangle"); tone(990, 0.08, 0.12, "triangle"); break; // yip
      case "oli": tone(330, 0, 0.18, "sine"); tone(294, 0.2, 0.25, "sine"); break; // hoo-hoo
      case "bruno": tone(196, 0, 0.12, "sawtooth", 0.05); tone(262, 0.12, 0.12, "square", 0.05); break; // gadget
      case "luna": [880, 1175, 1568].forEach((f, i) => tone(f, i * 0.06, 0.12, "sine", 0.07)); break; // chime
    }
  } catch { /* audio not available */ }
}

/** Chooses a voice by the script of the text so English words are not read by a Russian voice. */
export function speak(text: string, fallbackLang: "ru" | "en" | "uz" = "ru", opts: { required?: boolean } = {}) {
  if (!VOICE_HELPER && !opts.required) return false;
  if (typeof window === "undefined" || !("speechSynthesis" in window) || isMuted()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/___/g, "…"));
  const cyr = /[а-яё]/i.test(text);
  const lat = /[a-z]/i.test(text);
  u.lang = cyr ? "ru-RU" : lat && fallbackLang !== "uz" ? "en-US" : fallbackLang === "uz" ? "uz-UZ" : "ru-RU";
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(u.lang.slice(0, 2)));
  if (voice) u.voice = voice;
  u.rate = 0.92;
  u.pitch = 1.1;
  synth.speak(u);
  return true;
}
