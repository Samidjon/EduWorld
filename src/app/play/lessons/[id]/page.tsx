import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChild } from "@/services/context";
import { getLesson, lessonsForTopic, TOPIC_MAP } from "@/data/content";
import { getWorld } from "@/data/worlds";
import { getMiniGame } from "@/data/minigames";
import { childOverview, topicStatus } from "@/services/child-view";
import { missingPrerequisites } from "@/features/adaptive-learning/engine";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";
import { Character } from "@/components/characters/Character";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const topic = TOPIC_MAP.get(lesson.topicId)!;
  const world = getWorld(topic.world)!;
  const { pmap, worlds } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const p = pmap.get(topic.id);
  const st = topicStatus(p);
  const missing = missingPrerequisites(topic, pmap, TOPIC_MAP);
  const unlockedWorld = worlds.find((w) => w.world.slug === world.slug)?.unlocked;
  const siblings = lessonsForTopic(topic.id);
  const attempts = await ctx.store.select("lesson_attempts", { child_id: ctx.child.id, lesson_id: lesson.id, completed: true }, { orderBy: "completed_at", desc: true, limit: 5 });
  const game = lesson.game ? getMiniGame(lesson.game) : null;
  const statusLabel = { mastered: ut(L, "mastered"), placed: ut(L, "learning"), learning: ut(L, "learning"), needs_review: ut(L, "needsReview"), new: ut(L, "notStarted") }[st];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/play/worlds/${world.slug}`} className="text-sm opacity-80">← {tx(world.name, L)}</Link>
      <section className="relative overflow-hidden rounded-[2rem] p-6" style={{ background: `linear-gradient(135deg, ${world.palette.from}cc, ${world.palette.to}cc)` }}>
        <div className="relative z-10 max-w-[62%] text-white drop-shadow">
          <p className="text-xs font-bold uppercase tracking-wide">{tx(topic.title, L)} · {statusLabel}</p>
          <h1 className="mt-1 font-display text-3xl">{tx(lesson.title, L)}</h1>
          <p className="mt-2">🎯 {tx(lesson.objective, L)}</p>
          <p className="mt-2 text-sm">⏱ {lesson.durationMin} {ut(L, "minutes")} · {"⭐".repeat(lesson.difficulty)}</p>
        </div>
        <div className="absolute -bottom-3 right-3"><Character id={lesson.character} size={130} animation="idle" /></div>
      </section>

      <div className="glass rounded-3xl p-4 space-y-2 text-sm">
        <p>📘 {ut(L, "stepIntro")} → {ut(L, "stepExplain")} → {ut(L, "stepExample")} → {ut(L, "stepPractice")} ({lesson.practice.length}) {game ? `→ ${game.emoji} ${tx(game.title, L)}` : ""} → {ut(L, "stepCheck")} ({lesson.check.length}) → 🎁</p>
        {p && <p>{L === "en" ? "Mastery" : "Освоение"}: <b>{Math.round(p.mastery_level * 100)}%</b> · {L === "en" ? "answers" : "ответов"}: {p.attempts_count}</p>}
        {attempts.length > 0 && <p>{L === "en" ? "Best score" : "Лучший результат"}: <b>{Math.round(Math.max(...attempts.map((a) => a.score ?? 0)) * 100)}%</b></p>}
      </div>

      {missing.length > 0 && (
        <div className="rounded-3xl border border-sun/40 bg-sun/10 p-4">
          <p className="font-semibold">💡 {L === "en" ? "It will be easier after:" : "Будет легче, если сначала пройти:"}</p>
          <ul className="mt-2 space-y-1">
            {missing.map((m) => {
              const l = lessonsForTopic(m.id)[0];
              return <li key={m.id}>{l ? <Link className="underline" href={`/play/lessons/${l.id}`}>{tx(m.title, L)}</Link> : tx(m.title, L)}</li>;
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {unlockedWorld ? (
          <Link href={`/play/lessons/${lesson.id}/learn`} className="inline-flex h-14 items-center rounded-2xl bg-gradient-to-b from-[#ffe08a] to-[#f7bf3c] px-7 font-display text-lg text-[#4a3505] shadow-[var(--shadow-button)]">
            {attempts.length ? ut(L, "tryAgain") : ut(L, "start")} →
          </Link>
        ) : (
          <p className="glass rounded-2xl p-3">🔒 {ut(L, "locked")}</p>
        )}
        {st === "mastered" && (
          <Link href={`/play/review/${topic.id}`} className="glass inline-flex h-14 items-center rounded-2xl px-6 font-display">🔁 {ut(L, "review")}</Link>
        )}
      </div>

      {siblings.length > 1 && (
        <div className="space-y-2">
          <h2 className="font-display text-xl">{ut(L, "lessons")}</h2>
          {siblings.map((s) => (
            <Link key={s.id} href={`/play/lessons/${s.id}`} className={`glass block rounded-2xl p-3 ${s.id === lesson.id ? "ring-2 ring-sun" : ""}`}>{tx(s.title, L)}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
