import type { CodeBlock, Locale } from "@/types/content";

/**
 * Extra interface strings used only by the question components.
 * (Kept local so this folder does not need edits in src/lib/i18n/ui.ts; candidates to move there later.)
 */
type Entry = { en: string; ru: string; uz?: string };

const QL = {
  undo: { en: "Undo", ru: "Отменить", uz: "Bekor qilish" },
  moveUp: { en: "Move up", ru: "Выше", uz: "Yuqoriga" },
  moveDown: { en: "Move down", ru: "Ниже", uz: "Pastga" },
  removeItem: { en: "Take back", ru: "Убрать", uz: "Olib tashlash" },
  removeLast: { en: "Remove last", ru: "Убрать последний", uz: "Oxirgisini olib tashlash" },
  yourOrder: { en: "Your order", ru: "Твой порядок", uz: "Sizning tartibingiz" },
  tapInOrder: { en: "Tap the cards in the right order", ru: "Нажимай на карточки по порядку", uz: "Kartalarni tartib bilan bosing" },
  tapLetters: { en: "Tap the letters in order", ru: "Нажимай на буквы по порядку", uz: "Harflarni tartib bilan bosing" },
  yourWord: { en: "Your word", ru: "Твоё слово", uz: "Sizning so‘zingiz" },
  letter: { en: "Letter", ru: "Буква", uz: "Harf" },
  emptySlot: { en: "empty", ru: "пусто", uz: "bo‘sh" },
  itemsLeft: { en: "Cards", ru: "Карточки", uz: "Kartalar" },
  selected: { en: "selected", ru: "выбрано", uz: "tanlangan" },
  placedIn: { en: "in", ru: "в", uz: "ichida" },
  matchHint: { en: "Tap a card on the left, then its pair on the right", ru: "Нажми карточку слева, потом её пару справа", uz: "Chapdagi kartani, keyin uning juftini bosing" },
  pairedWith: { en: "paired with", ru: "в паре с", uz: "jufti" },
  option: { en: "Option", ru: "Вариант", uz: "Variant" },
  answerField: { en: "Answer", ru: "Ответ", uz: "Javob" },
  backspace: { en: "Delete", ru: "Стереть", uz: "O‘chirish" },
  minus: { en: "Minus", ru: "Минус", uz: "Minus" },
  comma: { en: "Comma", ru: "Запятая", uz: "Vergul" },
  drawHere: { en: "Trace the dotted line with your finger", ru: "Обведи пунктир пальцем", uz: "Nuqtali chiziq bo‘ylab chizing" },
  drawingArea: { en: "Drawing area", ru: "Поле для рисования", uz: "Chizish maydoni" },
  program: { en: "Program", ru: "Программа", uz: "Dastur" },
  blocks: { en: "Blocks", ru: "Блоки", uz: "Bloklar" },
  emptyProgram: { en: "Tap blocks to build a program", ru: "Нажимай на блоки, чтобы собрать программу", uz: "Dastur tuzish uchun bloklarni bosing" },
  unbalanced: { en: "Every repeat needs an end block", ru: "Каждому повтору нужен блок «Конец»", uz: "Har bir takrorlashga «Tugadi» bloki kerak" },
  robotField: { en: "Robot field", ru: "Поле робота", uz: "Robot maydoni" },
  playAgain: { en: "Play again", ru: "Ещё раз послушать", uz: "Yana tinglash" },
} satisfies Record<string, Entry>;

export type QLKey = keyof typeof QL;

export function ql(locale: Locale, key: QLKey): string {
  const e: Entry = QL[key];
  return (locale === "uz" ? e.uz ?? e.ru : e[locale]) ?? e.en;
}

const BLOCKS: Record<CodeBlock, Entry> = {
  forward: { en: "Forward", ru: "Вперёд", uz: "Oldinga" },
  left: { en: "Turn left", ru: "Налево", uz: "Chapga" },
  right: { en: "Turn right", ru: "Направо", uz: "O‘ngga" },
  repeat2: { en: "Repeat 2×", ru: "Повтори 2×", uz: "2× takrorla" },
  repeat3: { en: "Repeat 3×", ru: "Повтори 3×", uz: "3× takrorla" },
  end: { en: "End", ru: "Конец", uz: "Tugadi" },
};

export function blockLabel(locale: Locale, b: CodeBlock): string {
  const e = BLOCKS[b];
  return (locale === "uz" ? e.uz ?? e.ru : e[locale]) ?? e.en;
}
