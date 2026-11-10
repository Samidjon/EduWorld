import Link from "next/link";
import { requireChild } from "@/services/context";
import { childOverview, topicStatus } from "@/services/child-view";
import { topoOrder } from "@/features/adaptive-learning/engine";
import { TOPICS, lessonsForTopic } from "@/data/content";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";
import { Character } from "@/components/characters/Character";

const ICON = { mastered: "⭐", placed: "✓", learning: "📘", needs_review: "🔁", new: "○" } as const;

export default async function RoadmapPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const { recs, worlds, pmap, grade } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const reason = { review_due: ut(L, "reviewDue"), needs_review: ut(L, "needsReview"), foundation: ut(L, "reasonFoundation"), next_step: ut(L, "reasonNext"), stretch: ut(L, "reasonStretch") };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Character id="luna" portrait size={64} animation="wave" />
        <div>
          <h1 className="font-display text-3xl">{ut(L, "navRoadmap")}</h1>
          <p className="opacity-80">{L === "en" ? "Your personal route, built from your starting adventure and every answer since." : "Твой личный маршрут: он строится по стартовому приключению и всем ответам."}</p>
        </div>
      </div>

      <section className="glass rounded-[2rem] p-5">
        <h2 className="font-display text-2xl">🧭 {L === "en" ? "Next stops" : "Следующие остановки"}</h2>
        <ol className="relative mt-4 space-y-4 border-l-4 border-dashed border-sun/50 pl-6">
          {recs.map((r, i) => (
            <li key={r.topicId} className="relative">
              <span className="absolute -left-[38px] top-1 grid size-8 place-items-center rounded-full bg-sun font-display text-ink">{i + 1}</span>
              <Link href={r.reason === "review_due" ? `/play/review/${r.topicId}` : `/play/lessons/${r.lesson!.id}`} className="block rounded-2xl bg-white/5 p-3 hover:bg-white/10">
                <span className="font-bold">{tx(r.topic.title, L)}</span>
                <span className="block text-sm text-lavender">{reason[r.reason]} · {worlds.find((w) => w.world.slug === r.topic.world) && tx(worlds.find((w) => w.world.slug === r.topic.world)!.world.name, L)}</span>
              </Link>
            </li>
          ))}
          {!recs.length && <li>{L === "en" ? "Everything here is mastered - explore the map!" : "Всё освоено - исследуй карту!"}</li>}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {worlds.filter((w) => w.unlocked).map(({ world }) => {
          const topics = topoOrder(TOPICS.filter((t) => t.world === world.slug && t.grades[0] <= grade + 1));
          if (!topics.length) return null;
          return (
            <section key={world.slug} className="glass rounded-3xl p-4">
              <h3 className="font-display text-xl">{world.emoji} {tx(world.name, L)}</h3>
              <ul className="mt-2 space-y-1.5">
                {topics.map((t) => {
                  const st = topicStatus(pmap.get(t.id));
                  const l = lessonsForTopic(t.id)[0];
                  return (
                    <li key={t.id}>
                      <Link href={l ? `/play/lessons/${l.id}` : "#"} className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-white/10">
                        <span className="w-6 text-center" aria-hidden>{ICON[st]}</span>
                        <span className={st === "mastered" ? "opacity-70" : ""}>{tx(t.title, L)}</span>
                        <span className="ml-auto text-xs opacity-60">{t.grades[0] < 1 ? (L === "en" ? "pre" : "дошк.") : `${t.grades[0]}–${t.grades[1]}`}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
