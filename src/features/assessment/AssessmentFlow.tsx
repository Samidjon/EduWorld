"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Answer, Question } from "@/types/content";
import { QuestionRunner, type AnswerResult } from "@/components/lessons/QuestionRunner";
import { Character } from "@/components/characters/Character";
import { Button, Card, ErrorNote, Progress } from "@/components/ui";
import { useT } from "@/components/shared/LocaleProvider";
import { RewardPanel, type RewardData } from "@/components/rewards/RewardPanel";
import { api } from "@/lib/client";
import { TOPIC_MAP } from "@/data/topics";

type Domain = "math" | "reading" | "logic";
interface DoneResult { domains: Record<Domain, { placedTopic: string | null; accuracy: number; asked: number }>; avgSeconds: number }

const DOMAIN_LABEL: Record<Domain, { en: string; ru: string; emoji: string }> = {
  math: { en: "Numbers & maths", ru: "Числа и математика", emoji: "🔢" },
  reading: { en: "Letters & reading", ru: "Буквы и чтение", emoji: "📚" },
  logic: { en: "Logic & attention", ru: "Логика и внимание", emoji: "🧩" },
};

/** Initial adaptive diagnostic. Each answer is checked on the server; one attempt per question. */
export function AssessmentFlow({ nickname }: { nickname: string }) {
  const { t, tl, locale, young } = useT();
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [q, setQ] = useState<Question | null>(null);
  const [domain, setDomain] = useState<Domain>("math");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ result: DoneResult; reward: RewardData } | null>(null);
  const token = useRef("");
  const shownAt = useRef(Date.now());
  const pending = useRef<{ q?: Question; domain?: Domain; progress?: number; done?: { result: DoneResult; reward: RewardData } } | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const r = await api<{ token: string; question: Question; domain: Domain; progress: number }>("/api/play/assessment-start");
      token.current = r.token;
      setQ(r.question);
      setDomain(r.domain);
      setProgress(0);
      shownAt.current = Date.now();
      setPhase("play");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  const submit = async (a: Answer): Promise<AnswerResult> => {
    const r = await api<{ correct: boolean; done: boolean; token?: string; question?: Question; domain?: Domain; progress?: number; result?: DoneResult; reward?: RewardData }>("/api/play/assessment-answer", { token: token.current, answer: a, ms: Date.now() - shownAt.current });
    if (r.done) pending.current = { done: { result: r.result!, reward: r.reward! } };
    else {
      token.current = r.token!;
      pending.current = { q: r.question, domain: r.domain, progress: r.progress };
    }
    // the diagnostic does not reveal right/wrong in detail - it stays encouraging
    return { correct: r.correct, explanation: { en: "Thanks! Let's go on.", ru: "Спасибо! Идём дальше." }, hint: null };
  };

  const onNext = () => {
    const p = pending.current;
    pending.current = null;
    if (!p) return;
    if (p.done) {
      setResult(p.done);
      setPhase("done");
      return;
    }
    if (p.q) {
      setQ(p.q);
      setDomain(p.domain ?? domain);
      setProgress(p.progress ?? progress);
      shownAt.current = Date.now();
    }
  };

  if (phase === "intro") {
    return (
      <Card className="mx-auto max-w-xl text-center space-y-4">
        <div className="flex justify-center gap-2">
          <Character id="foxy" animation="wave" size={young ? 130 : 110} />
          <Character id="oli" animation="idle" size={young ? 120 : 100} />
        </div>
        <h1 className="font-display text-3xl">{locale === "en" ? `Welcome to EduWorld, ${nickname}!` : `Добро пожаловать в EduWorld, ${nickname}!`}</h1>
        <p className="text-lg">{locale === "en" ? "Let's play a short starting adventure so Foxy knows where your journey begins. It's not a test - there are no wrong steps!" : "Давай пройдём короткое стартовое приключение, чтобы Фокси узнал, откуда начать твой путь. Это не экзамен - ошибаться можно!"}</p>
        <ErrorNote>{error}</ErrorNote>
        <Button variant="sun" size="xl" loading={loading} onClick={start}>{t("start")}</Button>
      </Card>
    );
  }

  if (phase === "done" && result) {
    return (
      <Card className="mx-auto max-w-xl space-y-4 text-center">
        <Character id="foxy" animation="celebrate" emotion="celebrate" size={130} className="mx-auto" />
        <h1 className="font-display text-3xl">{locale === "en" ? "Your adventure is ready!" : "Твоё приключение готово!"}</h1>
        <div className="grid gap-2 text-left">
          {(Object.keys(DOMAIN_LABEL) as Domain[]).map((d) => {
            const r = result.result.domains[d];
            const topic = r.placedTopic ? TOPIC_MAP.get(r.placedTopic) : null;
            return (
              <div key={d} className="glass rounded-2xl p-3">
                <p className="font-bold">{DOMAIN_LABEL[d].emoji} {locale === "en" ? DOMAIN_LABEL[d].en : DOMAIN_LABEL[d].ru}</p>
                <p className="text-sm opacity-85">{topic ? `${locale === "en" ? "You already know" : "Ты уже знаешь"}: ${tl(topic.title)}` : locale === "en" ? "We'll start from the very beginning - exciting!" : "Начнём с самого начала - это здорово!"}</p>
              </div>
            );
          })}
        </div>
        <RewardPanel reward={result.reward} />
        <Button variant="sun" size="lg" onClick={() => { window.location.href = "/play/roadmap"; }}>{locale === "en" ? "See my path" : "Мой учебный маршрут"} →</Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="glass flex items-center gap-3 rounded-3xl p-3">
        <span className="text-2xl" aria-hidden>{DOMAIN_LABEL[domain].emoji}</span>
        <Progress value={progress} className="flex-1" label="progress" />
      </div>
      {q && <QuestionRunner key={q.id} q={q} guide={domain === "logic" ? "bruno" : domain === "reading" ? "oli" : "foxy"} submit={submit} single onNext={onNext} />}
    </div>
  );
}
