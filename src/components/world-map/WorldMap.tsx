import Link from "next/link";
import type { Locale, WorldDef } from "@/types/content";
import { tx } from "@/lib/i18n/text";

/**
 * Central EduWorld map: floating islands on a twilight sea. Pure SVG (no heavy assets), so it
 * loads instantly; each world's own art is loaded only on its detail page.
 * Extensible: a new world only needs a WorldDef with mapPos + palette.
 */
const LANDMARKS: Record<string, string[]> = {
  "little-steps": ["🌼", "🏡", "🌈", "🐣"],
  numberia: ["🔢", "💎", "🏰", "➗"],
  bookoria: ["📚", "🏯", "🪶", "🌳"],
  scientia: ["🌋", "🔭", "🧪", "🌿"],
  lingua: ["🗼", "🌐", "💬", "🏮"],
  techtown: ["🤖", "🏙️", "💻", "🛰️"],
};

export function WorldMap({ worlds, locale, avatarWorld }: { worlds: { world: WorldDef; unlocked: boolean; mastered: number; total: number }[]; locale: Locale; avatarWorld?: string }) {
  const order = ["little-steps", "lingua", "numberia", "techtown", "scientia", "bookoria"];
  const pts = order.map((s) => worlds.find((w) => w.world.slug === s)!).filter(Boolean);
  const pathD = pts.map((w, i) => `${i ? "L" : "M"}${w.world.mapPos.x * 10} ${w.world.mapPos.y * 7}`).join(" ");
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]" style={{ aspectRatio: "10 / 7" }}>
      <svg viewBox="0 0 1000 700" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="sea" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#3b58b8" />
            <stop offset="100%" stopColor="#1a2156" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        <rect width="1000" height="700" fill="url(#sea)" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={(i * 137) % 1000} cy={(i * 89) % 700} r={(i % 3) + 1} fill="#fff" opacity="0.35" className="animate-twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} />
        ))}
        {[[120, 90], [700, 610], [880, 120], [420, 640]].map(([x, y], i) => (
          <g key={i} opacity="0.5" filter="url(#soft)"><ellipse cx={x} cy={y} rx="90" ry="26" fill="#fff" /></g>
        ))}
        <path d={pathD} fill="none" stroke="#FFD76B" strokeWidth="6" strokeDasharray="4 18" strokeLinecap="round" opacity="0.8" />
        {worlds.map(({ world, unlocked }) => {
          const x = world.mapPos.x * 10, y = world.mapPos.y * 7;
          return (
            <g key={world.slug} opacity={unlocked ? 1 : 0.55}>
              <ellipse cx={x} cy={y + 52} rx="118" ry="34" fill="#000" opacity="0.25" />
              <path d={`M${x - 110} ${y + 10} C${x - 110} ${y - 60} ${x + 110} ${y - 60} ${x + 110} ${y + 10} C${x + 100} ${y + 50} ${x - 100} ${y + 50} ${x - 110} ${y + 10} Z`} fill={world.palette.from} />
              <path d={`M${x - 110} ${y + 10} C${x - 90} ${y + 70} ${x + 90} ${y + 70} ${x + 110} ${y + 10} C${x + 100} ${y + 50} ${x - 100} ${y + 50} ${x - 110} ${y + 10} Z`} fill="#8a5a3c" />
              <path d={`M${x - 80} ${y + 40} L${x - 40} ${y + 90} L${x} ${y + 48} L${x + 40} ${y + 100} L${x + 80} ${y + 40} Z`} fill="#6b4430" opacity="0.8" />
              <ellipse cx={x} cy={y - 10} rx="78" ry="26" fill={world.palette.to} opacity="0.55" />
              {!unlocked && <ellipse cx={x} cy={y - 10} rx="120" ry="70" fill="#c7d0ff" opacity="0.35" filter="url(#soft)" />}
            </g>
          );
        })}
      </svg>
      {worlds.map(({ world, unlocked, mastered, total }) => (
        <Link
          key={world.slug}
          href={unlocked ? `/play/worlds/${world.slug}` : `/play/worlds/${world.slug}`}
          className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
          style={{ left: `${world.mapPos.x}%`, top: `${world.mapPos.y}%` }}
          aria-label={`${tx(world.name, locale)}${unlocked ? "" : " (locked)"}`}
        >
          <span className="flex gap-0.5 text-xl sm:text-3xl transition group-hover:-translate-y-1 drop-shadow" aria-hidden>
            {(unlocked ? LANDMARKS[world.slug] : ["🔒"]).slice(0, 3).map((e, i) => <span key={i} className={i === 1 ? "-translate-y-2 text-2xl sm:text-4xl" : ""}>{e}</span>)}
          </span>
          <span className="mt-1 rounded-full bg-night-950/70 px-2 py-0.5 sm:px-3 sm:py-1 font-display text-[11px] sm:text-sm whitespace-nowrap">
            {tx(world.name, locale)}
          </span>
          {unlocked && <span className="mt-0.5 hidden sm:block text-[11px] font-bold text-sun">★ {mastered}/{total}</span>}
          {avatarWorld === world.slug && <span className="absolute -top-8 text-2xl animate-float" aria-hidden>📍</span>}
        </Link>
      ))}
    </div>
  );
}
