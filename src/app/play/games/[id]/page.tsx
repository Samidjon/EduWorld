import { notFound } from "next/navigation";
import { requireChild } from "@/services/context";
import { getMiniGame } from "@/data/minigames";
import { gradeLevel } from "@/features/adaptive-learning/engine";
import { currentAge } from "@/services/children";
import { GameShell } from "@/components/minigames/GameShell";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";

export default async function GamePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ level?: string }> }) {
  const { id } = await params;
  const meta = getMiniGame(id);
  if (!meta) notFound();
  const ctx = await requireChild();
  if (!ctx.settings.minigamesEnabled) return <p className="glass rounded-3xl p-6 text-center">{ut(ctx.child.interface_language as Locale, "featureDisabled")}</p>;
  const g = gradeLevel(ctx.child.current_grade, ctx.child.custom_level, currentAge(ctx.child));
  const sp = await searchParams;
  const auto: 1 | 2 | 3 = g <= 0 ? 1 : g <= 2 ? 2 : 3;
  const level = (["1", "2", "3"].includes(sp.level ?? "") ? Number(sp.level) : auto) as 1 | 2 | 3;
  return <GameShell id={meta.id} level={level} />;
}
