"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { Lesson, Question } from "@/types/content";
import { QuestionRunner } from "./QuestionRunner";
import { VisualView } from "./VisualView";
import { Character } from "@/components/characters/Character";
import { Button, Card, ErrorNote, Progress, Spinner } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { GameShell } from "@/components/minigames/GameShell";
import { RewardPanel, type RewardData } from "@/components/rewards/RewardPanel";
import { api, ApiError } from "@/lib/client";
import { speak, sfx } from "@/lib/audio";

type Step =
  | { kind: "intro" }
  | { kind: "explain" }
  | { kind: "example" }
  | { kind: "practice"; q: Question; i: number }
  | { kind: "recap" }
  | { kind: "game" }
  | { kind: "checkIntro" }
  | { kind: "check"; q: Question; i: number }
  | { kind: "finish" };

/**
 * Lesson structure: 1 intro → 2 explanation → 3 visual example → 4 practice → 5 game task →
 * 6 understanding check → 7 feedback → 8 reward → 9 progress saved (server).
 * Adaptive: two misses in a row during practice insert a recap of the explanation.
 */
export function LessonPlayer({ lesson, worldSlug, gameLevel, gamesEnabled }: { lesson: Lesson; worldSlug: string; gameLevel: 1 | 2 | 3; gamesEnabled: boolean }) {
  const { t, tl, locale, young } = useT();
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Question[]>([]);
  const [startError, setStartError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [missStreak, setMissStreak] = useState(0);
  const [extraRecap, setExtraRecap] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [result, setResult] = useState<{ score: number; mastered: boolean; reward: RewardData } | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);

  const start = async () => {
    setStartError(null);
    try {
      const r = await api<{ attemptId: string; generated: Question[] }>("/api/play/lesson-start", { lessonId: lesson.id });
      setAttemptId(r.attemptId);
      setGenerated(r.generated);
    } catch (e) {
      setStartError(e instanceof ApiError && e.code === "daily_limit" ? t("dailyLimitReached") : e instanceof ApiError && e.code === "subject_disabled" ? t("featureDisabled") : t("errorGeneric"));
    }
  };
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; // avoid a second attempt under React strict mode
    started.current = true;
    void start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps: Step[] = useMemo(() => {
    const s: Step[] = [{ kind: "intro" }, { kind: "explain" }, { kind: "example" }];
    [...lesson.practice, ...generated].forEach((q, i) => {
      s.push({ kind: "practice", q, i });
      if (extraRecap === i) s.push({ kind: "recap" });
    });
    if (lesson.game && gamesEnabled) s.push({ kind: "game" });
    s.push({ kind: "checkIntro" });
    lesson.check.forEach((q, i) => s.push({ kind: "check", q, i }));
    s.push({ kind: "finish" });
    return s;
  }, [lesson, generated, extraRecap, gamesEnabled]);

  const step = steps[idx];
  const next = () => setIdx((i) => Math.min(i + 1, steps.length - 1));

  useEffect(() => {
    if (step?.kind === "finish" && !result && !finishing && attemptId) void finish();
  }, [step?.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  async function finish() {
    if (!attemptId) return;
    setFinishing(true);
    setFinishError(null);
    try {
      const r = await api<{ score: number; mastered: boolean; reward: RewardData }>("/api/play/lesson-finish", { attemptId });
      setResult(r);
      sfx("levelUp");
      router.refresh();
    } catch (e) {
      setFinishError(e instanceof ApiError && e.code === "network" ? t("networkError") : t("errorGeneric"));
    } finally {
      setFinishing(false);
    }
  }

  if (startError) return <Card className="mx-auto max-w-md text-center space-y-3"><ErrorNote>{startError}</ErrorNote><Button onClick={start}>{t("tryAgain")}</Button></Card>;
  if (!attemptId) return <div className="grid min-h-60 place-items-center"><Spinner /></div>;

  const stepLabel = step.kind === "practice" || step.kind === "recap" ? t("stepPractice") : step.kind === "check" || step.kind === "checkIntro" ? t("stepCheck") : step.kind === "game" ? t("stepGame") : step.kind === "finish" ? t("stepReward") : step.kind === "example" ? t("stepExample") : step.kind === "explain" ? t("stepExplain") : t("stepIntro");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/play/worlds/${worldSlug}`} className="text-sm opacity-80 hover:opacity-100">← {t("back")}</Link>
        <Progress value={idx / (steps.length - 1)} className="flex-1" label={stepLabel} />
        <span className="text-xs font-bold uppercase opacity-70">{stepLabel}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx + step.kind} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {step.kind === "intro" && (
            <Card className="text-center">
              <Character id={lesson.character} animation="wave" size={young ? 170 : 150} className="mx-auto" />
              <p className="mt-1 text-sm uppercase tracking-wide opacity-70">{tl(lesson.subtopic)}</p>
              <h1 className="font-display text-3xl">{tl(lesson.title)}</h1>
              <p className="glass mt-4 rounded-3xl p-4 text-lg">{tl(lesson.intro)}</p>
              <p className="mt-3 text-sm opacity-80">🎯 {tl(lesson.objective)}</p>
              <div className="mt-5 flex justify-center gap-3">
                <Button variant="glass" onClick={() => speak(tl(lesson.intro), locale)} icon={<Volume2 className="size-4" />}>{t("listen")}</Button>
                <Button variant="sun" size="lg" onClick={next}>{t("start")}</Button>
              </div>
            </Card>
          )}

          {(step.kind === "explain" || step.kind === "recap") && (
            <Card>
              <div className="flex items-center gap-3">
                <Character id={lesson.character} portrait size={64} emotion="talk" animation="talk" />
                <h2 className="font-display text-2xl">{step.kind === "recap" ? t("together") : t("stepExplain")}</h2>
              </div>
              <div className="mt-4 space-y-3 text-lg leading-relaxed">
                {lesson.explanation.map((p, i) => <p key={i}>{tl(p)}</p>)}
              </div>
              {step.kind === "recap" && <div className="mt-4 glass rounded-3xl p-4"><VisualView v={lesson.example} /></div>}
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="glass" onClick={() => speak(lesson.explanation.map(tl).join(" "), locale)} icon={<Volume2 className="size-4" />}>{t("listen")}</Button>
                <Button variant="sun" onClick={next}>{t("next")}</Button>
              </div>
            </Card>
          )}

          {step.kind === "example" && (
            <Card>
              <h2 className="font-display text-2xl">👀 {t("stepExample")}</h2>
              <div className="mt-4"><VisualView v={lesson.example} /></div>
              <div className="mt-5 flex justify-end"><Button variant="sun" onClick={next}>{t("stepPractice")} →</Button></div>
            </Card>
          )}

          {step.kind === "practice" && (
            <QuestionRunner
              key={step.q.id}
              q={step.q}
              guide={lesson.character}
              attemptId={attemptId}
              onNext={({ firstTry }) => {
                const streak = firstTry ? 0 : missStreak + 1;
                setMissStreak(streak);
                if (streak >= 2 && extraRecap === null) setExtraRecap(step.i);
                next();
              }}
            />
          )}

          {step.kind === "game" && lesson.game && <GameShell id={lesson.game} level={gameLevel} embedded onDone={next} />}

          {step.kind === "checkIntro" && (
            <Card className="text-center">
              <Character id={lesson.character} animation="celebrate" emotion="celebrate" size={130} className="mx-auto" />
              <h2 className="mt-2 font-display text-2xl">{t("stepCheck")}</h2>
              <p className="mt-2 opacity-80">{locale === "en" ? `${lesson.check.length} questions. Take your time!` : `${lesson.check.length} вопросов. Не торопись!`}</p>
              <Button className="mt-4" variant="sun" size="lg" onClick={next}>{t("start")}</Button>
            </Card>
          )}

          {step.kind === "check" && <QuestionRunner key={step.q.id} q={step.q} guide={lesson.character} attemptId={attemptId} onNext={next} />}

          {step.kind === "finish" && (
            <Card className="text-center space-y-4">
              {finishing && <Spinner className="mx-auto" />}
              <ErrorNote>{finishError}</ErrorNote>
              {finishError && <Button onClick={finish}>{t("tryAgain")}</Button>}
              {result && (
                <>
                  <Character id={lesson.character} animation="celebrate" emotion="celebrate" size={140} className="mx-auto" />
                  <h2 className="font-display text-3xl">{result.mastered ? t("learnedTopic") : t("keepPractising")}</h2>
                  <p className="opacity-80">{t("score")}: {Math.round(result.score * 100)}%</p>
                  {!result.mastered && <p className="glass rounded-2xl p-3 text-sm">💡 {tl(lesson.reviewTips)}</p>}
                  <RewardPanel reward={result.reward} />
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {!result.mastered && <Button variant="glass" onClick={() => window.location.reload()}>{t("tryAgain")}</Button>}
                    <Link href={`/play/worlds/${worldSlug}`}><Button variant="sun">{t("backToWorld")}</Button></Link>
                  </div>
                </>
              )}
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
