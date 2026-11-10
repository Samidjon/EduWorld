"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { MiniGameId } from "@/types/content";
import { getMiniGame } from "@/data/minigames";
import { GAME_COMPONENTS } from "./registry";
import { Character } from "@/components/characters/Character";
import { Button, Card, ErrorNote } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { RewardPanel, type RewardData } from "@/components/rewards/RewardPanel";
import { api, ApiError } from "@/lib/client";
import { speak, sfx, VOICE_HELPER } from "@/lib/audio";

type Phase = "rules" | "playing" | "saving" | "done" | "error";

/** Shows rules → runs the game → saves the result server-side → shows rewards. */
export function GameShell({ id, level, embedded, onDone }: { id: MiniGameId; level: 1 | 2 | 3; embedded?: boolean; onDone?: () => void }) {
  const meta = getMiniGame(id)!;
  const Game = GAME_COMPONENTS[id];
  const { t, tl, locale, young } = useT();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("rules");
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [capped, setCapped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (r: { score: number; maxScore: number }) => {
      setPhase("saving");
      try {
        const res = await api<{ reward: RewardData; capped: boolean }>("/api/play/minigame", { gameId: id, score: Math.round(r.score), maxScore: Math.max(1, Math.round(r.maxScore)) });
        setReward(res.reward);
        setCapped(res.capped);
        setPhase("done");
        router.refresh();
      } catch (e) {
        setError(e instanceof ApiError && e.code === "feature_disabled" ? t("featureDisabled") : e instanceof ApiError && e.code === "network" ? t("networkError") : t("errorGeneric"));
        setPhase("error");
      }
    },
    [id, router, t],
  );

  const onFinish = useCallback((r: { score: number; maxScore: number; mistakes: number }) => {
    setResult(r);
    void save(r);
  }, [save]);

  if (phase === "rules") {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <div className="flex justify-center"><Character id={meta.guide} animation="talk" size={130} /></div>
        <h1 className="mt-2 font-display text-3xl">{meta.emoji} {tl(meta.title)}</h1>
        <p className="mt-1 text-sm opacity-80">{tl(meta.skill)}</p>
        <ol className="mx-auto mt-4 max-w-sm space-y-2 text-left">
          {meta.rules.map((r, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-white/5 p-3"><span className="font-display text-sun">{i + 1}</span>{tl(r)}</li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {VOICE_HELPER && <Button variant="glass" onClick={() => { sfx("click"); speak(meta.rules.map(tl).join(". "), locale); }}>🔊 {t("listen")}</Button>}
          <Button variant="sun" size="lg" onClick={() => { sfx("click"); setPhase("playing"); }}>{t("play")}</Button>
        </div>
      </Card>
    );
  }

  if (phase === "playing") {
    return (
      <div className="mx-auto max-w-3xl">
        <Game key={round} locale={locale} young={young} level={level} onFinish={onFinish} />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-md text-center space-y-4">
      <div className="flex justify-center"><Character id={meta.guide} animation={phase === "done" ? "celebrate" : "think"} emotion="celebrate" size={120} /></div>
      {result && <p className="font-display text-2xl">{t("score")}: {result.score} / {result.maxScore}</p>}
      {phase === "saving" && <p className="opacity-80">{t("loading")}</p>}
      {phase === "error" && (
        <>
          <ErrorNote>{error}</ErrorNote>
          {result && <Button onClick={() => save(result)}>{t("tryAgain")}</Button>}
        </>
      )}
      {phase === "done" && reward && (
        <>
          <RewardPanel reward={reward} />
          {capped && <p className="text-xs opacity-70">{locale === "en" ? "You've collected today's game rewards - learning in lessons still earns XP!" : "Награды за игры на сегодня собраны - уроки по-прежнему дают опыт!"}</p>}
        </>
      )}
      {phase !== "saving" && (
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="glass" onClick={() => { setRound((r) => r + 1); setResult(null); setReward(null); setPhase("playing"); }}>{t("tryAgain")}</Button>
          {embedded ? <Button variant="sun" onClick={onDone}>{t("continue")}</Button> : <Link href="/play/games"><Button variant="sun">{t("continue")}</Button></Link>}
        </div>
      )}
    </Card>
  );
}
