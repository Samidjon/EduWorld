import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CalendarClock,
  Check,
  ChevronDown,
  Compass,
  EyeOff,
  LayoutDashboard,
  MessageCircleOff,
  Network,
  Repeat,
  Route,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Ban,
  Gauge,
} from "lucide-react";
import type { Locale } from "@/types/content";
import type { PublicDict } from "@/lib/i18n/public";
import { WORLDS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import { Character } from "@/components/characters/Character";
import { Reveal } from "./Reveal";
import { Logo } from "./Logo";
import { linkBtn } from "./styles";

/* ---------- shared layout ---------- */

function Section({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-6 px-4 py-16 sm:px-6 sm:py-24 ${className ?? ""}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Heading({ id, title, subtitle, eyebrow }: { id: string; title: string; subtitle?: string; eyebrow?: string }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
      {eyebrow && <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-sun">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-white/80 sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}

const ACCENTS = ["#5799E8", "#FFD76B", "#9BDDB7", "#FF967D", "#B8A5EF", "#A8D8F0"];

/* ---------- How it works ---------- */

const STEP_ICONS = [UserPlus, Compass, Route, Sparkles];

export function HowSection({ t }: { t: PublicDict["how"] }) {
  return (
    <Section id="how">
      <Heading id="how" title={t.title} subtitle={t.subtitle} />
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((s, i) => {
          const Icon = STEP_ICONS[i] ?? Sparkles;
          return (
            <li key={s.title}>
              <Reveal delay={i * 0.08} className="glass relative h-full rounded-4xl p-6 shadow-[var(--shadow-soft)]">
                <span className="absolute right-5 top-4 font-display text-5xl font-bold text-white/10" aria-hidden>
                  {i + 1}
                </span>
                <span className="mb-4 grid size-12 place-items-center rounded-2xl text-ink" style={{ background: ACCENTS[i] }}>
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{s.text}</p>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

/* ---------- Ages ---------- */

const AGE_STYLE = [
  { emoji: "🌼", color: "#9BDDB7" },
  { emoji: "🚀", color: "#A8D8F0" },
  { emoji: "🔭", color: "#B8A5EF" },
  { emoji: "🎓", color: "#FFD76B" },
];

export function AgesSection({ t }: { t: PublicDict["ages"] }) {
  return (
    <Section id="ages">
      <Heading id="ages" title={t.title} subtitle={t.subtitle} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.groups.map((g, i) => {
          const st = AGE_STYLE[i] ?? AGE_STYLE[0];
          return (
            <li key={g.range}>
              <Reveal delay={i * 0.08} className="h-full">
                <Link
                  href="/register"
                  aria-label={`${g.range} ${g.unit}: ${g.title}. ${t.cta}`}
                  className="group flex h-full flex-col rounded-4xl bg-cream p-6 text-ink shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgb(0_0_0/0.6)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold">
                      {g.range}
                      <span className="ml-1.5 text-base font-semibold text-ink/70">{g.unit}</span>
                    </span>
                    <span className="grid size-12 place-items-center rounded-2xl text-2xl" style={{ background: st.color }} aria-hidden>
                      {st.emoji}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{g.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/80">{g.text}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {g.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#2f8f62]" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display font-semibold text-[#2f62b8]">
                    {t.cta}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ---------- Worlds ---------- */

export function WorldsSection({ t, locale, guideNames }: { t: PublicDict["worlds"]; locale: Locale; guideNames: Record<string, string> }) {
  return (
    <Section id="worlds">
      <Heading id="worlds" title={t.title} subtitle={t.subtitle} />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((w, i) => (
          <li key={w.slug}>
            <Reveal delay={(i % 3) * 0.08} className="h-full">
              <article className="relative h-full overflow-hidden rounded-4xl p-6 shadow-[var(--shadow-soft)]" style={{ background: `linear-gradient(140deg, ${w.palette.from}, ${w.palette.to})` }}>
                <svg viewBox="0 0 200 120" className="pointer-events-none absolute -right-6 -top-6 w-48 opacity-30" aria-hidden focusable="false">
                  <circle cx="150" cy="40" r="44" fill="#fff" />
                  <circle cx="60" cy="20" r="18" fill="#fff" />
                </svg>
                <div className="relative flex items-end justify-between gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-white/90 text-4xl shadow-md" aria-hidden>
                    {w.emoji}
                  </span>
                  <div className="flex items-center gap-2 rounded-full bg-white/90 py-1 pl-1 pr-3 text-xs font-bold text-ink shadow-sm">
                    <span className="grid size-8 place-items-center overflow-hidden rounded-full" style={{ background: w.palette.soft }}>
                      <Character id={w.guide} portrait animation="none" size={30} title={guideNames[w.guide]} />
                    </span>
                    <span>
                      {t.guide}: {guideNames[w.guide]}
                    </span>
                  </div>
                </div>
                <div className="relative mt-5 rounded-3xl bg-night-950/70 p-4 backdrop-blur-sm">
                  <h3 className="font-display text-2xl font-bold text-white">{tx(w.name, locale)}</h3>
                  <p className="mt-0.5 text-sm font-bold" style={{ color: w.palette.soft }}>
                    {tx(w.tagline, locale)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">{tx(w.description, locale)}</p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ---------- Personal learning ---------- */

const PERSONAL_ICONS = [Gauge, Network, Repeat];

export function PersonalSection({ t }: { t: PublicDict["personal"] }) {
  return (
    <Section id="personal">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <Reveal>
          <SkillGraph />
        </Reveal>
        <div>
          <Reveal>
            <h2 id="personal-title" className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-4 text-base text-white/80 sm:text-lg">{t.subtitle}</p>
          </Reveal>
          <ul className="mt-8 space-y-4">
            {t.items.map((it, i) => {
              const Icon = PERSONAL_ICONS[i] ?? Brain;
              return (
                <li key={it.title}>
                  <Reveal delay={i * 0.08} className="glass flex gap-4 rounded-3xl p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky text-ink">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">{it.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/80">{it.text}</p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/** Decorative skill graph: connected nodes, some mastered, one in progress. */
function SkillGraph() {
  const nodes = [
    { x: 60, y: 200, c: "#9BDDB7", done: true },
    { x: 150, y: 120, c: "#9BDDB7", done: true },
    { x: 160, y: 270, c: "#9BDDB7", done: true },
    { x: 260, y: 190, c: "#FFD76B", done: false },
    { x: 360, y: 110, c: "#B8A5EF", done: false },
    { x: 370, y: 270, c: "#B8A5EF", done: false },
    { x: 450, y: 190, c: "#B8A5EF", done: false },
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6]];
  return (
    <svg viewBox="0 0 510 380" className="mx-auto w-full max-w-lg" aria-hidden focusable="false">
      <rect x="4" y="4" width="502" height="372" rx="36" fill="rgb(255 255 255 / 0.06)" stroke="rgb(255 255 255 / 0.12)" />
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={nodes[b].done ? "#9BDDB7" : "rgb(255 255 255 / 0.3)"} strokeWidth="4" strokeDasharray={nodes[b].done ? undefined : "6 8"} strokeLinecap="round" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          {i === 3 && <circle cx={n.x} cy={n.y} r="36" fill="#FFD76B" opacity="0.25" className="animate-twinkle" />}
          <circle cx={n.x} cy={n.y} r="24" fill={n.c} stroke="#fff" strokeWidth="4" />
          {n.done && <path d={`M${n.x - 9} ${n.y} l6 7 12 -13`} stroke="#1f5b3f" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          {i === 3 && <text x={n.x} y={n.y + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#4a3505">★</text>}
        </g>
      ))}
      <g transform="translate(222 300)">
        <rect width="80" height="36" rx="18" fill="#FFF8EA" />
        <text x="40" y="24" textAnchor="middle" fontSize="16" fontWeight="800" fill="#28334A">🔁 +1</text>
      </g>
    </svg>
  );
}

/* ---------- AI tutor ---------- */

export function TutorSection({ t }: { t: PublicDict["tutor"] }) {
  return (
    <Section id="tutor">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="mb-4 inline-grid size-14 place-items-center rounded-3xl bg-lavender text-ink">
              <Bot className="size-7" aria-hidden />
            </span>
            <h2 id="tutor-title" className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-3 text-lg font-bold text-sun">{t.subtitle}</p>
          </Reveal>
          <ul className="mt-6 space-y-3">
            {t.points.map((p, i) => (
              <li key={p}>
                <Reveal delay={i * 0.06} className="flex items-start gap-3 text-white/90">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mint" aria-hidden />
                  <span>{p}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <figure className="rounded-4xl bg-cream p-5 text-ink shadow-[var(--shadow-soft)] sm:p-7">
            <figcaption className="mb-4 text-xs font-extrabold uppercase tracking-widest text-ink/60">{t.demoLabel}</figcaption>
            <div className="space-y-4">
              <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-brand-blue px-4 py-3 font-semibold text-white">
                <span className="sr-only">👧 </span>
                {t.demoChild}
              </div>
              <div className="flex items-end gap-2">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lavender text-2xl" aria-hidden>
                  🤖
                </span>
                <div className="max-w-[85%] rounded-3xl rounded-bl-md border border-lavender/60 bg-white px-4 py-3">
                  <span className="mb-1 block text-xs font-extrabold text-[#5b47b0]">EduBuddy</span>
                  {t.demoBuddy}
                </div>
              </div>
            </div>
            <p className="mt-5 border-t border-ink/10 pt-4 text-xs text-ink/70">{t.disclaimer}</p>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------- Parental control ---------- */

const PARENT_ICONS = [LayoutDashboard, BarChart3, CalendarClock, EyeOff, Ban, MessageCircleOff];

export function ParentsSection({ t }: { t: PublicDict["parents"] }) {
  return (
    <Section id="parents">
      <Heading id="parents" title={t.title} subtitle={t.subtitle} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((it, i) => {
          const Icon = PARENT_ICONS[i] ?? ShieldCheck;
          return (
            <li key={it.title}>
              <Reveal delay={(i % 3) * 0.07} className="flex h-full gap-4 rounded-3xl bg-white/95 p-5 text-ink shadow-[var(--shadow-soft)]">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ background: ACCENTS[i % ACCENTS.length] }}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">{it.text}</p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ---------- Rewards ---------- */

export function RewardsSection({ t }: { t: PublicDict["rewards"] }) {
  return (
    <Section id="rewards">
      <Heading id="rewards" title={t.title} subtitle={t.subtitle} />
      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {t.items.map((it, i) => (
          <li key={it.title}>
            <Reveal delay={(i % 3) * 0.07} className="glass flex h-full items-start gap-4 rounded-3xl p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-3xl" aria-hidden>
                {it.emoji}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-white">{it.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/80">{it.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-5 py-3 text-center text-sm font-bold text-mint">
        <ShieldCheck className="size-5 shrink-0" aria-hidden />
        <span>{t.note}</span>
      </Reveal>
    </Section>
  );
}

/* ---------- FAQ ---------- */

export function FaqSection({ t }: { t: PublicDict["faq"] }) {
  return (
    <Section id="faq">
      <Heading id="faq" title={t.title} />
      <div className="mx-auto max-w-3xl space-y-3">
        {t.items.map((it, i) => (
          <Reveal key={it.q} delay={i * 0.04}>
            <details className="group glass rounded-3xl open:bg-white/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 font-display text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                <span>{it.q}</span>
                <ChevronDown className="size-5 shrink-0 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-white/85">{it.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Final CTA ---------- */

export function FinalCta({ t, start }: { t: PublicDict["finalCta"]; start: string }) {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-20 sm:px-6">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-5xl bg-gradient-to-br from-[#5799E8] via-[#7a7be6] to-[#B8A5EF] p-8 text-center shadow-[var(--shadow-soft)] sm:p-12">
        <div className="mx-auto mb-2 w-28 sm:w-32">
          <Character id="foxy" emotion="celebrate" animation="jump" size={120} className="h-auto w-full" />
        </div>
        <h2 id="cta-title" className="font-display text-3xl font-bold text-white sm:text-4xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">{t.text}</p>
        <Link href="/register" className={`${linkBtn("sun", "lg")} mt-7`}>
          {start}
          <ArrowRight className="size-5" aria-hidden />
        </Link>
      </Reveal>
    </section>
  );
}

/* ---------- Footer ---------- */

export function Footer({ t, nav, common }: { t: PublicDict["footer"]; nav: PublicDict["nav"]; common: PublicDict["common"] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-night-950/60 px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-white/75">{t.tagline}</p>
          <p className="mt-2 font-display text-sm text-sun">Learn. Play. Explore. Grow.</p>
        </div>
        <nav aria-label={t.sections}>
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-white/60">{t.sections}</h2>
          <ul className="space-y-2 text-sm">
            {[
              ["#how", nav.how],
              ["#ages", nav.ages],
              ["#worlds", nav.worlds],
              ["#parents", nav.parents],
              ["#faq", nav.faq],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-white/85 hover:text-white hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.account}>
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-white/60">{t.account}</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/login" className="text-white/85 hover:text-white hover:underline">
                {common.login}
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-white/85 hover:text-white hover:underline">
                {common.start}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs text-white/65">
        <p className="flex items-start gap-2">
          <ShieldCheck className="size-4 shrink-0 text-mint" aria-hidden />
          <span>{t.privacy}</span>
        </p>
        <p className="mt-3">
          © {year} EduWorld. {t.rights}
        </p>
      </div>
    </footer>
  );
}
