"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, ArrowLeft, ArrowRight, Info, Pencil } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { AvatarView, DEFAULT_AVATAR, FUR_COLORS, OUTFIT_COLORS } from "@/components/avatar/AvatarView";
import { COUNTRIES, curriculaForCountry, getCurriculum } from "@/data/curricula";
import { SUBJECTS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import { api } from "@/lib/client";
import { childSchema, GOALS, GRADE_CODES, SUBJECT_SLUGS } from "@/lib/validation";
import type { AvatarConfig, GradeCode } from "@/types/db";
import type { Locale } from "@/types/content";
import { useP } from "./i18n";
import { Chip, SuccessNote, Swatch } from "./controls";
import { CurriculumBadges } from "./CurriculumBadges";
import { BASES, LANG_KEYS, goalLabel, gradeLabel, levelLabel, suggestedGrade } from "./labels";

const CORE_ID = "eduworld-core-v1";

/** Same nickname rules as the API (src/lib/validation.ts). */
const nicknameField = childSchema.innerType().shape.nickname;

const schema = z.object({
  nickname: nicknameField,
  age: z.number({ required_error: "required", invalid_type_error: "required" }).int().min(4, "range").max(17, "range"),
  grade: z.enum(GRADE_CODES, { errorMap: () => ({ message: "required" }) }),
  customLevel: z.number().int().min(-1).max(11).nullable(),
  country: z.string().min(2, "required").max(4),
  curriculumId: z.string().min(1, "required"),
  language: z.enum(["ru", "en", "uz"]),
  subjects: z.array(z.enum(SUBJECT_SLUGS)).max(6),
  goal: z.enum(GOALS, { errorMap: () => ({ message: "required" }) }),
  avatar: z.object({ base: z.enum(["fox", "bunny", "bear", "owl", "cat", "panda"]), furColor: z.string(), outfitColor: z.string() }),
});

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;
type FieldName = keyof In;

const STEPS: { key: "nickname" | "age" | "grade" | "country" | "curriculum" | "language" | "subjects" | "avatar" | "review"; fields: FieldName[] }[] = [
  { key: "nickname", fields: ["nickname"] },
  { key: "age", fields: ["age"] },
  { key: "grade", fields: ["grade", "customLevel"] },
  { key: "country", fields: ["country"] },
  { key: "curriculum", fields: ["curriculumId"] },
  { key: "language", fields: ["language"] },
  { key: "subjects", fields: ["subjects", "goal"] },
  { key: "avatar", fields: ["avatar"] },
  { key: "review", fields: [] },
];

const AGES = Array.from({ length: 14 }, (_, i) => i + 4);
const LEVELS = Array.from({ length: 13 }, (_, i) => i - 1);

export function ChildWizard() {
  const { t, locale, err, v } = useP();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const { register, control, handleSubmit, watch, setValue, trigger, setError: setFieldError, clearErrors, formState: { errors, isSubmitting } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nickname: "",
      age: undefined,
      grade: undefined,
      customLevel: null,
      country: "",
      curriculumId: CORE_ID,
      language: locale,
      subjects: [],
      goal: undefined,
      avatar: { base: DEFAULT_AVATAR.base, furColor: DEFAULT_AVATAR.furColor, outfitColor: DEFAULT_AVATAR.outfitColor },
    },
  });

  const values = watch();
  const avatar: AvatarConfig = { ...DEFAULT_AVATAR, ...values.avatar };
  const current = STEPS[step];
  const lname = (l: LocaleLike) => t(LANG_KEYS[l]);

  const goNext = async () => {
    const ok = current.fields.length ? await trigger(current.fields) : true;
    if (current.key === "grade" && values.grade === "custom" && (values.customLevel === null || values.customLevel === undefined)) {
      setFieldError("customLevel", { message: "required" });
      return;
    }
    if (ok) setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onSubmit = async (d: Out) => {
    setError("");
    const payload = {
      nickname: d.nickname,
      age: d.age,
      grade: d.grade,
      customLevel: d.grade === "custom" ? d.customLevel : null,
      country: d.country,
      curriculumId: d.curriculumId,
      language: d.language,
      subjects: d.subjects,
      goal: d.goal,
      avatar: { ...DEFAULT_AVATAR, ...d.avatar },
    };
    const check = childSchema.safeParse(payload);
    if (!check.success) {
      setError(t("errInvalidInput"));
      return;
    }
    try {
      await api("/api/children", check.data);
      setCreated(true);
      // the API switched this device into child mode
      window.location.href = "/play/assessment";
    } catch (e) {
      setError(err(e));
    }
  };

  const curricula = values.country ? curriculaForCountry(values.country) : [];
  const age = values.age;
  const suggestion = typeof age === "number" ? suggestedGrade(age) : null;

  return (
    <form onSubmit={current.key === "review" ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); void goNext(); }} noValidate className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-500">{t("wizStepOf", { n: step + 1, total: STEPS.length })}</p>
        <ol className="flex gap-1.5" aria-label={t("wizStepOf", { n: step + 1, total: STEPS.length })}>
          {STEPS.map((s, i) => (
            <li key={s.key} aria-current={i === step ? "step" : undefined} className={cn("h-2.5 rounded-full transition-all", i === step ? "w-6 bg-brand-blue" : i < step ? "w-2.5 bg-brand-blue/50" : "w-2.5 bg-slate-200")} />
          ))}
        </ol>
      </div>

      <LightCard className="min-h-[22rem] space-y-5 p-6">
        {current.key === "nickname" && (
          <>
            <h2 className="font-display text-2xl">{t("wizNickname")}</h2>
            <Field label={t("wizNicknameLabel")} error={v(errors.nickname?.message)}>
              <input className={inputCls} maxLength={24} autoComplete="off" autoFocus {...register("nickname")} aria-invalid={!!errors.nickname} />
            </Field>
            <p className="flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
              <AlertTriangle className="size-5 shrink-0" aria-hidden />
              {t("wizNicknameWarn")}
            </p>
          </>
        )}

        {current.key === "age" && (
          <>
            <h2 className="font-display text-2xl">{t("wizAge")}</h2>
            <div role="group" aria-label={t("fieldAge")} className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {AGES.map((a) => (
                <Chip key={a} big selected={values.age === a} onClick={() => { setValue("age", a, { shouldValidate: true }); }} label={t("years", { n: a })}>
                  {a}
                </Chip>
              ))}
            </div>
            {errors.age && <p role="alert" className="text-sm font-semibold text-red-600">{v(errors.age.message)}</p>}
            <p className="text-sm text-slate-500">{t("wizAgeHint")}</p>
          </>
        )}

        {current.key === "grade" && (
          <>
            <h2 className="font-display text-2xl">{t("wizGrade")}</h2>
            <p className="flex gap-2 rounded-2xl bg-sky/30 p-3 text-sm text-ink">
              <Info className="size-5 shrink-0 text-brand-blue" aria-hidden />
              {t("wizGradeNote")}
            </p>
            {suggestion && typeof age === "number" && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>{t("wizGradeSuggest", { age, grade: gradeLabel(suggestion, null, t) })}</span>
                {values.grade !== suggestion && (
                  <button type="button" className="font-bold text-brand-blue underline underline-offset-2" onClick={() => setValue("grade", suggestion, { shouldValidate: true })}>
                    {t("wizGradeUseSuggest")}
                  </button>
                )}
              </div>
            )}
            <div role="group" aria-label={t("fieldGrade")} className="flex flex-wrap gap-2">
              {GRADE_CODES.map((g) => (
                <Chip key={g} selected={values.grade === g} onClick={() => { setValue("grade", g as GradeCode, { shouldValidate: true }); clearErrors("customLevel"); }}>
                  {gradeLabel(g, null, t)}
                </Chip>
              ))}
            </div>
            {errors.grade && <p role="alert" className="text-sm font-semibold text-red-600">{v(errors.grade.message)}</p>}
            {values.grade === "custom" && (
              <Field label={t("wizCustomLevel")} hint={t("wizCustomLevelHint")} error={v(errors.customLevel?.message)}>
                <Controller
                  control={control}
                  name="customLevel"
                  render={({ field }) => (
                    <select
                      className={inputCls}
                      value={field.value === null || field.value === undefined ? "" : String(field.value)}
                      onChange={(e) => { field.onChange(e.target.value === "" ? null : Number(e.target.value)); clearErrors("customLevel"); }}
                      onBlur={field.onBlur}
                    >
                      <option value="">—</option>
                      {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, t)}</option>)}
                    </select>
                  )}
                />
              </Field>
            )}
          </>
        )}

        {current.key === "country" && (
          <>
            <h2 className="font-display text-2xl">{t("wizCountry")}</h2>
            <div role="group" aria-label={t("fieldCountry")} className="grid gap-2 sm:grid-cols-2">
              {COUNTRIES.map((c) => (
                <Chip
                  key={c.code}
                  className="justify-start"
                  selected={values.country === c.code}
                  onClick={() => {
                    setValue("country", c.code, { shouldValidate: true });
                    if (!curriculaForCountry(c.code).some((x) => x.id === values.curriculumId)) setValue("curriculumId", CORE_ID);
                  }}
                >
                  <span aria-hidden>{c.flag}</span> {tx(c.name, locale)}
                </Chip>
              ))}
            </div>
            {errors.country && <p role="alert" className="text-sm font-semibold text-red-600">{v(errors.country.message)}</p>}
          </>
        )}

        {current.key === "curriculum" && (
          <>
            <h2 className="font-display text-2xl">{t("wizCurriculum")}</h2>
            <p className="text-sm text-slate-600">{t("wizCurriculumIntro")}</p>
            <div role="radiogroup" aria-label={t("fieldCurriculum")} className="space-y-3">
              {curricula.map((c) => {
                const sel = values.curriculumId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => setValue("curriculumId", c.id, { shouldValidate: true })}
                    className={cn("block w-full rounded-3xl border p-4 text-left transition", sel ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/30" : "border-slate-200 bg-white hover:bg-slate-50")}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">{tx(c.name, locale)}</span>
                      <CurriculumBadges c={c} t={t} />
                    </span>
                    <span className="mt-2 block text-sm text-slate-600">{tx(c.source, locale)}</span>
                    {c.status === "draft" && (
                      <span className="mt-2 flex items-center gap-1.5 text-sm font-bold text-amber-800">
                        <AlertTriangle className="size-4" aria-hidden /> {t("draftNote")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {current.key === "language" && (
          <>
            <h2 className="font-display text-2xl">{t("wizLanguage")}</h2>
            <div role="group" aria-label={t("fieldLanguage")} className="flex flex-wrap gap-2">
              {(["ru", "en", "uz"] as const).map((l) => (
                <Chip key={l} selected={values.language === l} onClick={() => setValue("language", l, { shouldValidate: true })}>
                  {lname(l)}
                </Chip>
              ))}
            </div>
          </>
        )}

        {current.key === "subjects" && (
          <>
            <h2 className="font-display text-2xl">{t("wizSubjects")}</h2>
            <div>
              <p className="text-sm text-slate-600">{t("wizSubjectsHint")}</p>
              <div role="group" aria-label={t("fieldSubjects")} className="mt-3 flex flex-wrap gap-2">
                {SUBJECTS.map((s) => {
                  const sel = values.subjects.includes(s.slug);
                  return (
                    <Chip
                      key={s.slug}
                      selected={sel}
                      onClick={() => setValue("subjects", sel ? values.subjects.filter((x) => x !== s.slug) : [...values.subjects, s.slug], { shouldValidate: true })}
                    >
                      {tx(s.name, locale)}
                    </Chip>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="font-bold">{t("wizGoal")}</p>
              <div role="group" aria-label={t("wizGoal")} className="mt-3 grid gap-2 sm:grid-cols-2">
                {GOALS.map((g) => (
                  <Chip key={g} className="justify-start" selected={values.goal === g} onClick={() => setValue("goal", g, { shouldValidate: true })}>
                    {goalLabel(g, t)}
                  </Chip>
                ))}
              </div>
              {errors.goal && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{v(errors.goal.message)}</p>}
            </div>
          </>
        )}

        {current.key === "avatar" && (
          <>
            <h2 className="font-display text-2xl">{t("wizAvatar")}</h2>
            <div className="grid gap-6 md:grid-cols-[180px_1fr]">
              <div className="grid place-items-center rounded-3xl bg-cream p-4">
                <AvatarView config={avatar} size={150} />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-bold">{t("avatarBase")}</p>
                  <div role="group" aria-label={t("avatarBase")} className="flex flex-wrap gap-2">
                    {BASES.map((b) => (
                      <Chip key={b.id} selected={avatar.base === b.id} onClick={() => setValue("avatar.base", b.id)}>
                        {t(b.key)}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">{t("avatarFur")}</p>
                  <div role="group" aria-label={t("avatarFur")} className="flex flex-wrap gap-2">
                    {FUR_COLORS.map((c) => <Swatch key={c} color={c} selected={avatar.furColor === c} onClick={() => setValue("avatar.furColor", c)} label={t("colorN", { c })} />)}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">{t("avatarOutfit")}</p>
                  <div role="group" aria-label={t("avatarOutfit")} className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => <Swatch key={c} color={c} selected={avatar.outfitColor === c} onClick={() => setValue("avatar.outfitColor", c)} label={t("colorN", { c })} />)}
                  </div>
                </div>
                <p className="text-sm text-slate-500">{t("wizAvatarHint")}</p>
              </div>
            </div>
          </>
        )}

        {current.key === "review" && (
          <>
            <h2 className="font-display text-2xl">{t("wizReview")}</h2>
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="grid shrink-0 place-items-center self-start rounded-3xl bg-cream p-3">
                <AvatarView config={avatar} size={110} />
              </div>
              <dl className="flex-1 divide-y divide-slate-100">
                {(
                  [
                    [t("wizNicknameLabel"), values.nickname, 0],
                    [t("fieldAge"), typeof values.age === "number" ? t("years", { n: values.age }) : "", 1],
                    [t("fieldGrade"), values.grade ? gradeLabel(values.grade, values.customLevel, t) : "", 2],
                    [t("fieldCountry"), tx(COUNTRIES.find((c) => c.code === values.country)?.name, locale), 3],
                    [t("fieldCurriculum"), tx(getCurriculum(values.curriculumId)?.name, locale), 4],
                    [t("fieldLanguage"), lname(values.language), 5],
                    [t("fieldSubjects"), values.subjects.length ? values.subjects.map((s) => tx(SUBJECTS.find((x) => x.slug === s)?.name, locale)).join(", ") : t("noneSelected"), 6],
                    [t("fieldGoal"), values.goal ? goalLabel(values.goal, t) : "", 6],
                  ] as [string, string, number][]
                ).map(([label, value, target]) => (
                  <div key={label} className="flex items-start justify-between gap-3 py-2.5">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
                      <dd className="font-semibold">{value}</dd>
                    </div>
                    <button type="button" onClick={() => setStep(target)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label={`${t("edit")}: ${label}`}>
                      <Pencil className="size-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </dl>
            </div>
            {getCurriculum(values.curriculumId)?.status === "draft" && <p className="text-sm font-bold text-amber-800">{t("draftNote")}</p>}
            <p className="rounded-2xl bg-sky/30 p-3 text-sm">{t("wizAfter")}</p>
          </>
        )}
      </LightCard>

      <ErrorNote>{error}</ErrorNote>
      {created && <SuccessNote>{t("wizCreated")}</SuccessNote>}

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="light" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || isSubmitting || created} icon={<ArrowLeft className="size-4" aria-hidden />}>
          {t("back")}
        </Button>
        {current.key === "review" ? (
          <Button type="submit" size="lg" loading={isSubmitting || created}>
            {isSubmitting ? t("wizCreating") : t("wizCreate")}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            {t("next")} <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </form>
  );
}

type LocaleLike = Extract<Locale, "ru" | "en" | "uz">;
