import { z } from "zod";

/** Shared zod schemas (used by forms on the client and by API routes on the server). */

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(8, "min8").max(128).regex(/[A-Za-zА-Яа-я]/, "letter").regex(/\d/, "digit");
export const pinSchema = z.string().regex(/^\d{4}$/, "pin4");

export const registerSchema = z.object({ email: emailSchema, password: passwordSchema });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  pin: pinSchema.optional().or(z.literal("")),
  consent: z.literal(true),
});

export const GRADE_CODES = ["none", "prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "custom"] as const;
export const SUBJECT_SLUGS = ["early", "math", "reading", "science", "languages", "tech"] as const;
export const GOALS = ["school_readiness", "school_support", "catch_up", "get_ahead", "exam_prep", "languages", "general"] as const;

const nickname = z
  .string()
  .trim()
  .min(1)
  .max(24)
  // nickname only - discourage full names, emails, phone numbers
  .refine((s) => !/@|\d{5,}|https?:/i.test(s), "nickname_private");

export const avatarSchema = z.object({
  base: z.enum(["fox", "bunny", "bear", "owl", "cat", "panda"]),
  furColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  outfitColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  hat: z.string().max(40).nullable(),
  outfit: z.string().max(40).nullable(),
  accessory: z.string().max(40).nullable(),
  shoes: z.string().max(40).nullable(),
  pet: z.string().max(40).nullable(),
  expression: z.enum(["happy", "cool", "wink"]),
});

export const childSchema = z
  .object({
    nickname,
    age: z.number().int().min(4).max(17),
    grade: z.enum(GRADE_CODES),
    customLevel: z.number().int().min(-1).max(11).nullable().optional(),
    country: z.string().min(2).max(4),
    curriculumId: z.string().min(1).max(60),
    language: z.enum(["ru", "en", "uz"]),
    subjects: z.array(z.enum(SUBJECT_SLUGS)).max(6),
    goal: z.enum(GOALS),
    avatar: avatarSchema,
  })
  .refine((c) => c.grade !== "custom" || c.customLevel !== undefined, { path: ["customLevel"], message: "required" });

const codeBlock = z.enum(["forward", "left", "right", "repeat2", "repeat3", "end"]);
export const answerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("single"), index: z.number().int().min(0).max(20) }),
  z.object({ type: z.literal("multiple"), indexes: z.array(z.number().int().min(0).max(20)).max(20) }),
  z.object({ type: z.literal("true_false"), value: z.boolean() }),
  z.object({ type: z.literal("drag_drop"), placement: z.record(z.string().max(40), z.string().max(40)) }),
  z.object({ type: z.literal("matching"), pairs: z.record(z.string().max(4), z.number().int().min(0).max(30)) }),
  z.object({ type: z.literal("fill_blank"), text: z.string().max(200) }),
  z.object({ type: z.literal("ordering"), order: z.array(z.number().int().min(0).max(30)).max(30) }),
  z.object({ type: z.literal("number_input"), value: z.number().finite() }),
  z.object({ type: z.literal("word_building"), text: z.string().max(60) }),
  z.object({ type: z.literal("image_selection"), index: z.number().int().min(0).max(20) }),
  z.object({ type: z.literal("audio_recognition"), index: z.number().int().min(0).max(20) }),
  z.object({ type: z.literal("drawing"), coverage: z.number().min(0).max(1) }),
  z.object({ type: z.literal("math_input"), text: z.string().max(100) }),
  z.object({ type: z.literal("code_blocks"), program: z.array(codeBlock).max(40) }),
]);

export const answerRequestSchema = z.object({
  questionId: z.string().min(1).max(120),
  answer: answerSchema,
  attemptId: z.string().uuid().optional(),
  hintUsed: z.boolean().optional(),
});

export const settingsSchema = z
  .object({
    aiEnabled: z.boolean(),
    aiPhotoEnabled: z.boolean(),
    aiSaveHistory: z.boolean(),
    minigamesEnabled: z.boolean(),
    shopEnabled: z.boolean(),
    dailyLimitMinutes: z.number().int().min(0).max(480),
    breakEveryMinutes: z.number().int().min(0).max(120),
    allowedSubjects: z.array(z.enum(SUBJECT_SLUGS)),
    weeklyGoalLessons: z.number().int().min(1).max(50),
    notifications: z.object({ weeklyReport: z.boolean(), achievements: z.boolean() }),
    schedule: z.object({ days: z.array(z.number().int().min(0).max(6)), from: z.string().regex(/^\d{2}:\d{2}$/), to: z.string().regex(/^\d{2}:\d{2}$/) }).nullable(),
  })
  .partial();
