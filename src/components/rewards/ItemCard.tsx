import type { GameItem } from "@/types/content";

export const RARITY: Record<GameItem["rarity"], { color: string; en: string; ru: string }> = {
  common: { color: "#9BDDB7", en: "Common", ru: "Обычный" },
  rare: { color: "#5799E8", en: "Rare", ru: "Редкий" },
  epic: { color: "#B8A5EF", en: "Epic", ru: "Эпический" },
  legendary: { color: "#FFD76B", en: "Legendary", ru: "Легендарный" },
};

export function ItemIcon({ item, size = 48 }: { item: GameItem; size?: number }) {
  const emoji = item.art.length <= 3 ? item.art : null;
  const color = item.art.startsWith("#") ? item.art : null;
  const fallback: Record<string, string> = { hat: "🎩", accessory: "🎀", outfit: "👕", shoes: "👟" };
  const artEmoji: Record<string, string> = { explorer: "🤠", crown: "👑", wizard: "🧙", cap: "🧢", flower: "💐", rainbow: "🌈", antenna: "📡", glasses: "👓", scarf: "🧣", backpack: "🎒", badge: "💎", quill: "🪶", globe: "🌐" };
  return (
    <span className="grid place-items-center rounded-2xl bg-black/20" style={{ width: size, height: size, fontSize: size * 0.55 }} aria-hidden>
      {emoji ?? (color ? <span className="rounded-lg" style={{ width: size * 0.55, height: size * 0.55, background: color, display: "block" }} /> : artEmoji[item.art] ?? fallback[item.type] ?? "✨")}
    </span>
  );
}
