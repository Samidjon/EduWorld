import Link from "next/link";
import { requireChild } from "@/services/context";
import { childOverview, topicStatus } from "@/services/child-view";
import { TOPICS, lessonsForTopic } from "@/data/content";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { Locale, Topic } from "@/types/content";

const COLORS = { mastered: "#9BDDB7", placed: "#A8D8F0", learning: "#FFD76B", needs_review: "#FF967D", new: "#4a5397" } as const;

/** Depth of a topic in its world's prerequisite graph (only same-world edges). */
function depths(topics: Topic[]) {
  const byId = new Map(topics.map((t) => [t.id, t]));
  const memo = new Map<string, number>();
  const d = (t: Topic): number => {
    if (memo.has(t.id)) return memo.get(t.id)!;
    const pre = t.prerequisites.map((p) => byId.get(p)).filter((x): x is Topic => !!x);
    const v = pre.length ? Math.max(...pre.map(d)) + 1 : 0;
    memo.set(t.id, v);
    return v;
  };
  topics.forEach(d);
  return memo;
}

export default async function SkillsPage({ searchParams }: { searchParams: Promise<{ world?: string }> }) {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const { worlds, pmap } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const sp = await searchParams;
  const current = worlds.find((w) => w.world.slug === sp.world) ?? worlds[0];
  const topics = TOPICS.filter((t) => t.world === current.world.slug);
  const dep = depths(topics);
  const layers: Topic[][] = [];
  topics.forEach((t) => (layers[dep.get(t.id)!] ??= []).push(t));
  const W = 220, H = 92, colW = Math.max(...layers.map((l) => l.length)) * W;
  const pos = new Map<string, { x: number; y: number }>();
  layers.forEach((layer, li) => layer.forEach((t, i) => pos.set(t.id, { x: (colW - layer.length * W) / 2 + i * W + W / 2, y: li * H + 40 })));
  const height = layers.length * H + 20;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">🌳 {ut(L, "navSkills")}</h1>
      <div className="flex flex-wrap gap-2">
        {worlds.map((w) => (
          <Link key={w.world.slug} href={`/play/skills?world=${w.world.slug}`} className={`rounded-full px-3 py-1.5 text-sm font-bold ${w.world.slug === current.world.slug ? "bg-white/20" : "glass opacity-80"}`}>
            {w.world.emoji} {tx(w.world.name, L)}
          </Link>
        ))}
      </div>
      <div className="glass overflow-x-auto rounded-[2rem] p-3">
        <div className="relative" style={{ width: colW, height }}>
          <svg width={colW} height={height} className="absolute inset-0" aria-hidden>
            {topics.flatMap((t) =>
              t.prerequisites.filter((p) => pos.has(p)).map((p) => {
                const a = pos.get(p)!, b = pos.get(t.id)!;
                return <path key={p + t.id} d={`M${a.x} ${a.y + 22} C${a.x} ${a.y + 60} ${b.x} ${b.y - 60} ${b.x} ${b.y - 22}`} stroke="rgba(255,255,255,0.35)" strokeWidth="3" fill="none" />;
              }),
            )}
          </svg>
          {topics.map((t) => {
            const p = pos.get(t.id)!;
            const st = topicStatus(pmap.get(t.id));
            const l = lessonsForTopic(t.id)[0];
            return (
              <Link key={t.id} href={l ? `/play/lessons/${l.id}` : "#"} className="absolute flex w-48 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl border-2 bg-night-800 px-3 py-2 text-sm font-semibold shadow-lg hover:scale-105 transition" style={{ left: p.x, top: p.y, borderColor: COLORS[st] }}>
                <span className="size-3 shrink-0 rounded-full" style={{ background: COLORS[st] }} aria-hidden />
                <span className="line-clamp-2">{tx(t.title, L)}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {(["mastered", "placed", "learning", "needs_review", "new"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5"><span className="size-3 rounded-full" style={{ background: COLORS[k] }} />{{ mastered: ut(L, "mastered"), placed: L === "en" ? "Known" : "Знаю", learning: ut(L, "learning"), needs_review: ut(L, "needsReview"), new: ut(L, "notStarted") }[k]}</span>
        ))}
      </div>
    </div>
  );
}
