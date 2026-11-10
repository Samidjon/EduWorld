/** Row types mirroring supabase/migrations/0001_init.sql. Keep the two in sync. */
import type { Locale } from "./content";

export type Role = "parent" | "admin";

export interface UserRow { id: string; email: string; role: Role; created_at: string }

export interface ParentProfileRow {
  id: string;
  user_id: string;
  display_name: string;
  consent_at: string | null;
  created_at: string;
}

export type GradeCode = "none" | "prep" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "custom";
export type AgeGroup = "4-5" | "6-7" | "8-10" | "11-13" | "14-17";

export interface AvatarConfig {
  base: "fox" | "bunny" | "bear" | "owl" | "cat" | "panda";
  furColor: string;
  outfitColor: string;
  hat: string | null;
  outfit: string | null;
  accessory: string | null;
  shoes: string | null;
  pet: string | null;
  expression: "happy" | "cool" | "wink";
}

export interface ChildProfileRow {
  id: string;
  parent_id: string;
  nickname: string;
  /** Only the age in whole years at signup and the year it was recorded; no birth date. */
  age_years: number;
  age_recorded_year: number;
  age_group: AgeGroup;
  current_grade: GradeCode;
  /** For grade "custom": the level the parent estimates (-1..11). */
  custom_level: number | null;
  country_code: string;
  curriculum_id: string;
  interface_language: Locale;
  preferred_subjects: string[];
  learning_goal: string;
  avatar_config: AvatarConfig;
  assessment_completed_at: string | null;
  created_at: string;
}

export interface LessonAttemptRow {
  id: string;
  child_id: string;
  lesson_id: string;
  topic_id: string;
  kind: "lesson" | "boss" | "assessment" | "review";
  score: number | null;
  completed: boolean;
  xp_awarded: number;
  coins_awarded: number;
  started_at: string;
  completed_at: string | null;
}

export interface QuestionAttemptRow {
  id: string;
  child_id: string;
  question_id: string;
  topic_id: string;
  lesson_attempt_id: string | null;
  /** Minimal answer payload kept for mistake analysis; purged after retention period. */
  answer_data: unknown;
  is_correct: boolean;
  hint_used: boolean;
  created_at: string;
}

export type ProgressStatus = "new" | "learning" | "mastered" | "needs_review";

export interface LearningProgressRow {
  id: string;
  child_id: string;
  topic_id: string;
  mastery_level: number;
  attempts_count: number;
  correct_count: number;
  /** Last up to 10 results, "1" = correct, "0" = wrong, newest last. */
  recent_results: string;
  status: ProgressStatus;
  review_stage: number;
  placed_by_assessment: boolean;
  last_practiced_at: string | null;
  next_review_at: string | null;
}

export interface GameProfileRow {
  id: string;
  child_id: string;
  level: number;
  xp: number; // xp inside current level
  total_xp: number;
  coins: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null; // YYYY-MM-DD
  home_config: { placed: { itemId: string; x: number; y: number }[]; wallpaper: string };
}

export interface ChildAchievementRow { id: string; child_id: string; achievement_id: string; unlocked_at: string }
export interface InventoryRow { id: string; child_id: string; item_id: string; quantity: number; acquired_at: string }
export interface DailyChallengeRow { id: string; date: string; title: string; challenge_data: ChallengeData }
export interface ChallengeData {
  kind: "lessons" | "correct" | "games" | "subject_lesson" | "review";
  target: number;
  subject?: string;
  reward: { xp: number; coins: number };
  title: { en: string; ru: string; uz?: string };
}
export interface ChildChallengeRow { id: string; child_id: string; challenge_id: string; progress: number; completed_at: string | null; claimed_at: string | null }
export interface GameSessionRow { id: string; child_id: string; game_id: string; score: number; max_score: number; xp_awarded: number; coins_awarded: number; created_at: string }
export interface AiSessionRow { id: string; child_id: string; created_at: string }
export interface AiMessageRow { id: string; session_id: string; child_id: string; role: "user" | "assistant"; content: string; flagged: boolean; created_at: string }
export interface DailyActivityRow { id: string; child_id: string; date: string; minutes: number }

export interface ParentSettings {
  pinHash: string | null;
  aiEnabled: boolean;
  aiPhotoEnabled: boolean;
  aiSaveHistory: boolean;
  minigamesEnabled: boolean;
  shopEnabled: boolean;
  dailyLimitMinutes: number; // 0 = no limit
  breakEveryMinutes: number; // 0 = no reminder
  allowedSubjects: string[]; // empty = all
  weeklyGoalLessons: number;
  notifications: { weeklyReport: boolean; achievements: boolean };
  schedule: { days: number[]; from: string; to: string } | null; // days 0=Sun
}

export interface ParentSettingsRow { id: string; parent_id: string; settings_json: ParentSettings }

export interface Tables {
  users: UserRow;
  parent_profiles: ParentProfileRow;
  child_profiles: ChildProfileRow;
  lesson_attempts: LessonAttemptRow;
  question_attempts: QuestionAttemptRow;
  learning_progress: LearningProgressRow;
  game_profiles: GameProfileRow;
  child_achievements: ChildAchievementRow;
  inventory: InventoryRow;
  daily_challenges: DailyChallengeRow;
  child_challenges: ChildChallengeRow;
  game_sessions: GameSessionRow;
  ai_sessions: AiSessionRow;
  ai_messages: AiMessageRow;
  daily_activity: DailyActivityRow;
  parent_settings: ParentSettingsRow;
}
export type TableName = keyof Tables;
