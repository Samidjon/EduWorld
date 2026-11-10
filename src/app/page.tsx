import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicDict } from "@/lib/i18n/public";
import { getServerLocale } from "@/components/landing/server-locale";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroScene } from "@/components/landing/HeroScene";
import { Stars } from "@/components/landing/Stars";
import { MotionRoot } from "@/components/landing/Reveal";
import { linkBtn } from "@/components/landing/styles";
import { AgesSection, FaqSection, FinalCta, Footer, HowSection, ParentsSection, PersonalSection, RewardsSection, TutorSection, WorldsSection } from "@/components/landing/Sections";

// Character names are brand names and stay the same in every language.
const GUIDE_NAMES: Record<string, string> = { foxy: "Foxy", oli: "Oli", bruno: "Bruno", luna: "Luna" };

export default async function LandingPage() {
  const locale = await getServerLocale();
  const t = getPublicDict(locale);

  return (
    <MotionRoot>
      <div lang={locale} className="bg-adventure relative min-h-dvh overflow-x-clip">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-sun focus:px-4 focus:py-2 focus:font-bold focus:text-ink">
          {t.skipToContent}
        </a>
        <Stars className="h-[110vh]" />

        <LandingHeader locale={locale} t={{ nav: t.nav, common: t.common, langLabel: t.langLabel }} />

        <main id="main">
          {/* Hero */}
          <section aria-labelledby="hero-title" className="relative px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:pb-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
              <div className="text-center lg:text-left">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-extrabold text-white sm:text-sm">
                  <Sparkles className="size-4 text-sun" aria-hidden />
                  {t.hero.badge}
                </p>
                <h1 id="hero-title" className="mt-5 font-display text-4xl font-bold leading-[1.08] text-white [text-wrap:balance] sm:text-5xl lg:text-6xl">
                  {t.hero.title}
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-lg text-white/85 sm:text-xl lg:mx-0">{t.hero.subtitle}</p>
                <p className="mt-4 font-display text-lg font-semibold tracking-wide text-sun" lang="en">
                  {t.hero.slogan}
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/register" className={`${linkBtn("sun", "lg")} w-full sm:w-auto`}>
                    {t.common.start}
                    <ArrowRight className="size-5" aria-hidden />
                  </Link>
                  <a href="#how" className={`${linkBtn("glass", "lg")} w-full sm:w-auto`}>
                    {t.hero.secondary}
                  </a>
                </div>
                <p className="mt-4 text-sm text-white/70">{t.hero.note}</p>
              </div>

              <div>
                <HeroScene
                  label={t.hero.sceneLabel}
                  names={{ foxy: t.characters.foxy, oli: t.characters.oli, bruno: t.characters.bruno, luna: t.characters.luna }}
                />
              </div>
            </div>
          </section>

          <HowSection t={t.how} />
          <AgesSection t={t.ages} />
          <WorldsSection t={t.worlds} locale={locale} guideNames={GUIDE_NAMES} />
          <PersonalSection t={t.personal} />
          <TutorSection t={t.tutor} />
          <ParentsSection t={t.parents} />
          <RewardsSection t={t.rewards} />
          <FaqSection t={t.faq} />
          <FinalCta t={t.finalCta} start={t.common.start} />
        </main>

        <Footer t={t.footer} nav={t.nav} common={t.common} />
      </div>
    </MotionRoot>
  );
}
