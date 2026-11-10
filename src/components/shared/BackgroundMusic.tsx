"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";
import { isMuted, setMuted } from "@/lib/audio";

const SRC = "/assets/audio/background-music.mp3";
const VOLUME = 0.3;
const POS_KEY = "ew_music_pos";

/**
 * Background music on every page, looping forever. Mounted once in the root layout, so it keeps
 * playing across in-app navigation; after a full reload it resumes from the saved position.
 * Browsers block sound until the first click/tap/key, so playback starts on that first interaction.
 * The same mute switch also silences sound effects (child area top bar or the floating button).
 */
export function BackgroundMusic() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [muted, setMutedState] = useState(false);
  // the track is not in git, so deployments may not have it - then there is no music button at all
  const [available, setAvailable] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const a = new Audio(SRC);
    a.loop = true;
    a.volume = VOLUME;
    a.preload = "auto";
    try {
      const pos = Number(sessionStorage.getItem(POS_KEY));
      if (pos > 0) a.currentTime = pos;
    } catch { /* storage unavailable */ }
    audio.current = a;
    const onReady = () => setAvailable(true);
    const onMissing = () => setAvailable(false);
    a.addEventListener("canplay", onReady);
    a.addEventListener("error", onMissing);
    const m = isMuted();
    setMutedState(m);

    const tryPlay = () => {
      if (isMuted() || a.error) return;
      a.play().then(removeUnlock).catch(() => { /* waiting for a user gesture */ });
    };
    const removeUnlock = () => ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, tryPlay));
    ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, tryPlay));
    tryPlay();

    const onMute = (e: Event) => {
      const v = (e as CustomEvent<boolean>).detail;
      setMutedState(v);
      if (v) a.pause();
      else void a.play().catch(() => undefined);
    };
    window.addEventListener("ew-mute", onMute);
    const save = setInterval(() => {
      try { sessionStorage.setItem(POS_KEY, String(a.currentTime)); } catch { /* ignore */ }
    }, 2000);

    return () => {
      removeUnlock();
      a.removeEventListener("canplay", onReady);
      a.removeEventListener("error", onMissing);
      window.removeEventListener("ew-mute", onMute);
      clearInterval(save);
      a.pause();
    };
  }, []);

  // the child area has its own sound switch in the top bar
  if (!available || path.startsWith("/play")) return null;
  return (
    <button
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "Включить музыку" : "Выключить музыку"}
      title={muted ? "Включить музыку" : "Выключить музыку"}
      className="fixed bottom-4 left-4 z-40 grid size-11 place-items-center rounded-full bg-night-800/85 text-white shadow-lg ring-1 ring-white/15 backdrop-blur transition hover:scale-105"
    >
      {muted ? <VolumeX className="size-5" aria-hidden /> : <Music className="size-5" aria-hidden />}
    </button>
  );
}
