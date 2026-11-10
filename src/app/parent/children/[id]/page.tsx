import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, BarChart3 } from "lucide-react";
import { z } from "zod";
import { getOwnedChild, requireParentArea } from "@/services/context";
import { currentAge } from "@/services/children";
import { getGameProfile } from "@/services/game";
import { COUNTRIES, getCurriculum } from "@/data/curricula";
import { SUBJECTS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import { SUBJECT_SLUGS } from "@/lib/validation";
import { AvatarView } from "@/components/avatar/AvatarView";
import { LightCard } from "@/components/ui";
import { getParentT } from "@/components/parent/server";
import { ChildEditForm } from "@/components/parent/ChildEditForm";
import { ChildDangerZone, RedoDiagnosticButton } from "@/components/parent/ChildDataActions";
import { CurriculumBadges } from "@/components/parent/CurriculumBadges";
import { PlayAsButton } from "@/components/parent/PlayAsButton";
import { LANG_KEYS, formatDate, goalLabel, gradeLabel } from "@/components/parent/labels";

type Slug = (typeof SUBJECT_SLUGS)[number];
const isSlug = (s: string): s is Slug => (SUBJECT_SLUGS as readonly string[]).includes(s);

export default async function ChildDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { store, parent } = await requireParentArea();
  if (!z.string().uuid().safeParse(id).success) notFound();
  const child = await getOwnedChild(store, parent.id, id);
  if (!child) notFound();
  const { t, locale } = await getParentT();
  const game = await getGameProfile(store, child.id);
  const curriculum = getCurriculum(child.curriculum_id);
  const country = COUNTRIES.find((c) => c.code === child.country_code);
  const lang = (["ru", "en", "uz"] as const).find((l) => l === child.interface_language) ?? "ru";

  const facts: [string, string][] = [
    [t("fieldAge"), t("years", { n: currentAge(child) })],
    [t("fieldGrade"), gradeLabel(child.current_grade, child.custom_level, t)],
    [t("fieldCountry"), country ? `${country.flag} ${tx(country.name, locale)}` : child.country_code],
    [t("fieldLanguage"), t(LANG_KEYS[lang])],
    [t("fieldSubjects"), child.preferred_subjects.length ? child.preferred_subjects.map((s) => tx(SUBJECTS.find((x) => x.slug === s)?.name, locale)).join(", ") : t("noneSelected")],
    [t("fieldGoal"), goalLabel(child.learning_goal, t)],
    [t("level"), `${game.level} · ${game.total_xp} XP`],
    [t("created"), formatDate(child.created_at, locale)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/parent/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> {t("backToOverview")}
      </Link>

      <LightCard className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid size-28 shrink-0 place-items-center rounded-3xl bg-cream">
            <AvatarView config={child.avatar_config} size={100} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("childDetails")}</p>
            <h1 className="truncate font-display text-3xl">{child.nickname}</h1>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts.map(([k, val]) => (
                <div key={k}>
                  <dt className="text-xs font-bold text-slate-500">{k}</dt>
                  <dd className="font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {curriculum && (
          <div className="mt-5 rounded-2xl bg-[#F7F8FC] p-4">
            <p className="text-xs font-bold text-slate-500">{t("fieldCurriculum")}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold">{tx(curriculum.name, locale)}</span>
              <CurriculumBadges c={curriculum} t={t} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{tx(curriculum.source, locale)}</p>
            {curriculum.status === "draft" && (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-amber-800">
                <AlertTriangle className="size-4" aria-hidden /> {t("draftNote")}
              </p>
            )}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-start gap-3">
          <PlayAsButton childId={child.id} nickname={child.nickname} />
          <Link href={`/parent/analytics?child=${child.id}`} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 font-display font-semibold text-ink hover:bg-slate-50">
            <BarChart3 className="size-4" aria-hidden /> {t("navAnalytics")}
          </Link>
        </div>
      </LightCard>

      <ChildEditForm
        key={`${child.nickname}-${child.age_years}-${child.current_grade}-${child.custom_level}-${child.interface_language}-${child.preferred_subjects.join(",")}`}
        child={{
          id: child.id,
          nickname: child.nickname,
          age: Math.min(17, Math.max(4, currentAge(child))),
          grade: child.current_grade,
          customLevel: child.custom_level,
          language: lang,
          subjects: child.preferred_subjects.filter(isSlug),
        }}
      />

      <LightCard className="space-y-3 p-6">
        <h2 className="font-display text-xl">{t("diagnostic")}</h2>
        <p className="text-sm text-slate-600">
          {child.assessment_completed_at ? t("diagnosticDone", { date: formatDate(child.assessment_completed_at, locale) }) : t("assessmentPending")}
        </p>
        {child.assessment_completed_at && (
          <>
            <p className="text-sm text-slate-600">{t("redoDiagnosticText")}</p>
            <RedoDiagnosticButton childId={child.id} />
          </>
        )}
      </LightCard>

      <ChildDangerZone childId={child.id} nickname={child.nickname} />
    </div>
  );
}
