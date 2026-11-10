import type { Answer, Question } from "@/types/content";

/**
 * Contract for a question-type component. The parent (QuestionRunner) renders the prompt,
 * visual, audio button, hint and feedback; the type component renders only the answer UI
 * and calls `onSubmit` with an Answer of the matching type when the child presses its
 * "Check" button. `disabled` is true while the server checks the answer or after it is correct.
 * `resetKey` changes when the child should be allowed to try again (clear wrong input if sensible).
 */
export interface QuestionTypeProps<Q extends Question = Question> {
  q: Q;
  onSubmit: (a: Answer) => void;
  disabled: boolean;
  resetKey: number;
  /** "correct" | "wrong" | null - lets the component highlight its own state. */
  status: "correct" | "wrong" | null;
}
