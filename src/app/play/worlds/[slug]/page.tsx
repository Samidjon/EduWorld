import Link from "next/link";
import { notFound } from "next/navigation";
import { requireChild } from "@/services/context";
import { childOverview, topicStatus } from "@/services/child-view";
import { getWorld, BOSSES } from "@/data/worlds";
import { lessonsForTopic, topicsForWorld, TOPIC_MAP } from "@/data/content";
import { isUnderstood, missingPrerequisites, topoOrder } from "@/features/adaptive-learning/engine";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale } from "@/types/content";
import { Character } from "@/components/characters/Character";
import { RingStatic } from "@/components/shared/RingStatic";

const STATUS_STYLE = {
  mastered: { ring: "#9BDDB7", icon: "⭐" },
  placed: { ring: "#A8D8F0", icon: "✓" },
  learning: { ring: "#FFD76B", icon: "📘" },
  needs_review: { ring: "#FF967D", icon: "🔁" },
  new: { ring: "rgba(255,255,255,0.4)", icon: "✨" },
};

export default async function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const { worlds, pmap, grade } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const info = worlds.find((w) => w.world.slug === slug)!;

  if (!info.unlocked) {
    return (
      <div className="glass mx-auto max-w-lg rounded-[2rem] p-6 text-center space-y-3">
        <div className="text-6xl" aria-hidden>🔒</div>
        <h1 className="font-display text-3xl">{tx(world.name, L)}</h1>
        <p>{ut(L, "needsTopics")}</p>
        <ul className="space-y-2">
          {world.unlockTopics.map((id) => {
            const lesson = lessonsForTopic(id)[0];
            return (
              <li key={id}>
                <Link className="glass block rounded-2xl p-3 font-semibold hover:bg-white/15" href={lesson ? `/play/lessons/${lesson.id}` : "/play/map"}>
                  {isUnderstood(pmap.get(id)) ? "✅" : "📘"} {tx(TOPIC_MAP.get(id)?.title, L)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const allowed = !ctx.settings.allowedSubjects.length || ctx.settings.allowedSubjects.includes(world.subject);
  const topics = topoOrder(topicsForWorld(slug));
  const main = topics.filter((t) => t.grades[0] <= grade + 1 && t.grades[1] >= grade - 1);
  const extra = topics.filter((t) => !main.includes(t) && t.grades[1] < grade - 1);
  const secret = topics.filter((t) => !main.includes(t) && !extra.includes(t));
  const bosses = BOSSES.filter((b) => b.world === slug);

  const TopicNode = ({ id, i }: { id: string; i: number }) => {
    const t = TOPIC_MAP.get(id)!;
    const p = pmap.get(id);
    const st = topicStatus(p);
    const lesson = lessonsForTopic(id)[0];
    const missing = missingPrerequisites(t, pmap, TOPIC_MAP);
    const ready = missing.length === 0;
    return (
      <li className={i % 2 ? "sm:ml-16" : "sm:mr-16"}>
        <Link href={lesson ? `/play/lessons/${lesson.id}` : "#"} className="glass flex items-center gap-3 rounded-3xl p-3 transition hover:bg-white/15" style={{ opacity: ready || st !== "new" ? 1 : 0.6 }}>
          <span className="relative grid size-14 shrink-0 place-items-center">
            <RingStatic value={p?.mastery_level ?? 0} size={56} stroke={5} color={STATUS_STYLE[st].ring} />
            <span className="absolute text-xl" aria-hidden>{ready || st !== "new" ? STATUS_STYLE[st].icon : "🔒"}</span>
          </span>
          <span className="min-w-0">
            <span className="block font-bold">{tx(t.title, L)}</span>
            <span className="block text-sm opacity-80 line-clamp-2">{tx(t.description, L)}</span>
            {!ready && st === "new" && <span className="text-xs text-coral">{ut(L, "needsTopics")} {missing.map((m) => tx(m.title, L)).join(", ")}</span>}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-soft)]" style={{ background: `linear-gradient(135deg, ${world.palette.from}, ${world.palette.to})` }}>
        <div className="relative z-10 max-w-[65%] text-white drop-shadow">
          <Link href="/play/map" className="text-sm opacity-90">← {ut(L, "navMap")}</Link>
          <h1 className="mt-1 font-display text-4xl">{world.emoji} {tx(world.name, L)}</h1>
          <p className="mt-1 text-lg">{tx(world.tagline, L)}</p>
          <p className="mt-2 text-sm opacity-95">{tx(world.description, L)}</p>
          <p className="mt-3 inline-block rounded-full bg-black/25 px-3 py-1 text-sm font-bold">★ {info.mastered}/{info.total}</p>
        </div>
        <div className="absolute -bottom-4 right-2 sm:right-8"><Character id={world.guide} size={150} animation="wave" /></div>
      </section>

      {!allowed && <p className="glass rounded-2xl p-3">{ut(L, "featureDisabled")}</p>}

      {main.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl">🧭 {L === "en" ? "Main quests" : "Основные задания"}</h2>
          <ol className="space-y-3">{main.map((t, i) => <TopicNode key={t.id} id={t.id} i={i} />)}</ol>
        </section>
      )}

      {bosses.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl">🛡️ {ut(L, "boss")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {bosses.map((b) => {
              const unlocked = b.topics.every((id) => isUnderstood(pmap.get(id)));
              return (
                <Link key={b.id} href={`/play/boss/${b.id}`} className="glass flex items-center gap-3 rounded-3xl p-4 hover:bg-white/15" style={{ opacity: unlocked ? 1 : 0.65 }}>
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl" style={{ background: b.color }} aria-hidden>{unlocked ? b.emoji : "🔒"}</span>
                  <span>
                    <span className="block font-display text-lg">{tx(b.name, L)}</span>
                    <span className="block text-xs opacity-80">{b.topics.map((id) => (isUnderstood(pmap.get(id)) ? "✅ " : "▫️ ") + tx(TOPIC_MAP.get(id)?.title, L)).join(" · ")}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {extra.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl">🌱 {L === "en" ? "Extra quests (basics)" : "Дополнительные задания (основы)"}</h2>
          <ol className="space-y-3">{extra.map((t, i) => <TopicNode key={t.id} id={t.id} i={i} />)}</ol>
        </section>
      )}

      {secret.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl">🔮 {L === "en" ? "Secret quests (ahead of your level)" : "Секретные задания (на вырост)"}</h2>
          <ol className="space-y-3">{secret.map((t, i) => <TopicNode key={t.id} id={t.id} i={i} />)}</ol>
        </section>
      )}
    </div>
  );
}
