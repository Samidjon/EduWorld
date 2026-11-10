import Link from "next/link";
import { CalendarClock, ChevronRight, Coins, Flame, GraduationCap, Sparkles, Star, Trophy } from "lucide-react";
import { AvatarView } from "@/components/avatar/AvatarView";
import { LightCard } from "@/components/ui";
import { getTopic } from "@/data/topics";
import { SUBJECTS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import type { PT, ParentKey } from "@/lib/i18n/parent";
import type { ChildOverview } from "@/services/analytics";
import { currentAge } from "@/services/children";
import type { Locale } from "@/types/content";
import { formatDate, gradeLabel } from "./labels";
import { PlayAsButton } from "./PlayAsButton";

/** One child's overview card (server component). Shows only this child's own numbers - never a comparison. */
export function ChildSummaryCard({ o, t, locale }: { o: ChildOverview; t: PT; locale: Locale }) {
  const { child, game } = o;
  const stats: { icon: typeof Star; label: string; value: string | number }[] = [
    { icon: Star, label: t("level"), value: game?.level ?? 1 },
    { icon: Sparkles, label: t("xp"), value: game?.total_xp ?? 0 },
    { icon: Coins, label: t("coins"), value: game?.coins ?? 0 },
    { icon: Flame, label: t("streak"), value: game?.streak ?? 0 },
    { icon: Trophy, label: t("masteredTopics"), value: o.masteredCount },
    { icon: GraduationCap, label: t("lessonsThisWeek"), value: o.lessonsThisWeek },
  ];
  return (
    <LightCard className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-cream">
          <AvatarView config={child.avatar_config} size={84} showPet={false} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-2xl">{child.nickname}</h2>
          <p className="text-slate-600">
            {t("years", { n: currentAge(child) })} · {gradeLabel(child.current_grade, child.custom_level, t)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarClock className="size-4" aria-hidden />
            {t("lastActivity")}: {o.lastActivity ? formatDate(o.lastActivity, locale) : t("never")}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-[#F7F8FC] p-3">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Icon className="size-4 text-brand-blue" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 font-display text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("recommendations")}</h3>
        {!child.assessment_completed_at ? (
          <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">{t("assessmentPending")}</p>
        ) : o.recommendations.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t("noRecommendations")}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {o.recommendations.map((r) => {
              const topic = getTopic(r.topicId);
              const subject = SUBJECTS.find((s) => s.slug === topic?.subject);
              return (
                <li key={r.topicId} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{tx(topic?.title, locale) || r.topicId}</span>
                    <span className="block text-xs text-slate-500">{tx(subject?.name, locale)}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-bold text-brand-blue">{t(`reason_${r.reason}` as ParentKey)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3">
        <PlayAsButton childId={child.id} nickname={child.nickname} />
        <Link href={`/parent/children/${child.id}`} className="inline-flex h-11 items-center gap-1 rounded-2xl border border-slate-200 bg-white px-5 font-display font-semibold text-ink hover:bg-slate-50">
          {t("details")} <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </LightCard>
  );
}
