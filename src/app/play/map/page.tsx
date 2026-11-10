import { requireChild } from "@/services/context";
import { childOverview } from "@/services/child-view";
import { WorldMap } from "@/components/world-map/WorldMap";
import { ut } from "@/lib/i18n/ui";
import { tx } from "@/lib/i18n/text";
import { TOPIC_MAP } from "@/data/topics";
import type { Locale } from "@/types/content";
import { Character } from "@/components/characters/Character";

export default async function MapPage() {
  const ctx = await requireChild();
  const L = ctx.child.interface_language as Locale;
  const { worlds, recs } = await childOverview(ctx.store, ctx.child, ctx.settings);
  const locked = worlds.filter((w) => !w.unlocked);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Character id="foxy" portrait size={64} animation="wave" />
        <div>
          <h1 className="font-display text-3xl">EduWorld</h1>
          <p className="opacity-80">{L === "en" ? "Pick a world to explore. New worlds open as you master skills." : "Выбери мир. Новые миры открываются, когда ты осваиваешь навыки."}</p>
        </div>
      </div>
      <WorldMap worlds={worlds} locale={L} avatarWorld={recs[0]?.topic.world} />
      {locked.length > 0 && (
        <div className="glass rounded-3xl p-4">
          <h2 className="font-display text-xl">🔒 {ut(L, "locked")}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {locked.map(({ world }) => (
              <li key={world.slug}>
                <b>{tx(world.name, L)}</b>: {ut(L, "needsTopics")} {world.unlockTopics.map((id) => tx(TOPIC_MAP.get(id)?.title, L)).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
