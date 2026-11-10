/**
 * EduWorld content model.
 * Learning content lives in src/data (content layer), never inside React components.
 * Every user-facing string is localized: `en` and `ru` are required, `uz` is optional
 * and falls back to `ru` then `en` (see src/lib/i18n/text.ts).
 */

export type Locale = "ru" | "en" | "uz";
export const LOCALES: Locale[] = ["ru", "en", "uz"];

export type LText = { en: string; ru: string; uz?: string };
/** Accepted typed answers per language (compared case-insensitively, trimmed). */
export type LAnswers = { en: string[]; ru: string[]; uz?: string[] };

export type ContentStatus = "draft" | "reviewed" | "published" | "archived";

export type SubjectSlug = "early" | "math" | "reading" | "science" | "languages" | "tech";
export type WorldSlug = "little-steps" | "numberia" | "bookoria" | "scientia" | "lingua" | "techtown";
export type CharacterId = "foxy" | "oli" | "bruno" | "luna";

/**
 * Grade level as a number: -1 = not in school yet, 0 = preparatory group, 1..11 = school grades.
 * Age and grade are independent parameters (see docs/ARCHITECTURE.md).
 */
export type GradeLevel = number;
export type GradeRange = [GradeLevel, GradeLevel];

export interface Subject {
  slug: SubjectSlug;
  name: LText;
  description: LText;
  world: WorldSlug;
}

export interface Topic {
  id: string; // stable slug, e.g. "math.addition-20"
  subject: SubjectSlug;
  world: WorldSlug;
  grades: GradeRange;
  title: LText;
  description: LText;
  /** Topic ids that must be understood before this one (skill graph). */
  prerequisites: string[];
  /** Skills that this topic develops, used for the skill tree labels. */
  skills: LText[];
}

/* ---------------- Visual examples ---------------- */

export type Visual =
  | { kind: "emoji"; items: string[]; caption?: LText }
  | { kind: "groups"; emoji: string; groups: number; per: number; caption?: LText }
  | { kind: "equation"; text: string; caption?: LText }
  | { kind: "fraction"; num: number; den: number; caption?: LText }
  | { kind: "numberline"; from: number; to: number; marks: number[]; caption?: LText }
  | { kind: "text"; text: LText }
  | { kind: "code"; code: string; caption?: LText };

/* ---------------- Questions ---------------- */

interface QuestionBase {
  id: string; // unique across all content, e.g. "math.addition-20.l1.q3"
  prompt: LText;
  /** Gentle hint shown after a wrong attempt. */
  hint?: LText;
  /** Short explanation shown after answering (both correct and incorrect). */
  explanation: LText;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Read the prompt aloud (speech synthesis) - recommended for ages 4-7. */
  audio?: boolean;
  visual?: Visual;
}

export interface SingleChoiceQ extends QuestionBase { type: "single"; options: LText[]; answer: number }
export interface MultipleChoiceQ extends QuestionBase { type: "multiple"; options: LText[]; answers: number[] }
export interface TrueFalseQ extends QuestionBase { type: "true_false"; answer: boolean }
export interface DragDropQ extends QuestionBase {
  type: "drag_drop";
  items: { id: string; label: LText }[];
  buckets: { id: string; label: LText }[];
  /** itemId -> bucketId */
  answer: Record<string, string>;
}
export interface MatchingQ extends QuestionBase { type: "matching"; pairs: { left: LText; right: LText }[] }
export interface FillBlankQ extends QuestionBase {
  type: "fill_blank";
  /** Text containing exactly one "___" placeholder. */
  text: LText;
  accepted: LAnswers;
}
export interface OrderingQ extends QuestionBase { type: "ordering"; /** in correct order */ items: LText[] }
export interface NumberInputQ extends QuestionBase { type: "number_input"; answer: number; tolerance?: number; unit?: LText }
export interface WordBuildingQ extends QuestionBase { type: "word_building"; word: LText }
export interface ImageSelectionQ extends QuestionBase {
  type: "image_selection";
  options: { emoji: string; label: LText }[];
  answer: number;
}
export interface AudioRecognitionQ extends QuestionBase {
  type: "audio_recognition";
  /** What the speech synthesizer says. */
  say: LText;
  options: LText[];
  answer: number;
}
export interface DrawingQ extends QuestionBase {
  type: "drawing";
  /** Polyline to trace, coordinates 0..100. */
  path: [number, number][];
  label: LText;
}
export interface MathInputQ extends QuestionBase {
  type: "math_input";
  /** Accepted answers such as "3/4", "0.75", "x=3". Compared numerically when possible. */
  accepted: string[];
}
export type CodeBlock = "forward" | "left" | "right" | "repeat2" | "repeat3" | "end";
export interface CodeBlocksQ extends QuestionBase {
  type: "code_blocks";
  grid: {
    width: number;
    height: number;
    start: [number, number];
    /** 0 = up, 1 = right, 2 = down, 3 = left */
    dir: 0 | 1 | 2 | 3;
    goal: [number, number];
    walls: [number, number][];
  };
  blocks: CodeBlock[];
  maxBlocks: number;
}

