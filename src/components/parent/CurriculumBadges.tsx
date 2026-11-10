import type { Curriculum } from "@/types/content";
import type { PT } from "@/lib/i18n/parent";
import { cn } from "@/lib/cn";

/** Status badge + "not official" marker for a curriculum (server- and client-safe). */
export function CurriculumBadges({ c, t }: { c: Curriculum; t: PT }) {
  const status = { draft: t("statusDraft"), reviewed: t("statusReviewed"), published: t("statusPublished"), archived: t("statusArchived") }[c.status];
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", c.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>{status}</span>
      {!c.official && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">{t("notOfficial")}</span>}
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">v{c.version}</span>
    </span>
  );
}
