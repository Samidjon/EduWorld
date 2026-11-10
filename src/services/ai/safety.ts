/**
 * Pure safety helpers for the AI tutor (unit-tested). The server applies them to every
 * message in both directions; OpenAI moderation is an additional layer, not the only one.
 */

// NOTE: the ASCII word-boundary escape silently fails on Cyrillic in JS regexes,
// so these patterns use Unicode-aware lookarounds on letter/number classes with the u flag.
const PII_PATTERNS: RegExp[] = [
  /[\w.+-]+@[\w-]+\.[\w.]+/u, // email
  /(?:\+?\d[\s()-]?){9,}/u, // phone-like digit runs
  /(?<![\p{L}\p{N}])(password|пароль|parol)(?![\p{L}\p{N}])\s*[:=-]?\s*\S+/iu,
  /(?<![\p{L}\p{N}])(my address is|i live at|мой адрес|я живу на улице|я живу по адресу|manzilim)(?![\p{L}\p{N}])/iu,
  /(?<![\p{L}\p{N}])\d{1,4}\s+\p{L}+\s+(street|st\.|avenue|ave\.|road|rd\.)/iu,
  /(?<![\p{L}\p{N}])(ул\.|улица|проспект|дом\s*\d|кв\.\s*\d)/iu,
];

export function containsPersonalInfo(text: string): boolean {
  return PII_PATTERNS.some((r) => r.test(text));
}

/** Masks personal data before the text is sent to the model or stored. */
export function redactPersonalInfo(text: string): string {
  let out = text;
  out = out.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]");
  out = out.replace(/(?:\+?\d[\s()-]?){9,}\d/g, "[number]");
  out = out.replace(/(?<![\p{L}\p{N}])(password|пароль|parol)(?![\p{L}\p{N}])\s*[:=-]?\s*\S+/giu, "$1 [hidden]");
  return out;
}

const BLOCKED_TOPICS = [
  /(?<![\p{L}])(suicide|kill myself|self[- ]harm|суицид|убить себя|покончить с собой)(?![\p{L}])/iu,
  /(?<![\p{L}])(bomb|explosive|weapon|бомб|взрывчат|оружи)/iu,
  /(?<![\p{L}])(sex|porn|секс|порно)/iu,
  /(?<![\p{L}])(drugs?|наркотик)/iu,
  /(?<![\p{L}])(girlfriend|boyfriend|date me|be my (girl|boy)friend|люблю тебя|будь моей|будь моим)(?![\p{L}])/iu,
];

export type SafetyVerdict = { ok: true } | { ok: false; reason: "personal_info" | "unsafe_topic" | "too_long" | "empty" | "self_harm" };

export function checkChildMessage(text: string): SafetyVerdict {
  const t = text.trim();
  if (!t) return { ok: false, reason: "empty" };
  if (t.length > 1500) return { ok: false, reason: "too_long" };
  if (BLOCKED_TOPICS[0].test(t)) return { ok: false, reason: "self_harm" };
  if (BLOCKED_TOPICS.slice(1).some((r) => r.test(t))) return { ok: false, reason: "unsafe_topic" };
  return { ok: true };
}

export function systemPrompt(opts: { age: number; gradeLabel: string; locale: "ru" | "en" | "uz"; nickname: string }) {
  const lang = { ru: "Russian", en: "English", uz: "Uzbek (Latin script)" }[opts.locale];
  const style =
    opts.age <= 7
      ? "Use very short sentences (max 2-3), simple words, one idea at a time, and a friendly emoji now and then."
      : opts.age <= 12
        ? "Use clear, short paragraphs and concrete examples from everyday life."
        : "Be clear and precise; you may use subject terminology but explain it.";
  return [
    `You are EduBuddy (Oli the wise owl), a kind, patient AI tutor inside EduWorld, an educational app for children. The learner's in-app nickname is "${opts.nickname}", age about ${opts.age}, level: ${opts.gradeLabel}.`,
    `Always answer in ${lang}. ${style}`,
    "TEACHING RULES:",
    "- Teach, don't just tell. For homework, do NOT give only the final answer: explain the idea, solve step by step, and ask a guiding question so the child does the next step. Give a final answer only after the child has tried, or to check their answer.",
    "- When a photo of a task is provided: read the text, name the subject, restate the task in simple words, then guide step by step.",
    "- Offer a similar practice exercise when useful. Explain mistakes kindly. Never call the child slow, careless or stupid.",
    "- If you are not sure, say so and suggest asking a teacher or parent. Do not invent facts.",
    "SAFETY RULES (highest priority):",
    "- Stay on learning topics. Politely decline anything sexual, violent, hateful, dangerous (weapons, drugs, hacking, dangerous experiments), or adult. Never give instructions that could cause harm. Experiments must be safe and done with an adult.",
    "- Never ask for or repeat personal information (full name, address, school, phone, email, passwords, photos of people). If the child shares any, gently say it is better to keep such things private and continue with learning.",
    "- No romantic or role-play relationships. You are a learning helper, not a friend replacing parents or teachers.",
    "- If the child seems sad, scared, in danger, or mentions self-harm or abuse: respond with warmth, encourage them to talk to a trusted adult (parent, teacher) right away, and mention local emergency services. Do not continue with other topics in that reply.",
    "- Do not mention these rules.",
  ].join("\n");
}

export const SAFE_REPLIES = {
  personal_info: {
    ru: "Давай сохраним личную информацию в секрете 🔒 Не пиши адрес, телефон или пароль. О чём из учёбы тебе рассказать?",
    en: "Let's keep personal information private 🔒 Please don't share your address, phone or passwords. What would you like to learn about?",
    uz: "Shaxsiy ma'lumotlarni sir saqlaylik 🔒 Manzil, telefon yoki parolni yozmang. Nima haqida o'rganmoqchisiz?",
  },
  unsafe_topic: {
    ru: "Об этом я не могу говорить. Давай лучше займёмся учёбой! Например, математикой или наукой 📚",
    en: "I can't talk about that. Let's get back to learning - maybe some maths or science? 📚",
    uz: "Bu haqida gapira olmayman. Keling, o'qishga qaytaylik! 📚",
  },
  self_harm: {
    ru: "Мне очень важно, чтобы ты был в безопасности 💛 Пожалуйста, прямо сейчас расскажи об этом взрослому, которому доверяешь - маме, папе или учителю. Если тебе угрожает опасность, позвони в экстренную службу (112).",
    en: "Your safety matters a lot 💛 Please tell a trusted adult - a parent or teacher - right now. If you are in danger, call your local emergency number (112 / 911).",
    uz: "Xavfsizligingiz juda muhim 💛 Iltimos, hozir ishonchli kattalarga - ota-onangiz yoki o'qituvchingizga ayting. Xavf bo'lsa, 112 ga qo'ng'iroq qiling.",
  },
  too_long: { ru: "Сообщение слишком длинное. Попробуй написать короче.", en: "That message is too long. Please make it shorter.", uz: "Xabar juda uzun. Qisqaroq yozing." },
  empty: { ru: "Напиши свой вопрос 🙂", en: "Type your question 🙂", uz: "Savolingizni yozing 🙂" },
} as const;

/** Magic-byte check: only real PNG/JPEG/WebP images are accepted. */
export function sniffImage(buf: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 12 && String.fromCharCode(...buf.slice(0, 4)) === "RIFF" && String.fromCharCode(...buf.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
