import type { CSSProperties } from "react";
import { Character } from "@/components/characters/Character";
import type { CharacterId } from "@/types/content";
import type { Emotion, CharAnim } from "@/components/characters/Character";

type Base = "grass" | "sand" | "cloud" | "crystal";

const BASES: Record<Base, { top: string; topLight: string; rock: string; rockDark: string }> = {
  grass: { top: "#7FD3A0", topLight: "#9BDDB7", rock: "#B98A63", rockDark: "#8E6446" },
  sand: { top: "#FFD76B", topLight: "#FFE6A3", rock: "#C99A6B", rockDark: "#9A7150" },
  crystal: { top: "#B8A5EF", topLight: "#D3C7F7", rock: "#6E64B8", rockDark: "#4F4791" },
  cloud: { top: "#FFFFFF", topLight: "#FFFFFF", rock: "#DCE9F7", rockDark: "#C2D6EE" },
};

function IslandBase({ kind }: { kind: Base }) {
  const c = BASES[kind];
  if (kind === "cloud") {
    return (
      <svg viewBox="0 0 200 60" className="w-full h-auto" aria-hidden focusable="false">
        <g fill={c.rock}>
          <circle cx="45" cy="34" r="20" />
          <circle cx="155" cy="34" r="20" />
        </g>
        <g fill={c.top}>
          <ellipse cx="100" cy="30" rx="88" ry="16" />
          <circle cx="62" cy="22" r="20" />
          <circle cx="100" cy="16" r="24" />
          <circle cx="140" cy="22" r="20" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 90" className="w-full h-auto" aria-hidden focusable="false">
      <path d="M8 22 Q40 70 100 88 Q160 70 192 22 Z" fill={c.rock} />
      <path d="M100 88 Q160 70 192 22 L150 26 Q130 64 100 88 Z" fill={c.rockDark} opacity="0.7" />
      <path d="M60 40 L70 62 L80 42 Z M118 44 L126 66 L136 42 Z" fill={c.rockDark} opacity="0.5" />
      <ellipse cx="100" cy="22" rx="94" ry="18" fill={c.top} />
      <ellipse cx="100" cy="18" rx="80" ry="11" fill={c.topLight} />
      {kind === "grass" && (
        <g fill="#FF967D">
          <circle cx="34" cy="20" r="3.5" />
          <circle cx="168" cy="22" r="3" />
          <circle cx="150" cy="15" r="2.5" fill="#FFD76B" />
        </g>
      )}
      {kind === "crystal" && (
        <g>
          <path d="M28 18 L34 0 L40 18 Z" fill="#A8D8F0" />
          <path d="M162 20 L167 6 L172 20 Z" fill="#A8D8F0" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

interface Spot {
  id: CharacterId;
  base: Base;
  emotion: Emotion;
  animation: CharAnim;
  style: CSSProperties;
  delay: string;
  z: number;
}

const SPOTS: Spot[] = [
  { id: "oli", base: "cloud", emotion: "happy", animation: "idle", style: { left: "20%", top: "0%", width: "24%" }, delay: "0.4s", z: 1 },
  { id: "luna", base: "grass", emotion: "wink", animation: "idle", style: { left: "1%", top: "36%", width: "28%" }, delay: "1.1s", z: 2 },
  { id: "bruno", base: "crystal", emotion: "happy", animation: "idle", style: { right: "1%", top: "26%", width: "29%" }, delay: "1.8s", z: 2 },
  { id: "foxy", base: "sand", emotion: "happy", animation: "wave", style: { left: "31%", top: "38%", width: "38%" }, delay: "0s", z: 3 },
];

/** Hero illustration: the four guides standing on floating islands and a cloud. */
export function HeroScene({ label, names }: { label: string; names: Record<CharacterId, string> }) {
  return (
    <div role="img" aria-label={label} className="relative mx-auto aspect-[6/5] w-full max-w-[34rem] select-none">
      {/* moon + glow */}
      <svg viewBox="0 0 600 500" className="absolute inset-0 h-full w-full" aria-hidden focusable="false">
        <defs>
          <radialGradient id="hero-glow" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#B8A5EF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#B8A5EF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="300" cy="300" rx="300" ry="210" fill="url(#hero-glow)" />
        <circle cx="520" cy="60" r="34" fill="#FFF8EA" opacity="0.95" />
        <circle cx="536" cy="50" r="30" fill="#2A3270" />
        <g fill="#FFD76B">
          <path d="M80 70 l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" opacity="0.9" />
          <path d="M440 170 l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" opacity="0.8" />
        </g>
        {/* dotted path linking the islands */}
        <path d="M120 360 Q200 470 300 450 Q420 430 500 330" fill="none" stroke="#FFF8EA" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" opacity="0.45" />
      </svg>

      {SPOTS.map((s) => (
        <div key={s.id} className="absolute animate-float" style={{ ...s.style, zIndex: s.z, animationDelay: s.delay }}>
          <div className="relative z-10 px-[14%]">
            <Character id={s.id} emotion={s.emotion} animation={s.animation} size={160} className="h-auto w-full" title={names[s.id]} />
          </div>
          <div className="-mt-[16%]">
            <IslandBase kind={s.base} />
          </div>
        </div>
      ))}

      <span aria-hidden className="absolute left-[6%] top-[10%] text-2xl animate-float" style={{ animationDelay: "0.8s" }}>📚</span>
      <span aria-hidden className="absolute right-[18%] top-[6%] text-2xl animate-float" style={{ animationDelay: "1.5s" }}>🔭</span>
      <span aria-hidden className="absolute bottom-[4%] left-[8%] text-xl animate-float" style={{ animationDelay: "2.2s" }}>✨</span>
      <span aria-hidden className="absolute bottom-[8%] right-[10%] text-xl animate-float" style={{ animationDelay: "0.3s" }}>🧪</span>
    </div>
  );
}
