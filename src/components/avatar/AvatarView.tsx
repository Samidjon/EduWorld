import type { AvatarConfig } from "@/types/db";
import { getItem } from "@/data/items";

/**
 * The child's own avatar - same chibi rig as the main characters (head-heavy, round body),
 * recoloured and dressed from avatar_config. Pure SVG, server- and client-renderable.
 */
export const DEFAULT_AVATAR: AvatarConfig = {
  base: "fox",
  furColor: "#F38A3A",
  outfitColor: "#5799E8",
  hat: null,
  outfit: null,
  accessory: null,
  shoes: null,
  pet: null,
  expression: "happy",
};

export const FUR_COLORS = ["#F38A3A", "#B5764A", "#FBF3E8", "#9AA4B2", "#8E6FE3", "#F2C14E", "#3B3B4F", "#F7A8C4"];
export const OUTFIT_COLORS = ["#5799E8", "#5FC79A", "#FF967D", "#B8A5EF", "#FFD76B", "#2BB3A6", "#E85D75", "#28334A"];

function Ears({ base, fur }: { base: AvatarConfig["base"]; fur: string }) {
  switch (base) {
    case "fox":
    case "cat":
      return (
        <g>
          <path d={base === "fox" ? "M48 66 L40 12 L92 44 Z" : "M52 60 L50 20 L86 44 Z"} fill={fur} />
          <path d={base === "fox" ? "M152 66 L160 12 L108 44 Z" : "M148 60 L150 20 L114 44 Z"} fill={fur} />
          <path d="M56 54 L52 28 L78 44 Z M144 54 L148 28 L122 44 Z" fill="#000" opacity="0.18" />
        </g>
      );
    case "bunny":
      return (
        <g fill={fur}>
          <ellipse cx="76" cy="20" rx="15" ry="42" transform="rotate(-10 76 20)" />
          <ellipse cx="126" cy="20" rx="15" ry="42" transform="rotate(12 126 20)" />
          <ellipse cx="76" cy="24" rx="7" ry="30" fill="#FFC1D3" transform="rotate(-10 76 24)" />
          <ellipse cx="126" cy="24" rx="7" ry="30" fill="#FFC1D3" transform="rotate(12 126 24)" />
        </g>
      );
    case "bear":
    case "panda":
      return (
        <g>
          <circle cx="50" cy="50" r="20" fill={base === "panda" ? "#2E2E3A" : fur} />
          <circle cx="150" cy="50" r="20" fill={base === "panda" ? "#2E2E3A" : fur} />
        </g>
      );
    case "owl":
      return <path d="M52 52 L48 18 L82 40 Z M148 52 L152 18 L118 40 Z" fill={fur} />;
  }
}

function Hat({ id }: { id: string | null }) {
  const item = id ? getItem(id) : null;
  if (!item) return null;
  switch (item.art) {
    case "explorer":
      return <g><ellipse cx="100" cy="46" rx="70" ry="12" fill="#C9A26B" /><path d="M64 46 C64 14 136 14 136 46 Z" fill="#D9B47E" /><rect x="64" y="36" width="72" height="8" fill="#8B5A2B" /></g>;
    case "crown":
      return <path d="M64 46 L70 14 L86 32 L100 8 L114 32 L130 14 L136 46 Z" fill="#FFD76B" stroke="#E0A93A" strokeWidth="3" strokeLinejoin="round" />;
    case "wizard":
      return <g><path d="M60 50 L104 -24 L140 50 Z" fill="#5B3FA8" /><ellipse cx="100" cy="50" rx="50" ry="9" fill="#4A3190" /><circle cx="108" cy="14" r="5" fill="#FFD76B" /></g>;
    case "cap":
      return <g><path d="M58 50 C58 18 142 18 142 50 Z" fill="#FF967D" /><path d="M136 46 L178 52 L138 56 Z" fill="#E86E54" /></g>;
    case "flower":
      return <g>{[60, 80, 100, 120, 140].map((x, i) => <circle key={x} cx={x} cy={38 - (i === 2 ? 6 : 0)} r="9" fill={["#FF8FB1", "#FFD76B", "#B8A5EF", "#9BDDB7", "#FF967D"][i]} />)}</g>;
    case "rainbow":
      return <g fill="none" strokeWidth="6">{["#FF6B6B", "#FFD76B", "#9BDDB7", "#5799E8", "#B8A5EF"].map((c, i) => <path key={c} d={`M${62 + i * 5} 50 C${62 + i * 5} ${10 + i * 5} ${138 - i * 5} ${10 + i * 5} ${138 - i * 5} 50`} stroke={c} />)}</g>;
    case "antenna":
      return <g><path d="M100 36 L100 4" stroke="#9AA4B2" strokeWidth="4" /><circle cx="100" cy="2" r="8" fill="#FF967D" /><rect x="84" y="32" width="32" height="10" rx="5" fill="#9AA4B2" /></g>;
    default:
      return null;
  }
}

