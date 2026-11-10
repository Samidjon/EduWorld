import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/types/content";
import { Character, type Emotion } from "@/components/characters/Character";
import { Logo } from "@/components/landing/Logo";
import { Stars } from "@/components/landing/Stars";
import { LangSwitcher } from "@/components/landing/LangSwitcher";
import { MotionRoot } from "@/components/landing/Reveal";

/** Twilight background + light card with Foxy peeking over the top, shared by /login and /register. */
export function AuthShell({
  locale,
  langLabel,
  homeLabel,
  foxySays,
  foxyEmotion = "happy",
  children,
}: {
  locale: Locale;
  langLabel: string;
  homeLabel: string;
  foxySays: string;
  foxyEmotion?: Emotion;
  children: ReactNode;
}) {
  return (
    <MotionRoot>
      <div lang={locale} className="bg-adventure relative flex min-h-dvh flex-col overflow-x-clip">
        <Stars />
        <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" aria-label={`EduWorld — ${homeLabel}`} className="shrink-0">
            <Logo size={32} />
          </Link>
          <LangSwitcher locale={locale} label={langLabel} />
        </header>

        <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:px-6">
          <div className="w-full max-w-md">
            <div className="flex items-end gap-2 pl-2">
              <div className="w-24 shrink-0 sm:w-28">
                <Character id="foxy" emotion={foxyEmotion} animation="wave" size={112} className="h-auto w-full" />
              </div>
              <p className="relative mb-6 rounded-3xl rounded-bl-md bg-white/95 px-4 py-3 text-sm font-bold text-ink shadow-[var(--shadow-soft)]">{foxySays}</p>
            </div>
            <div className="-mt-3 rounded-4xl bg-cream p-6 text-ink shadow-[var(--shadow-soft)] sm:p-8">{children}</div>
            <p className="mt-6 text-center">
              <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg text-sm font-bold text-white/80 hover:text-white">
                <ArrowLeft className="size-4" aria-hidden />
                {homeLabel}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </MotionRoot>
  );
}
