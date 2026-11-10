"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Volume2 } from "lucide-react";
import type { Answer, CharacterId, LText, Question } from "@/types/content";
import { QuestionInput } from "./questions";
import { VisualView } from "./VisualView";
import { Character } from "@/components/characters/Character";
import { Button, ErrorNote } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { speak, sfx } from "@/lib/audio";
import { api, ApiError } from "@/lib/client";

export interface AnswerResult { correct: boolean; explanation: LText; hint: LText | null }

interface Props {
  q: Question;
  guide: CharacterId;
  attemptId?: string;
  /** Custom submit (assessment); defaults to POST /api/play/answer. */
  submit?: (a: Answer, hintUsed: boolean) => Promise<AnswerResult>;
  /** One attempt only (diagnostic): go on after the first answer. */
  single?: boolean;
  /** Called when the child moves on. firstTry = solved correctly on the first attempt. */
  onNext: (r: { firstTry: boolean; correct: boolean }) => void;
}

const ENCOURAGE = ["niceTry", "close1", "together"] as const;

/**
 * Wraps a question-type component with prompt, visual, read-aloud, server-side checking,
 * gentle feedback, hints and retries. Feedback never uses negative wording.
 */
export function QuestionRunner({ q, guide, attemptId, submit, single, onNext }: Props) {
  const { t, tl, locale, young } = useT();
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const [busy, setBusy] = useState(false);
  const [tries, setTries] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [explanation, setExplanation] = useState<LText | null>(null);
  const [hint, setHint] = useState<LText | null>(q.hint ?? null);
  const [error, setError] = useState<string | null>(null);
  const firstTry = useRef<boolean | null>(null);

  useEffect(() => {
    if (q.audio || young) {
      const id = setTimeout(() => speak(tl(q.prompt), locale), 300);
      return () => clearTimeout(id);
    }
  }, [q.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(a: Answer) {
    if (busy || status === "correct") return;
    setBusy(true);
    setError(null);
    try {
      const r = submit ? await submit(a, showHint) : await api<AnswerResult>("/api/play/answer", { questionId: q.id, answer: a, attemptId, hintUsed: showHint });
      if (firstTry.current === null) firstTry.current = r.correct;
      setExplanation(r.explanation);
      if (r.hint) setHint(r.hint);
      setTries((n) => n + 1);
      if (r.correct) {
        setStatus("correct");
        sfx("correct");
      } else {
        setStatus("wrong");
        sfx("tryAgain");
      }
    } catch (e) {
      setError(e instanceof ApiError && e.code === "network" ? t("networkError") : e instanceof ApiError && e.code === "daily_limit" ? t("dailyLimitReached") : t("errorGeneric"));
    } finally {
      setBusy(false);
    }
  }

  const retry = () => {
    setStatus(null);
    setResetKey((k) => k + 1);
    if (tries >= 1 && hint) setShowHint(true);
  };

  const canSkip = status === "wrong" && (single || tries >= 2);
  const done = status === "correct" || (single && status !== null);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 -ml-1"><Character id={guide} portrait size={young ? 72 : 60} emotion={status === "correct" ? "celebrate" : status === "wrong" ? "think" : "happy"} animation={status === "correct" ? "jump" : "none"} /></div>
        <div className="glass relative flex-1 rounded-3xl rounded-tl-md p-4">
          <p className={young ? "font-display text-2xl leading-snug" : "font-display text-xl leading-snug"}>{tl(q.prompt)}</p>
          <button onClick={() => speak(tl(q.prompt), locale)} className="absolute right-2 top-2 rounded-full p-2 opacity-70 hover:opacity-100 hover:bg-white/10" aria-label={t("listen")}>
            <Volume2 className="size-5" />
          </button>
        </div>
      </div>

      {q.visual && <div className="glass rounded-3xl p-4"><VisualView v={q.visual} /></div>}

      <QuestionInput q={q} onSubmit={onSubmit} disabled={busy || done || status === "wrong"} resetKey={resetKey} status={status} />

      <ErrorNote>{error}</ErrorNote>

      {showHint && hint && status !== "correct" && (
        <div className="flex gap-2 rounded-2xl bg-sun/15 border border-sun/40 p-3 text-sm"><Lightbulb className="size-5 shrink-0 text-sun" aria-hidden />{tl(hint)}</div>
      )}

      <AnimatePresence>
        {status && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={status === "correct" ? "rounded-3xl bg-mint/20 border border-mint/50 p-4" : "rounded-3xl bg-coral/15 border border-coral/40 p-4"} role="status" aria-live="polite">
            <p className="font-display text-xl">{status === "correct" ? `🎉 ${t("great")}` : t(ENCOURAGE[Math.min(tries - 1, 2)] ?? "niceTry")}</p>
            {explanation && (status === "correct" || canSkip) && <p className="mt-1 opacity-90">{tl(explanation)}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {status === "wrong" && !single && <Button variant="sun" onClick={retry}>{t("tryAgain")}</Button>}
              {status === "wrong" && !single && !showHint && hint && <Button variant="glass" icon={<Lightbulb className="size-4" />} onClick={() => { setShowHint(true); retry(); }}>{t("hint")}</Button>}
              {(done || canSkip) && <Button variant={status === "correct" ? "mint" : "glass"} onClick={() => onNext({ firstTry: !!firstTry.current, correct: status === "correct" })}>{t("next")}</Button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