function Accessory({ id }: { id: string | null }) {
  const item = id ? getItem(id) : null;
  if (!item) return null;
  switch (item.art) {
    case "glasses":
      return <g fill="none" stroke="#28334A" strokeWidth="4"><circle cx="76" cy="96" r="18" /><circle cx="124" cy="96" r="18" /><path d="M94 94 q6 -5 12 0" /></g>;
    case "scarf":
      return <g><path d="M62 156 C80 170 120 170 138 156 L138 168 C120 182 80 182 62 168 Z" fill="#FF8FB1" /><path d="M116 172 L124 200 L110 196 Z" fill="#FF8FB1" /></g>;
    case "backpack":
      return <path d="M70 168 L74 214 M130 168 L126 214" stroke="#8B5A2B" strokeWidth="6" strokeLinecap="round" />;
    case "badge":
      return <path d="M118 180 l6 -10 6 10 -6 10 Z" fill="#7FE0F5" stroke="#3BA9C9" strokeWidth="2" />;
    case "quill":
      return <path d="M140 210 C160 180 170 170 176 150 C160 160 150 176 140 210 Z" fill="#FFF" stroke="#B8A5EF" strokeWidth="2" />;
    case "globe":
      return <g><circle cx="122" cy="186" r="8" fill="#5799E8" /><path d="M116 184 q6 -4 12 2" stroke="#9BDDB7" strokeWidth="3" fill="none" /></g>;
    default:
      return null;
  }
}

export function AvatarView({ config, size = 120, className, showPet = true }: { config: AvatarConfig; size?: number; className?: string; showPet?: boolean }) {
  const c = { ...DEFAULT_AVATAR, ...config };
  const outfit = c.outfit ? getItem(c.outfit)?.art ?? c.outfitColor : c.outfitColor;
  const shoes = c.shoes ? getItem(c.shoes)?.art ?? "#5A3A24" : "#5A3A24";
  const pet = c.pet ? getItem(c.pet)?.art : null;
  const muzzle = c.base === "panda" ? "#FFFFFF" : c.base === "owl" ? "#FFF8EA" : "#FFF4E6";
  return (
    <svg viewBox="0 -24 200 270" width={size} height={size * 1.35} className={className} role="img" aria-label="Avatar">
      {c.base === "fox" && <path d="M140 200 C190 190 196 140 176 128 C182 160 160 178 136 182 Z" fill={c.furColor} />}
      <ellipse cx="100" cy="196" rx="44" ry="38" fill={c.furColor} />
      <path d="M58 188 C60 160 140 160 142 188 L142 214 C130 230 70 230 58 214 Z" fill={outfit} />
      <ellipse cx="58" cy="198" rx="11" ry="17" fill={outfit} />
      <ellipse cx="142" cy="198" rx="11" ry="17" fill={outfit} />
      <ellipse cx="82" cy="232" rx="14" ry="7" fill={shoes} />
      <ellipse cx="118" cy="232" rx="14" ry="7" fill={shoes} />
      <Ears base={c.base} fur={c.furColor} />
      <ellipse cx="100" cy="94" rx="64" ry="58" fill={c.furColor} />
      {c.base === "panda" && <g fill="#2E2E3A"><ellipse cx="76" cy="96" rx="17" ry="20" /><ellipse cx="124" cy="96" rx="17" ry="20" /></g>}
      <ellipse cx="100" cy="124" rx="34" ry="24" fill={muzzle} />
      {c.expression === "wink" ? (
        <g><ellipse cx="76" cy="96" rx="10" ry="13" fill="#2B2140" /><circle cx="80" cy="91" r="4" fill="#fff" /><path d="M113 98 Q124 88 135 98" stroke="#2B2140" strokeWidth="5" fill="none" strokeLinecap="round" /></g>
      ) : c.expression === "cool" ? (
        <g><rect x="56" y="84" width="40" height="22" rx="9" fill="#28334A" /><rect x="104" y="84" width="40" height="22" rx="9" fill="#28334A" /><path d="M96 92 H104" stroke="#28334A" strokeWidth="4" /></g>
      ) : (
        <g><ellipse cx="76" cy="96" rx="10" ry="13" fill="#2B2140" /><ellipse cx="124" cy="96" rx="10" ry="13" fill="#2B2140" /><circle cx="80" cy="91" r="4" fill="#fff" /><circle cx="128" cy="91" r="4" fill="#fff" /></g>
      )}
      {c.base === "owl" ? <path d="M92 114 L108 114 L100 128 Z" fill="#F0A53A" /> : <ellipse cx="100" cy="116" rx="7" ry="5" fill="#2B2140" />}
      <path d="M88 126 Q100 138 112 126" stroke="#2B2140" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <g fill="#FF8FA3" opacity="0.45"><ellipse cx="62" cy="118" rx="10" ry="6" /><ellipse cx="138" cy="118" rx="10" ry="6" /></g>
      <Accessory id={c.accessory} />
      <Hat id={c.hat} />
      {showPet && pet && <text x="178" y="236" fontSize="40" textAnchor="middle">{pet}</text>}
    </svg>
  );
}