export type Question =
  | SingleChoiceQ
  | MultipleChoiceQ
  | TrueFalseQ
  | DragDropQ
  | MatchingQ
  | FillBlankQ
  | OrderingQ
  | NumberInputQ
  | WordBuildingQ
  | ImageSelectionQ
  | AudioRecognitionQ
  | DrawingQ
  | MathInputQ
  | CodeBlocksQ;

export type QuestionType = Question["type"];

/* ---------------- Answers (client -> server) ---------------- */

export type Answer =
  | { type: "single"; index: number }
  | { type: "multiple"; indexes: number[] }
  | { type: "true_false"; value: boolean }
  | { type: "drag_drop"; placement: Record<string, string> }
  | { type: "matching"; /** left index -> right index (original order) */ pairs: Record<string, number> }
  | { type: "fill_blank"; text: string }
  | { type: "ordering"; /** indexes into original items in chosen order */ order: number[] }
  | { type: "number_input"; value: number }
  | { type: "word_building"; text: string }
  | { type: "image_selection"; index: number }
  | { type: "audio_recognition"; index: number }
  | { type: "drawing"; coverage: number }
  | { type: "math_input"; text: string }
  | { type: "code_blocks"; program: CodeBlock[] };

/* ---------------- Lessons ---------------- */

export type MiniGameId =
  | "alphabet-finder"
  | "word-builder"
  | "number-counting"
  | "math-challenge"
  | "memory-match"
  | "pattern-puzzle"
  | "logic-maze"
  | "shape-builder"
  | "reading-adventure"
  | "science-lab"
  | "robot-coder";

export interface GeneratedSet {
  /** Id of a procedural generator from src/features/learning/generators.ts */
  generator: string;
  count: number;
}

export interface Lesson {
  id: string; // e.g. "math.addition-20.l1"
  topicId: string;
  title: LText;
  subtopic: LText;
  objective: LText;
  ageRange: [number, number];
  grades: GradeRange;
  difficulty: 1 | 2 | 3 | 4 | 5;
  durationMin: number;
  character: CharacterId;
  /** 1. Introduction line said by the guide character. */
  intro: LText;
  /** 2. Short explanation (1-4 short paragraphs). */
  explanation: LText[];
  /** 3. Visual example. */
  example: Visual;
  /** 4. Practice exercises (hints allowed, unlimited retries). */
  practice: Question[];
  /** Extra procedurally generated practice. */
  generated?: GeneratedSet[];
  /** 5. Optional game task embedded in the lesson. */
  game?: MiniGameId;
  /** 6. Understanding check (scored). */
  check: Question[];
  /** Fraction of check questions answered correctly on first try to count as mastered. */
  masteryScore: number;
  /** Recommendation shown when the child needs to review. */
  reviewTips: LText;
  status: ContentStatus;
}

export interface BossChallenge {
  id: string;
  world: WorldSlug;
  name: LText;
  description: LText;
  /** Friendly, non-scary look: emoji + colour. */
  emoji: string;
  color: string;
  /** Topics whose skills the boss tests (also its unlock requirement). */
  topics: string[];
  questionCount: number;
  passScore: number;
  reward: { xp: number; coins: number; itemId?: string };
}

export interface WorldDef {
  slug: WorldSlug;
  subject: SubjectSlug;
  name: LText;
  tagline: LText;
  description: LText;
  guide: CharacterId;
  palette: { from: string; to: string; accent: string; soft: string };
  emoji: string;
  /** Position on the central map, percentages. */
  mapPos: { x: number; y: number };
  /** World opens when every listed topic is mastered (or placed by the diagnostic). Empty = open. */
  unlockTopics: string[];
  /** Alternatively opens when the child's grade level is at least this value AND the diagnostic is done. */
  unlockGrade?: GradeLevel;
}

export interface Curriculum {
  id: string;
  countryCode: string; // ISO 3166-1 alpha-2 or "INTL"
  name: LText;
  language: Locale;
  version: string;
  status: ContentStatus;
  /** Where the topic mapping comes from. Never claim an official programme that has not been verified. */
  source: LText;
  official: boolean;
}

export interface GameItem {
  id: string;
  name: LText;
  type: "hat" | "outfit" | "accessory" | "shoes" | "pet" | "decor" | "color";
  rarity: "common" | "rare" | "epic" | "legendary";
  price: number; // coins; 0 = reward-only
  /** Render hint used by the avatar/room renderer. */
  art: string;
  rewardOnly?: boolean;
}

export interface AchievementDef {
  id: string;
  name: LText;
  description: LText;
  icon: string; // emoji
  requirement:
    | { kind: "lessons_completed"; count: number }
    | { kind: "topics_mastered"; count: number }
    | { kind: "correct_answers"; count: number }
    | { kind: "streak_days"; count: number }
    | { kind: "level"; count: number }
    | { kind: "bosses_defeated"; count: number }
    | { kind: "games_played"; count: number }
    | { kind: "worlds_unlocked"; count: number }
    | { kind: "assessment_done" }
    | { kind: "items_owned"; count: number };
  reward: { xp: number; coins: number };
}
