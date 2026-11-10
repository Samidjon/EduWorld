import { requireChild } from "@/services/context";
import { TutorChat } from "@/features/ai-tutor/TutorChat";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function TutorPage() {
  const ctx = await requireChild();
  if (!ctx.settings.aiEnabled) return <p className="glass rounded-3xl p-6 text-center">{ut(ctx.child.interface_language as Locale, "featureDisabled")}</p>;
  return <TutorChat />;
}
