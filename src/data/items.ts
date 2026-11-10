import type { GameItem } from "@/types/content";

/** Cosmetic items only - coins never buy learning advantages. */
export const ITEMS: GameItem[] = [
  // hats
  { id: "hat.explorer", name: { en: "Explorer Hat", ru: "Шляпа исследователя" }, type: "hat", rarity: "common", price: 40, art: "explorer" },
  { id: "hat.crown", name: { en: "Little Crown", ru: "Маленькая корона" }, type: "hat", rarity: "rare", price: 120, art: "crown" },
  { id: "hat.wizard", name: { en: "Wizard Hat", ru: "Шляпа волшебника" }, type: "hat", rarity: "rare", price: 150, art: "wizard" },
  { id: "hat.cap", name: { en: "Sport Cap", ru: "Кепка" }, type: "hat", rarity: "common", price: 30, art: "cap" },
  { id: "hat.flower", name: { en: "Flower Crown", ru: "Венок из цветов" }, type: "hat", rarity: "common", price: 50, art: "flower" },
  { id: "hat.rainbow-cap", name: { en: "Rainbow Cap", ru: "Радужная кепка" }, type: "hat", rarity: "epic", price: 0, art: "rainbow", rewardOnly: true },
  { id: "hat.robot-antenna", name: { en: "Robot Antenna", ru: "Антенна робота" }, type: "hat", rarity: "epic", price: 0, art: "antenna", rewardOnly: true },
  // outfits (art = colour)
  { id: "outfit.hoodie-blue", name: { en: "Blue Hoodie", ru: "Синяя толстовка" }, type: "outfit", rarity: "common", price: 40, art: "#5799E8" },
  { id: "outfit.hoodie-mint", name: { en: "Mint Hoodie", ru: "Мятная толстовка" }, type: "outfit", rarity: "common", price: 40, art: "#5FC79A" },
  { id: "outfit.hoodie-coral", name: { en: "Coral Hoodie", ru: "Коралловая толстовка" }, type: "outfit", rarity: "common", price: 40, art: "#FF967D" },
  { id: "outfit.space-suit", name: { en: "Space Suit", ru: "Скафандр" }, type: "outfit", rarity: "rare", price: 180, art: "#E8EEF7" },
  { id: "outfit.lab-coat", name: { en: "Lab Coat", ru: "Лабораторный халат" }, type: "outfit", rarity: "epic", price: 0, art: "#FFFFFF", rewardOnly: true },
  { id: "outfit.star-cloak", name: { en: "Star Cloak", ru: "Звёздный плащ" }, type: "outfit", rarity: "legendary", price: 0, art: "#3B2A7A", rewardOnly: true },
  // accessories
  { id: "acc.glasses", name: { en: "Round Glasses", ru: "Круглые очки" }, type: "accessory", rarity: "common", price: 35, art: "glasses" },
  { id: "acc.scarf", name: { en: "Cosy Scarf", ru: "Уютный шарф" }, type: "accessory", rarity: "common", price: 35, art: "scarf" },
  { id: "acc.backpack", name: { en: "Adventure Backpack", ru: "Рюкзак путешественника" }, type: "accessory", rarity: "rare", price: 90, art: "backpack" },
  { id: "acc.crystal-badge", name: { en: "Crystal Badge", ru: "Кристальный значок" }, type: "accessory", rarity: "epic", price: 0, art: "badge", rewardOnly: true },
  { id: "acc.magic-quill", name: { en: "Magic Quill", ru: "Волшебное перо" }, type: "accessory", rarity: "epic", price: 0, art: "quill", rewardOnly: true },
  { id: "acc.globe-pin", name: { en: "Globe Pin", ru: "Значок-глобус" }, type: "accessory", rarity: "epic", price: 0, art: "globe", rewardOnly: true },
  // shoes (art = colour)
  { id: "shoes.sneakers", name: { en: "Sneakers", ru: "Кроссовки" }, type: "shoes", rarity: "common", price: 30, art: "#FF967D" },
  { id: "shoes.boots", name: { en: "Rain Boots", ru: "Резиновые сапожки" }, type: "shoes", rarity: "common", price: 30, art: "#FFD76B" },
  // pets (art = emoji)
  { id: "pet.kitten", name: { en: "Kitten", ru: "Котёнок" }, type: "pet", rarity: "rare", price: 150, art: "🐱" },
  { id: "pet.puppy", name: { en: "Puppy", ru: "Щенок" }, type: "pet", rarity: "rare", price: 150, art: "🐶" },
  { id: "pet.chick", name: { en: "Chick", ru: "Цыплёнок" }, type: "pet", rarity: "common", price: 80, art: "🐥" },
  { id: "pet.turtle", name: { en: "Turtle", ru: "Черепашка" }, type: "pet", rarity: "rare", price: 140, art: "🐢" },
  { id: "pet.baby-dragon", name: { en: "Baby Dragon", ru: "Дракончик" }, type: "pet", rarity: "legendary", price: 0, art: "🐲", rewardOnly: true },
  { id: "pet.spark-bot", name: { en: "Spark Bot", ru: "Робот Искорка" }, type: "pet", rarity: "epic", price: 0, art: "🤖", rewardOnly: true },
  // room decor (art = emoji)
  { id: "decor.plant", name: { en: "Potted Plant", ru: "Цветок в горшке" }, type: "decor", rarity: "common", price: 25, art: "🪴" },
  { id: "decor.lamp", name: { en: "Star Lamp", ru: "Звёздная лампа" }, type: "decor", rarity: "common", price: 35, art: "🌟" },
  { id: "decor.globe", name: { en: "Globe", ru: "Глобус" }, type: "decor", rarity: "common", price: 45, art: "🌍" },
  { id: "decor.telescope", name: { en: "Telescope", ru: "Телескоп" }, type: "decor", rarity: "rare", price: 110, art: "🔭" },
  { id: "decor.piano", name: { en: "Piano", ru: "Пианино" }, type: "decor", rarity: "rare", price: 130, art: "🎹" },
  { id: "decor.aquarium", name: { en: "Aquarium", ru: "Аквариум" }, type: "decor", rarity: "rare", price: 120, art: "🐠" },
  { id: "decor.rocket", name: { en: "Toy Rocket", ru: "Игрушечная ракета" }, type: "decor", rarity: "common", price: 60, art: "🚀" },
  { id: "decor.book-tower", name: { en: "Book Tower", ru: "Башня из книг" }, type: "decor", rarity: "epic", price: 0, art: "📚", rewardOnly: true },
  { id: "decor.trophy", name: { en: "Golden Trophy", ru: "Золотой кубок" }, type: "decor", rarity: "epic", price: 0, art: "🏆", rewardOnly: true },
];

export const ITEM_MAP = new Map(ITEMS.map((i) => [i.id, i]));
export const getItem = (id: string) => ITEM_MAP.get(id);
