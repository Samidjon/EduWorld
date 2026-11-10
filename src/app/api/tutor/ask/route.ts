import { z } from "zod";
import { route } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { apiChild, HttpError } from "@/services/context";
import { KNOWLEDGE, UNKNOWN_ANSWER } from "@/features/chatbot/knowledge";
import { findAnswer } from "@/features/chatbot/match";
import { checkChildMessage, containsPersonalInfo, SAFE_REPLIES } from "@/services/ai/safety";
import { tx } from "@/lib/i18n/text";
import type { Locale } from "@/types/content";

/**
 * EduBuddy without AI: answers come only from the prepared knowledge base
 * (src/features/chatbot/knowledge.ts). Nothing is sent to external services and
 * questions are not stored. Unknown questions get an honest "I don't know yet".
 */
export const POST = route(z.object({ message: z.string().max(1500) }), async ({ message }) => {
  const ctx = await apiChild();
  if (!ctx.settings.aiEnabled) throw new HttpError(403, "feature_disabled");
  rateLimit(`bot:${ctx.child.id}`, 30, 60_000);
  const locale = ctx.child.interface_language as Locale;

  const verdict = checkChildMessage(message);
  if (!verdict.ok) {
    const key = verdict.reason === "self_harm" ? "self_harm" : verdict.reason === "unsafe_topic" ? "unsafe_topic" : verdict.reason;
    return { reply: SAFE_REPLIES[key][locale], known: false };
  }
  if (containsPersonalInfo(message)) return { reply: SAFE_REPLIES.personal_info[locale], known: false };

  const match = findAnswer(message, KNOWLEDGE, locale);
  if (!match.entry) return { reply: tx(UNKNOWN_ANSWER, locale), known: false };
  return {
    reply: tx(match.entry.answer, locale),
    known: true,
    link: match.entry.link ? { href: match.entry.link.href, label: tx(match.entry.link.label, locale) } : null,
  };
});
