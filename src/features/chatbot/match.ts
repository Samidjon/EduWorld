import type { LText, Locale } from "@/types/content";
import type { KbEntry } from "./knowledge";

/**
 * Keyword matcher for the prepared knowledge base (pure, unit-tested).
 * - normalises text (case, ё→е, punctuation)
 * - drops question/stop words ("что такое", "what is"…)
 * - compares words by a short stem so Russian word forms match ("дроби" ~ "дробь", "умножать" ~ "умножение")
 * - a keyword phrase scores by the share of its words found; the best entry must pass a threshold,
 *   otherwise the bot honestly answers that it doesn't know yet.
 */

const STOP = new Set([
  // ru
  "что", "такое", "это", "как", "кто", "найти", "решить", "будет", "называется", "нужны", "нужен", "нужна", "делать", "сделать", "работает", "есть", "был", "была", "будет", "быть", "мне", "нам", "а", "и", "в", "во", "на", "по", "о", "об", "про", "мне", "меня", "я", "ты", "у", "к", "с", "со", "же", "ли", "ну", "или", "из", "для", "расскажи", "объясни", "скажи", "подскажи", "пожалуйста", "можно", "можешь", "можете", "хочу", "знать", "узнать", "зачем", "почему", "где", "когда", "какой", "какая", "какие", "каких", "сколько", "мой", "моя", "мои", "тебя", "нужно", "надо", "еще", "ещё", "очень", "просто", "тема", "теме", "темы", "такой", "такая",
  // en
  "what", "is", "are", "the", "a", "an", "to", "of", "in", "on", "about", "me", "my", "i", "you", "your", "please", "can", "could", "tell", "explain", "how", "why", "do", "does", "it", "and", "or", "for", "with", "want", "know", "topic",
  // uz
  "nima", "haqida", "qanday", "menga", "iltimos",
]);

export function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s+\-×*/]/gu, " ").replace(/\s+/g, " ").trim();
}

/**
 * Crude stem: drop the last letter of words of 5+ letters and keep at most 5 letters,
 * so "дроби"/"дробь" → "дроб", "умножение"/"умножать" → "умнож", "fractions" → "fract".
 */
export function stem(w: string): string {
  return w.length >= 5 ? w.slice(0, Math.min(5, w.length - 1)) : w;
}

function words(s: string, dropStop: boolean): string[] {
  return normalize(s).split(" ").filter((w) => w && (!dropStop || !STOP.has(w)));
}

export interface MatchResult { entry: KbEntry | null; score: number }

/**
 * An entry is accepted when either a keyword phrase appears in the question as is, or the
 * entry's keywords cover MORE than half of the question's content words (numbers ignored).
 * This keeps "столица Узбекистана" from matching the Uzbek-language lesson by one word.
 */
export function findAnswer(question: string, kb: KbEntry[], locale: Locale): MatchResult {
  let qWords = words(question, true).filter((w) => !/^\d+$/.test(w));
  if (!qWords.length) qWords = words(question, false).filter((w) => !/^\d+$/.test(w));
  const qStems = qWords.map(stem);
  const qText = ` ${normalize(question)} `;
  let best: MatchResult = { entry: null, score: 0 };

  for (const e of kb) {
    const phrases = [...e.keywords.ru, ...e.keywords.en, ...(e.keywords.uz ?? [])];
    let exact = 0;
    let phraseScore = 0;
    const kwStems = new Set<string>();
    for (const p of phrases) {
      const norm = normalize(p);
      if (!norm) continue;
      if (qText.includes(` ${norm} `)) exact = Math.max(exact, 1 + norm.split(" ").length * 0.5);
      const pw = words(p, true);
      pw.forEach((w) => kwStems.add(stem(w)));
      if (!pw.length) continue;
      const hit = pw.filter((w) => qStems.includes(stem(w))).length;
      if (hit) phraseScore = Math.max(phraseScore, hit / pw.length + 0.25 * (hit - 1));
    }
    const covered = qStems.filter((s) => kwStems.has(s)).length;
    const coverage = qStems.length ? covered / qStems.length : 0;
    const accepted = exact > 0 || (phraseScore > 0 && coverage > 0.5);
    if (!accepted) continue;
    const score = Math.max(exact, phraseScore) + coverage + (e.boost ?? 0);
    if (score > best.score) best = { entry: e, score };
  }
  void locale;
  return best;
}

export function answerText(r: MatchResult, unknown: LText): LText {
  return r.entry ? r.entry.answer : unknown;
}
