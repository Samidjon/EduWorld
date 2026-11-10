import type { CharacterId, LText, Locale, MiniGameId } from "@/types/content";

/**
 * Contract for every mini-game component.
 * The shell (src/components/minigames/GameShell.tsx) shows rules + instructions, mounts the game,
 * and when `onFinish` is called it submits the result to POST /api/rewards/minigame.
 */
export interface MiniGameProps {
  locale: Locale;
  /** Child is 4-7: bigger targets, fewer words, audio instructions. */
  young: boolean;
  /** 1 = easiest. The shell picks it from the child's grade/mastery. */
  level: 1 | 2 | 3;
  /** Called exactly once when the round is over. `mistakes` are gentle retries, never punished. */
  onFinish: (result: { score: number; maxScore: number; mistakes: number }) => void;
}

export interface MiniGameMeta {
  id: MiniGameId;
  title: LText;
  /** What the child learns. */
  skill: LText;
  /** Short rules shown before starting. */
  rules: LText[];
  emoji: string;
  guide: CharacterId;
  world: string;
  ages: [number, number];
  color: string;
}
