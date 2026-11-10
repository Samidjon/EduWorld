"use client";

import { motion, type TargetAndTransition } from "framer-motion";
import type { CharacterId } from "@/types/content";

/**
 * EduWorld's four original characters, drawn as vector art with one shared rig so proportions
 * stay consistent everywhere (see ASSET_GUIDE.md):
 *   viewBox 200x240 · head centre (100, 92) r≈62 · body centre (100, 190) · 1 : 0.8 head/body ratio.
 * Emotions change eyes/mouth/brows; animations are applied to the whole figure or to the arm.
 */

export type Emotion = "happy" | "think" | "sad" | "surprised" | "celebrate" | "talk" | "wink";
export type CharAnim = "idle" | "walk" | "run" | "jump" | "celebrate" | "think" | "sad" | "surprised" | "wave" | "talk" | "none";

interface Props {
  id: CharacterId;
  emotion?: Emotion;
  animation?: CharAnim;
  size?: number;
  className?: string;
  /** Head & shoulders only. */
  portrait?: boolean;
  title?: string;
}

const NAMES: Record<CharacterId, string> = { foxy: "Foxy", oli: "Oli", bruno: "Bruno", luna: "Luna" };

const BODY_ANIM: Record<CharAnim, TargetAndTransition | undefined> = {
  idle: { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  walk: { y: [0, -5, 0], rotate: [-2, 2, -2], transition: { duration: 0.8, repeat: Infinity } },
  run: { y: [0, -9, 0], rotate: [-4, 4, -4], transition: { duration: 0.45, repeat: Infinity } },
  jump: { y: [0, -36, 0], transition: { duration: 0.7, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" } },
  celebrate: { y: [0, -24, 0], scale: [1, 1.06, 1], rotate: [0, -6, 6, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.3 } },
  think: { rotate: [0, -5, -5, 0], transition: { duration: 3, repeat: Infinity } },
  sad: { y: [0, 3, 0], transition: { duration: 3.5, repeat: Infinity } },
  surprised: { scale: [1, 1.08, 1], transition: { duration: 0.5 } },
  wave: { y: [0, -3, 0], transition: { duration: 2, repeat: Infinity } },
  talk: { y: [0, -2, 0], transition: { duration: 0.6, repeat: Infinity } },
  none: undefined,
};

function Eyes({ emotion, color = "#2B2140", glasses }: { emotion: Emotion; color?: string; glasses?: boolean }) {
  const lx = 76, rx = 124, y = 96;
  if (emotion === "happy" && !glasses) {
    return (
      <g>
        <Eye x={lx} y={y} color={color} />
        <Eye x={rx} y={y} color={color} />
      </g>
    );
  }
  if (emotion === "celebrate") {
    return (
      <g stroke={color} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d={`M${lx - 11} ${y + 3} Q${lx} ${y - 10} ${lx + 11} ${y + 3}`} />
        <path d={`M${rx - 11} ${y + 3} Q${rx} ${y - 10} ${rx + 11} ${y + 3}`} />
      </g>
    );
  }
  if (emotion === "wink") {
    return (
      <g>
        <Eye x={lx} y={y} color={color} />
        <path d={`M${rx - 11} ${y + 2} Q${rx} ${y - 8} ${rx + 11} ${y + 2}`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (emotion === "sad") {
    return (
      <g>
        <Eye x={lx} y={y + 3} color={color} small />
        <Eye x={rx} y={y + 3} color={color} small />
        <g stroke={color} strokeWidth="3.5" strokeLinecap="round">
          <path d={`M${lx - 12} ${y - 14} L${lx + 8} ${y - 19}`} />
          <path d={`M${rx + 12} ${y - 14} L${rx - 8} ${y - 19}`} />
        </g>
      </g>
    );
  }
  if (emotion === "surprised") {
    return (
      <g>
        <Eye x={lx} y={y} color={color} big />
        <Eye x={rx} y={y} color={color} big />
      </g>
    );
  }
  if (emotion === "think") {
    return (
      <g>
        <Eye x={lx} y={y} color={color} look={-1} />
        <Eye x={rx} y={y} color={color} look={-1} />
        <path d={`M${rx - 12} ${y - 20} Q${rx} ${y - 26} ${rx + 12} ${y - 19}`} stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <Eye x={lx} y={y} color={color} />
      <Eye x={rx} y={y} color={color} />
    </g>
  );
}

function Eye({ x, y, color, small, big, look = 0 }: { x: number; y: number; color: string; small?: boolean; big?: boolean; look?: number }) {
  const ry = small ? 10 : big ? 15 : 13;
  const rx = small ? 8.5 : big ? 12 : 10.5;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} />
      <circle cx={x + 3.5 + look * 3} cy={y - 4.5 + look * 2} r={big ? 5 : 4.2} fill="#fff" />
      <circle cx={x - 3.5 + look * 2} cy={y + 4.5} r={1.8} fill="#fff" opacity="0.8" />
    </g>
  );
}

function Mouth({ emotion, y = 124, color = "#2B2140" }: { emotion: Emotion; y?: number; color?: string }) {
  switch (emotion) {
    case "celebrate":
    case "happy":
    case "wink":
      return <path d={`M88 ${y} Q100 ${y + 14} 112 ${y} Z`} fill="#7A2E3A" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />;
    case "sad":
      return <path d={`M90 ${y + 8} Q100 ${y} 110 ${y + 8}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
    case "surprised":
      return <ellipse cx="100" cy={y + 5} rx="6" ry="8" fill="#7A2E3A" stroke={color} strokeWidth="2.5" />;
    case "think":
      return <path d={`M92 ${y + 4} L108 ${y + 2}`} stroke={color} strokeWidth="3.5" strokeLinecap="round" />;
    case "talk":
      return (
        <motion.ellipse cx="100" cy={y + 4} rx="8" fill="#7A2E3A" stroke={color} strokeWidth="2.5" animate={{ ry: [3, 8, 4, 7, 3] }} transition={{ duration: 0.9, repeat: Infinity }} />
      );
  }
}

const Blush = () => (
  <g fill="#FF8FA3" opacity="0.45">
    <ellipse cx="62" cy="118" rx="10" ry="6" />
    <ellipse cx="138" cy="118" rx="10" ry="6" />
  </g>
);

function WaveArm({ animate, children, ox, oy }: { animate: boolean; children: React.ReactNode; ox: number; oy: number }) {
  return (
    <motion.g
      style={{ transformOrigin: `${ox}px ${oy}px`, transformBox: "view-box" }}
      animate={animate ? { rotate: [0, -35, -10, -35, 0] } : undefined}
      transition={animate ? { duration: 1.4, repeat: Infinity, repeatDelay: 0.6 } : undefined}
    >
      {children}
    </motion.g>
  );
}

/* ---------------- FOXY ---------------- */
function Foxy({ emotion, anim }: { emotion: Emotion; anim: CharAnim }) {
  return (
    <g>
      {/* tail */}
      <path d="M140 200 C190 190 196 140 176 128 C182 160 160 178 136 182 Z" fill="#F07A2E" />
      <path d="M176 128 C186 136 190 150 186 160 C178 150 176 140 176 128 Z" fill="#FFF4E6" />
      {/* body + jacket */}
      <ellipse cx="100" cy="196" rx="44" ry="38" fill="#F38A3A" />
      <path d="M58 188 C60 160 140 160 142 188 L142 214 C130 230 70 230 58 214 Z" fill="#3E7BD6" />
      <path d="M100 168 L100 226" stroke="#2C5EAE" strokeWidth="3" />
      <ellipse cx="100" cy="186" rx="15" ry="18" fill="#FFF4E6" />
      <path d="M118 182 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1 Z" fill="#FFD76B" stroke="#E0A93A" strokeWidth="1.5" />
      {/* backpack straps */}
      <path d="M70 172 L74 214 M130 172 L126 214" stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round" />
      {/* arms */}
      <ellipse cx="58" cy="198" rx="11" ry="17" fill="#3E7BD6" />
      <WaveArm animate={anim === "wave"} ox={140} oy={186}>
        <ellipse cx="142" cy="198" rx="11" ry="17" fill="#3E7BD6" />
        <circle cx="144" cy="214" r="8" fill="#F38A3A" />
      </WaveArm>
      {/* feet */}
      <ellipse cx="82" cy="232" rx="14" ry="7" fill="#5A3A24" />
      <ellipse cx="118" cy="232" rx="14" ry="7" fill="#5A3A24" />
      {/* ears */}
      <path d="M48 66 L40 10 L92 44 Z" fill="#F07A2E" />
      <path d="M152 66 L160 10 L108 44 Z" fill="#F07A2E" />
      <path d="M54 56 L50 24 L80 44 Z" fill="#3B2A2A" opacity="0.85" />
      <path d="M146 56 L150 24 L120 44 Z" fill="#3B2A2A" opacity="0.85" />
      {/* head */}
      <ellipse cx="100" cy="94" rx="64" ry="58" fill="#F38A3A" />
      <path d="M36 98 C50 140 80 150 100 150 C120 150 150 140 164 98 C150 118 128 126 100 126 C72 126 50 118 36 98 Z" fill="#FFF4E6" />
      <path d="M100 126 C84 126 70 118 62 106 C72 138 128 138 138 106 C130 118 116 126 100 126 Z" fill="#FFF4E6" />
      <Eyes emotion={emotion} />
      <ellipse cx="100" cy="114" rx="7" ry="5" fill="#2B2140" />
      <Mouth emotion={emotion} y={122} />
      <Blush />
    </g>
  );
}

/* ---------------- OLI ---------------- */
function Oli({ emotion, anim }: { emotion: Emotion; anim: CharAnim }) {
  return (
    <g>
      {/* gown */}
      <path d="M52 200 C52 150 148 150 148 200 L152 228 C130 238 70 238 48 228 Z" fill="#5B3FA8" />
      <path d="M78 170 C88 190 112 190 122 170 L120 232 L80 232 Z" fill="#FFF1DC" />
      <g fill="#E9DCC0">
        <path d="M88 186 q12 8 24 0" stroke="#D8C7A3" strokeWidth="2" fill="none" />
        <path d="M88 198 q12 8 24 0" stroke="#D8C7A3" strokeWidth="2" fill="none" />
        <path d="M88 210 q12 8 24 0" stroke="#D8C7A3" strokeWidth="2" fill="none" />
      </g>
      {/* book (left wing) */}
      <g transform="translate(34 186) rotate(-12)">
        <rect x="0" y="0" width="34" height="26" rx="3" fill="#C0392B" />
        <rect x="3" y="3" width="28" height="20" rx="2" fill="#FFF8EA" />
        <path d="M17 3 L17 23" stroke="#C0392B" strokeWidth="2" />
      </g>
      {/* wing with pointer */}
      <WaveArm animate={anim === "wave"} ox={146} oy={176}>
        <path d="M144 170 C170 180 172 210 156 222 C150 204 146 190 140 182 Z" fill="#7C5CD6" />
        <path d="M160 214 L186 168" stroke="#8B5A2B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="186" cy="166" r="6" fill="#FFD76B" />
        <path d="M186 154 l2 6 6 0 -5 4 2 6 -5 -4 -5 4 2 -6 -5 -4 6 0 Z" fill="#FFD76B" />
      </WaveArm>
      {/* feet */}
      <path d="M80 232 l-6 8 M86 232 l0 9 M92 232 l6 8" stroke="#F0A53A" strokeWidth="4" strokeLinecap="round" />
      <path d="M108 232 l-6 8 M114 232 l0 9 M120 232 l6 8" stroke="#F0A53A" strokeWidth="4" strokeLinecap="round" />
      {/* ear tufts */}
      <path d="M50 52 L46 18 L80 40 Z" fill="#7C5CD6" />
      <path d="M150 52 L154 18 L120 40 Z" fill="#7C5CD6" />
      {/* head */}
      <ellipse cx="100" cy="96" rx="66" ry="60" fill="#8E6FE3" />
      <path d="M100 52 C70 52 46 70 46 100 C46 132 72 150 100 150 C128 150 154 132 154 100 C154 70 130 52 100 52 Z" fill="#B8A5EF" />
      <ellipse cx="76" cy="96" rx="24" ry="24" fill="#FFF8EA" />
      <ellipse cx="124" cy="96" rx="24" ry="24" fill="#FFF8EA" />
      {/* feather pattern */}
      <g fill="none" stroke="#8E6FE3" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
        <path d="M80 136 q6 5 12 0 M96 140 q6 5 12 0 M112 136 q6 5 12 0" />
      </g>
      <Eyes emotion={emotion} glasses />
      {/* glasses */}
      <g fill="none" stroke="#3B2A55" strokeWidth="4">
        <circle cx="76" cy="96" r="22" />
        <circle cx="124" cy="96" r="22" />
        <path d="M98 94 q2 -4 4 0" />
      </g>
      {/* beak */}
      <path d="M92 116 L108 116 L100 130 Z" fill="#F0A53A" stroke="#C97F1E" strokeWidth="2" strokeLinejoin="round" />
      {emotion === "talk" && <motion.path d="M94 128 L106 128 L100 134 Z" fill="#C97F1E" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />}
      {emotion === "sad" && <path d="M90 140 Q100 134 110 140" stroke="#3B2A55" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {/* graduation cap */}
      <path d="M58 46 L100 30 L142 46 L100 62 Z" fill="#2E2257" />
      <rect x="84" y="46" width="32" height="10" rx="3" fill="#2E2257" />
      <path d="M142 46 L144 70" stroke="#FFD76B" strokeWidth="3" />
      <circle cx="144" cy="72" r="4" fill="#FFD76B" />
    </g>
  );
}

/* ---------------- BRUNO ---------------- */
function Bruno({ emotion, anim }: { emotion: Emotion; anim: CharAnim }) {
  return (
    <g>
      {/* body + overalls */}
      <ellipse cx="100" cy="196" rx="50" ry="40" fill="#A8693E" />
      <path d="M56 196 L144 196 L146 220 C130 236 70 236 54 220 Z" fill="#F5C33B" />
      <rect x="74" y="170" width="52" height="34" rx="6" fill="#F5C33B" />
      <path d="M74 172 L64 160 M126 172 L136 160" stroke="#F5C33B" strokeWidth="7" strokeLinecap="round" />
      <circle cx="80" cy="178" r="3" fill="#8B6914" />
      <circle cx="120" cy="178" r="3" fill="#8B6914" />
      <rect x="88" y="182" width="24" height="14" rx="3" fill="#E5AE1E" />
      {/* tool belt */}
      <rect x="54" y="204" width="92" height="9" rx="4" fill="#6B4226" />
      <rect x="62" y="208" width="10" height="16" rx="2" fill="#9AA4B2" />
      <rect x="128" y="208" width="8" height="18" rx="2" fill="#E74C3C" />
      {/* arms */}
      <ellipse cx="52" cy="196" rx="14" ry="20" fill="#A8693E" />
      <WaveArm animate={anim === "wave"} ox={146} oy={184}>
        <ellipse cx="148" cy="196" rx="14" ry="20" fill="#A8693E" />
        <ellipse cx="150" cy="214" rx="12" ry="9" fill="#8A5530" />
        <path d="M160 206 l14 -14" stroke="#9AA4B2" strokeWidth="5" strokeLinecap="round" />
        <circle cx="176" cy="190" r="6" fill="none" stroke="#9AA4B2" strokeWidth="4" />
      </WaveArm>
      <ellipse cx="80" cy="234" rx="16" ry="7" fill="#6B4226" />
      <ellipse cx="120" cy="234" rx="16" ry="7" fill="#6B4226" />
      {/* robot helper */}
      <g transform="translate(14 120)">
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <rect x="0" y="0" width="26" height="22" rx="7" fill="#9BDDB7" stroke="#4E9C78" strokeWidth="2" />
          <circle cx="8" cy="10" r="3" fill="#28334A" />
          <circle cx="18" cy="10" r="3" fill="#28334A" />
          <path d="M13 0 L13 -8" stroke="#4E9C78" strokeWidth="2" />
          <circle cx="13" cy="-9" r="3" fill="#FF967D" />
        </motion.g>
      </g>
      {/* ears */}
      <circle cx="48" cy="48" r="20" fill="#A8693E" />
      <circle cx="152" cy="48" r="20" fill="#A8693E" />
      <circle cx="48" cy="48" r="10" fill="#E8B48A" />
      <circle cx="152" cy="48" r="10" fill="#E8B48A" />
      {/* head */}
      <ellipse cx="100" cy="96" rx="64" ry="58" fill="#B5764A" />
      <ellipse cx="100" cy="122" rx="30" ry="24" fill="#F2CFA6" />
      <Eyes emotion={emotion} />
      {/* goggles on forehead */}
      <rect x="50" y="52" width="100" height="10" rx="5" fill="#5A4636" />
      <circle cx="80" cy="56" r="13" fill="#9FD8F5" stroke="#5A4636" strokeWidth="4" />
      <circle cx="120" cy="56" r="13" fill="#9FD8F5" stroke="#5A4636" strokeWidth="4" />
      <circle cx="76" cy="52" r="4" fill="#fff" opacity="0.8" />
      <circle cx="116" cy="52" r="4" fill="#fff" opacity="0.8" />
      <ellipse cx="100" cy="112" rx="9" ry="6.5" fill="#3B2418" />
      <Mouth emotion={emotion} y={124} />
      <Blush />
    </g>
  );
}

/* ---------------- LUNA ---------------- */
function Luna({ emotion, anim }: { emotion: Emotion; anim: CharAnim }) {
  return (
    <g>
      {/* body + teal outfit */}
      <ellipse cx="100" cy="198" rx="42" ry="36" fill="#F6EBDD" />
      <path d="M60 192 C62 166 138 166 140 192 L142 216 C128 232 72 232 58 216 Z" fill="#2BB3A6" />
      <path d="M100 172 L100 228" stroke="#1F8E84" strokeWidth="2.5" strokeDasharray="4 4" />
      {/* bag strap + bag */}
      <path d="M64 170 L134 214" stroke="#B5763C" strokeWidth="5" strokeLinecap="round" />
      <rect x="124" y="206" width="26" height="20" rx="5" fill="#C98A4E" />
      <rect x="128" y="206" width="18" height="7" rx="3" fill="#A86F38" />
      {/* scarf */}
      <path d="M62 160 C80 174 120 174 138 160 L138 172 C120 186 80 186 62 172 Z" fill="#FF8FB1" />
      <path d="M118 176 L126 204 L112 200 Z" fill="#FF8FB1" />
      {/* arms */}
      <ellipse cx="58" cy="198" rx="11" ry="17" fill="#2BB3A6" />
      <circle cx="56" cy="214" r="8" fill="#F6EBDD" />
      <WaveArm animate={anim === "wave"} ox={140} oy={186}>
        <ellipse cx="142" cy="198" rx="11" ry="17" fill="#2BB3A6" />
        {/* compass */}
        <circle cx="146" cy="216" r="10" fill="#FFD76B" stroke="#C99A2E" strokeWidth="2" />
        <path d="M146 209 L149 216 L146 223 L143 216 Z" fill="#E74C3C" />
      </WaveArm>
      <ellipse cx="84" cy="232" rx="13" ry="7" fill="#E0CDB8" />
      <ellipse cx="116" cy="232" rx="13" ry="7" fill="#E0CDB8" />
      {/* ears */}
      <g>
        <ellipse cx="74" cy="22" rx="16" ry="44" fill="#F6EBDD" transform="rotate(-10 74 22)" />
        <ellipse cx="74" cy="24" rx="8" ry="32" fill="#FFC1D3" transform="rotate(-10 74 24)" />
        <ellipse cx="128" cy="22" rx="16" ry="44" fill="#F6EBDD" transform="rotate(14 128 22)" />
        <ellipse cx="128" cy="24" rx="8" ry="32" fill="#FFC1D3" transform="rotate(14 128 24)" />
      </g>
      {/* head */}
      <ellipse cx="100" cy="98" rx="62" ry="56" fill="#FBF3E8" />
      <Eyes emotion={emotion} />
      <path d="M95 110 L105 110 L100 116 Z" fill="#FF8FA3" />
      <Mouth emotion={emotion} y={122} />
      <Blush />
      {/* flower clip */}
      <g transform="translate(140 60)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-7" rx="5" ry="7" fill="#B8A5EF" transform={`rotate(${a})`} />
        ))}
        <circle r="4" fill="#FFD76B" />
      </g>
    </g>
  );
}

export function Character({ id, emotion = "happy", animation = "idle", size = 160, className, portrait, title }: Props) {
  const anim = animation;
  const Fig = { foxy: Foxy, oli: Oli, bruno: Bruno, luna: Luna }[id];
  const viewBox = portrait ? "20 0 160 165" : "0 -6 200 248";
  const h = portrait ? size * (165 / 160) : size * (248 / 200);
  return (
    <motion.svg
      role="img"
      aria-label={title ?? NAMES[id]}
      viewBox={viewBox}
      width={size}
      height={h}
      className={className}
      animate={BODY_ANIM[anim]}
      style={{ overflow: "visible" }}
    >
      {anim === "celebrate" && (
        <g>
          {["#FFD76B", "#FF967D", "#9BDDB7", "#A8D8F0", "#B8A5EF"].map((c, i) => (
            <motion.circle key={c} cx={30 + i * 35} cy={10} r={4} fill={c} animate={{ y: [0, 30, 60], opacity: [1, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </g>
      )}
      <Fig emotion={anim === "talk" ? "talk" : emotion} anim={anim} />
      {anim === "think" && (
        <motion.g animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <circle cx="170" cy="40" r="5" fill="#fff" opacity="0.8" />
          <circle cx="182" cy="24" r="8" fill="#fff" opacity="0.8" />
          <text x="178" y="12" fontSize="20" textAnchor="middle" fill="#FFD76B">?</text>
        </motion.g>
      )}
    </motion.svg>
  );
}

export const CHARACTER_NAMES = NAMES;
