import Link from "next/link";
import { requireChild } from "@/services/context";
import { getLesson, TOPIC_MAP } from "@/data/content";
import { getBoss } from "@/data/worlds";
import { getMiniGame } from "@/data/minigames";
import { getAchievement } from "@/data/achievements";
import { tx } from "@/lib/i18n/text";
import { ut } from "@/lib/i18n/ui";
import type { LText, Locale } from "@/types/content";

const PAGE = 20;

/** Learning Journal: a chronological, paginated history of lessons, bosses, reviews, games and achievements. */
export default async function JournalPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const page = Math.max(0, Number((await searchParams).page ?? 0) || 0);
  const [attempts, games, achs] = await Promise.all([
    ctx.store.select("lesson_attempts", { child_id: ctx.child.id, completed: true }, { orderBy: "completed_at", desc: true, limit: (page + 1) * PAGE }),
    ctx.store.select("game_sessions", { child_id: ctx.child.id }, { orderBy: "created_at", desc: true, limit: (page + 1) * PAGE }),
    ctx.store.select("child_achievements", { child_id: ctx.child.id }, { orderBy: "unlocked_at", desc: true, limit: (page + 1) * PAGE }),
  ]);
  type Entry = { at: string; icon: string; title: string; detail: string; href?: string };
  const entries: Entry[] = [
    ...attempts.map((a): Entry => {
      const pct = `${Math.round((a.score ?? 0) * 100)}%`;
      if (a.kind === "boss") return { at: a.completed_at!, icon: getBoss(a.lesson_id)?.emoji ?? "🛡️", title: tx(getBoss(a.lesson_id)?.name, L), detail: `${ut(L, "boss")} · ${pct}` };
      if (a.kind === "assessment") return { at: a.completed_at!, icon: "🧭", title: L === "en" ? "Starting adventure" : "Стартовое приключение", detail: pct };
      if (a.kind === "review") return { at: a.completed_at!, icon: "🔁", title: tx(TOPIC_MAP.get(a.topic_id)?.title, L), detail: `${ut(L, "review")} · ${pct}` };
      const l = getLesson(a.lesson_id);
      return { at: a.completed_at!, icon: "📘", title: tx(l?.title, L), detail: `${tx(TOPIC_MAP.get(a.topic_id)?.title, L)} · ${pct} · +${a.xp_awarded} ${ut(L, "xp")}`, href: l ? `/play/lessons/${l.id}` : undefined };
    }),
    ...games.map((g): Entry => ({ at: g.created_at, icon: getMiniGame(g.game_id)?.emoji ?? "🎮", title: tx(getMiniGame(g.game_id)?.title, L), detail: `${g.score}/${g.max_score}`, href: `/play/games/${g.game_id}` })),
    ...achs.map((a): Entry => ({ at: a.unlocked_at, icon: getAchievement(a.achievement_id)?.icon ?? "⭐", title: tx(getAchievement(a.achievement_id)?.name as LText, L), detail: ut(L, "newAchievement") })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));
  const slice = entries.slice(page * PAGE, (page + 1) * PAGE);
  const hasMore = entries.length > (page + 1) * PAGE || attempts.length === (page + 1) * PAGE || games.length === (page + 1) * PAGE;
  const fmt = new Intl.DateTimeFormat(L === "en" ? "en-GB" : L === "uz" ? "uz-UZ" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">📔 {ut(L, "navJournal")}</h1>
      {slice.length === 0 ? (
        <p className="glass rounded-3xl p-6 text-center opacity-80">{L === "en" ? "Your adventures will appear here." : "Здесь появятся твои приключения."}</p>
      ) : (
        <ul className="space-y-2">
          {slice.map((e, i) => {
            const inner = (
              <>
                <span className="text-2xl" aria-hidden>{e.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{e.title}</span>
                  <span className="block text-sm opacity-75">{e.detail}</span>
                </span>
                <time className="text-xs opacity-60" dateTime={e.at}>{fmt.format(new Date(e.at))}</time>
              </>
            );
            return <li key={i}>{e.href ? <Link href={e.href} className="glass flex items-center gap-3 rounded-2xl p-3 hover:bg-white/15">{inner}</Link> : <div className="glass flex items-center gap-3 rounded-2xl p-3">{inner}</div>}</li>;
          })}
        </ul>
      )}
      <div className="flex justify-between">
        {page > 0 ? <Link className="glass rounded-full px-4 py-2" href={`/play/journal?page=${page - 1}`}>← {ut(L, "back")}</Link> : <span />}
        {hasMore && <Link className="glass rounded-full px-4 py-2" href={`/play/journal?page=${page + 1}`}>{ut(L, "next")} →</Link>}
      </div>
    </div>
  );
}
