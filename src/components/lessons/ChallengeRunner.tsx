"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CharacterId, LText, Question } from "@/types/content";
import { QuestionRunner } from "./QuestionRunner";
import { Character } from "@/components/characters/Character";
import { Button, Card, ErrorNote, Progress, Spinner } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { RewardPanel, type RewardData } from "@/components/rewards/RewardPanel";
import { api, ApiError } from "@/lib/client";

interface Props {
  kind: "boss" | "review";
  targetId: string;
  title: LText;
  description: LText;
  emoji: string;
  color: string;
  guide: CharacterId;
  backHref: string;
}

/** Boss challenges and spaced reviews: a mixed question set scored on first tries. */
export function ChallengeRunner(p: Props) {
  const { t, tl, locale } = useT();
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "loading" | "play" | "finishing" | "done">("intro");
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; won?: boolean; reward: RewardData } | null>(null);

  async function start() {
    setPhase("loading");
    setError(null);
    try {
      const r = await api<{ attemptId: string; questions: Question[] }>(`/api/play/${p.kind}-start`, p.kind === "boss" ? { bossId: p.targetId } : { topicId: p.targetId });
      setAttemptId(r.attemptId);
      setQuestions(r.questions);
      setI(0);
      setHp(1);
      setPhase("play");
    } catch (e) {
      setError(e instanceof ApiError && e.code === "boss_locked" ? (locale === "en" ? "Master the listed topics first!" : "Сначала освой нужные темы!") : e instanceof ApiError && e.code === "daily_limit" ? t("dailyLimitReached") : t("errorGeneric"));
      setPhase("intro");
    }
  }

  async function finish() {
    setPhase("finishing");
    try {
      const r = await api<{ score: number; won?: boolean; reward: RewardData }>(`/api/play/${p.kind}-finish`, { attemptId });
      setResult(r);
      setPhase("done");
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
      setPhase("play");
    }
  }

  if (phase === "intro" || phase === "loading") {
    return (
      <Card className="mx-auto max-w-lg text-center space-y-4">
        <div className="mx-auto grid size-28 place-items-center rounded-[2rem] text-6xl shadow-lg animate-float" style={{ background: p.color }} aria-hidden>{p.emoji}</div>
        <h1 className="font-display text-3xl">{tl(p.title)}</h1>
        <p className="opacity-90">{tl(p.description)}</p>
        <ErrorNote>{error}</ErrorNote>
        <div className="flex justify-center gap-3">
          <Link href={p.backHref}><Button variant="glass">{t("back")}</Button></Link>
          <Button variant="sun" size="lg" loading={phase === "loading"} onClick={start}>{t("start")}</Button>
        </div>
      </Card>
    );
  }

  if (phase === "done" && result) {
    const won = p.kind === "review" ? result.score >= 0.8 : !!result.won;
    return (
      <Card className="mx-auto max-w-md text-center space-y-4">
        <Character id={p.guide} animation={won ? "celebrate" : "wave"} emotion={won ? "celebrate" : "happy"} size={130} className="mx-auto" />
        <h2 className="font-display text-3xl">{won ? (p.kind === "boss" ? (locale === "en" ? "You did it, hero!" : "Победа, герой!") : t("great")) : t("keepPractising")}</h2>
        <p>{t("score")}: {Math.round(result.score * 100)}%</p>
        <RewardPanel reward={result.reward} />
        <div className="flex justify-center gap-3">
          {!won && <Button variant="glass" onClick={start}>{t("tryAgain")}</Button>}
          <Link href={p.backHref}><Button variant="sun">{t("continue")}</Button></Link>
        </div>
      </Card>
    );
  }

  const q = questions[i];
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="glass flex items-center gap-3 rounded-3xl p-3">
        <span className="grid size-12 place-items-center rounded-2xl text-3xl" style={{ background: p.color }} aria-hidden>{p.emoji}</span>
        <div className="flex-1">
          <p className="font-display">{tl(p.title)}</p>
          {p.kind === "boss" ? <Progress value={hp} color="#FF967D" label="Boss energy" /> : <Progress value={i / questions.length} label="progress" />}
        </div>
        <span className="text-sm font-bold">{i + 1}/{questions.length}</span>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {phase === "finishing" ? (
        <div className="grid min-h-40 place-items-center"><Spinner /></div>
      ) : (
        q && (
          <QuestionRunner
            key={q.id}
            q={q}
            guide={p.guide}
            attemptId={attemptId}
            onNext={({ firstTry }) => {
              if (firstTry) setHp((h) => Math.max(0, h - 1 / questions.length));
              if (i + 1 >= questions.length) void finish();
              else setI(i + 1);
            }}
          />
        )
      )}
    </div>
  );
}
