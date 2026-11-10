import Link from "next/link";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import { requireParentArea } from "@/services/context";
import { hasAnyActivity, loadChildAnalytics, type DayActivity } from "@/services/analytics";
import { getTopic } from "@/data/topics";
import { SUBJECTS, WORLDS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import type { PT } from "@/lib/i18n/parent";
import type { Locale } from "@/types/content";
import { AvatarView } from "@/components/avatar/AvatarView";
import { LightCard } from "@/components/ui";
import { cn } from "@/lib/cn";
import { getParentT } from "@/components/parent/server";
import { PageHeader } from "@/components/parent/ParentShell";
import { Bars, PercentBar } from "@/components/parent/Bars";

const shortDate = (iso: string, locale: Locale) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString(locale === "en" ? "en-GB" : locale === "uz" ? "uz-UZ" : "ru-RU", { day: "numeric", month: "short", timeZone: "UTC" });
const weekdayShort = (iso: string, t: PT) => t(`day${new Date(iso + "T00:00:00Z").getUTCDay()}` as "day0");

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl bg-[#F7F8FC] p-4 text-center text-sm text-slate-500">{text}</p>;
}

function ActivityBlock({ title, series, t, locale, daily }: { title: string; series: DayActivity[]; t: PT; locale: Locale; daily: boolean }) {
  const minutes = series.reduce((s, d) => s + d.minutes, 0);
  const lessons = series.reduce((s, d) => s + d.lessons, 0);
  const label = (d: DayActivity, i: number) => (daily ? weekdayShort(d.date, t) : i % 5 === 4 || i === series.length - 1 ? shortDate(d.date, locale) : "");
  const titleOf = (d: DayActivity) => t("anDayLabel", { d: shortDate(d.date, locale), m: d.minutes, l: d.lessons });
  return (
    <LightCard className="p-6">
      <h2 className="font-display text-xl">{title}</h2>
      {!hasAnyActivity(series) ? (
        <div className="mt-4"><Empty text={t("anNoData")} /></div>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-500">{t("anTotalMinutes", { n: minutes, l: lessons })}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t("anMinutes")}</p>
              <Bars ariaLabel={`${title} — ${t("anMinutes")}`} showValues={daily} data={series.map((d, i) => ({ key: d.date, label: label(d, i), value: d.minutes, title: titleOf(d) }))} />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t("anLessons")}</p>
              <Bars ariaLabel={`${title} — ${t("anLessons")}`} color="#5FC79A" showValues={daily} data={series.map((d, i) => ({ key: d.date, label: label(d, i), value: d.lessons, title: titleOf(d) }))} />
            </div>
          </div>
        </>
      )}
    </LightCard>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ child?: string | string[] }> }) {
  const { store, parent } = await requireParentArea();
  const { t, locale } = await getParentT();
  const children = await store.select("child_profiles", { parent_id: parent.id }, { orderBy: "created_at" });

  if (children.length === 0) {
    return (
      <div>
        <PageHeader title={t("anTitle")} intro={t("anIntro")} />
        <LightCard className="space-y-3 text-center">
          <p className="text-slate-600">{t("anNoChildren")}</p>
          <Link href="/parent/children/new" className="font-bold text-brand-blue underline">{t("addChild")}</Link>
        </LightCard>
      </div>
    );
  }

  const sp = await searchParams;
  const wanted = Array.isArray(sp.child) ? sp.child[0] : sp.child;
  const child = children.find((c) => c.id === wanted) ?? children[0];
  const a = await loadChildAnalytics(store, child.id);
  const subjectColor = (slug: string) => WORLDS.find((w) => w.subject === slug)?.palette.from ?? "#5799E8";
  const totalWeekLessons = a.dynamics.reduce((s, w) => s + w.lessons, 0);

  return (
    <div className="space-y-6">
      <PageHeader title={t("anTitle")} intro={t("anIntro")} />

      {children.length > 1 && (
        <nav aria-label={t("anChooseChild")} className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c) => {
            const active = c.id === child.id;
            return (
              <Link
                key={c.id}
                href={`/parent/analytics?child=${c.id}`}
                aria-current={active ? "page" : undefined}
                className={cn("flex shrink-0 items-center gap-2 rounded-2xl border py-1.5 pl-1.5 pr-4 font-bold transition", active ? "border-brand-blue bg-brand-blue text-white" : "border-slate-200 bg-white text-ink hover:bg-slate-50")}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-cream"><AvatarView config={c.avatar_config} size={32} showPet={false} /></span>
                {c.nickname}
              </Link>
            );
          })}
        </nav>
      )}

      <h2 className="sr-only">{child.nickname}</h2>

      <LightCard className="p-6">
        <h2 className="font-display text-xl">{t("anSubjects")}</h2>
        <p className="text-sm text-slate-500">{t("anSubjectsHint")}</p>
        {a.subjects.length === 0 ? (
          <div className="mt-4"><Empty text={t("anNoData")} /></div>
        ) : (
          <ul className="mt-4 space-y-4">
            {a.subjects.map((s) => {
              const name = tx(SUBJECTS.find((x) => x.slug === s.subject)?.name, locale) || s.subject;
              const pct = Math.round(s.accuracy * 100);
              return (
                <li key={s.subject}>
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="font-bold">{name}</span>
                    <span className="text-sm text-slate-600"><span className="font-bold text-ink">{pct}%</span> · {t("anAnswers", { n: s.total })}</span>
                  </div>
                  <PercentBar value={s.accuracy} color={subjectColor(s.subject)} label={`${name}: ${pct}%`} />
                </li>
              );
            })}
          </ul>
        )}
      </LightCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <LightCard className="p-6">
          <h2 className="flex items-center gap-2 font-display text-xl"><CheckCircle2 className="size-5 text-emerald-600" aria-hidden />{t("anMastered")}</h2>
          {a.mastered.length === 0 ? (
            <div className="mt-4"><Empty text={t("anNoMastered")} /></div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {a.mastered.map((p) => {
                const topic = getTopic(p.topic_id);
                return (
                  <li key={p.topic_id} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{tx(topic?.title, locale) || p.topic_id}</span>
                      <span className="block text-xs text-slate-500">{tx(SUBJECTS.find((s) => s.slug === topic?.subject)?.name, locale)}</span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-emerald-700">{t("anMastery", { p: Math.round(p.mastery_level * 100) })}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </LightCard>

        <LightCard className="p-6">
          <h2 className="flex items-center gap-2 font-display text-xl"><RefreshCcw className="size-5 text-amber-600" aria-hidden />{t("anReview")}</h2>
          <p className="text-sm text-slate-500">{t("anReviewHint")}</p>
          {a.review.length === 0 ? (
            <div className="mt-4"><Empty text={t("anNoReview")} /></div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {a.review.map((p) => {
                const topic = getTopic(p.topic_id);
                return (
                  <li key={p.topic_id} className="py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate font-semibold">{tx(topic?.title, locale) || p.topic_id}</span>
                      <span className="shrink-0 text-xs font-bold text-amber-700">{t("anMastery", { p: Math.round(p.mastery_level * 100) })}</span>
                    </div>
                    <div className="mt-1"><PercentBar value={p.mastery_level} color="#F2A93B" label={tx(topic?.title, locale) || p.topic_id} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </LightCard>
      </div>

      <ActivityBlock title={t("anWeek")} series={a.week} t={t} locale={locale} daily />
      <ActivityBlock title={t("anMonth")} series={a.month} t={t} locale={locale} daily={false} />

      <LightCard className="p-6">
        <h2 className="font-display text-xl">{t("anDynamics")}</h2>
        {totalWeekLessons === 0 ? (
          <div className="mt-4"><Empty text={t("anNoData")} /></div>
        ) : (
          <div className="mt-4">
            <Bars
              ariaLabel={t("anDynamics")}
              color="#B8A5EF"
              data={a.dynamics.map((w) => ({ key: w.weekStart, label: shortDate(w.weekStart, locale), value: w.lessons, title: t("anWeekLabel", { d: shortDate(w.weekStart, locale), l: w.lessons }) }))}
            />
          </div>
        )}
      </LightCard>
    </div>
  );
}
