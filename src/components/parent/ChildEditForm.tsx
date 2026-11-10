"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, inputCls } from "@/components/ui";
import { SUBJECTS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import { api } from "@/lib/client";
import { childSchema, GRADE_CODES, SUBJECT_SLUGS } from "@/lib/validation";
import type { GradeCode } from "@/types/db";
import { useP } from "./i18n";
import { Chip, SuccessNote } from "./controls";
import { LANG_KEYS, gradeLabel, levelLabel } from "./labels";

const schema = z
  .object({
    nickname: childSchema.innerType().shape.nickname,
    age: z.number({ invalid_type_error: "required" }).int().min(4, "range").max(17, "range"),
    grade: z.enum(GRADE_CODES),
    customLevel: z.number().int().min(-1).max(11).nullable(),
    language: z.enum(["ru", "en", "uz"]),
    subjects: z.array(z.enum(SUBJECT_SLUGS)).max(6),
  })
  .refine((d) => d.grade !== "custom" || d.customLevel !== null, { path: ["customLevel"], message: "required" });

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;

export interface EditableChild {
  id: string;
  nickname: string;
  age: number;
  grade: GradeCode;
  customLevel: number | null;
  language: "ru" | "en" | "uz";
  subjects: (typeof SUBJECT_SLUGS)[number][];
}

const AGES = Array.from({ length: 14 }, (_, i) => i + 4);
const LEVELS = Array.from({ length: 13 }, (_, i) => i - 1);

export function ChildEditForm({ child }: { child: EditableChild }) {
  const { t, locale, err, v } = useP();
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting, isDirty } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: child.nickname, age: child.age, grade: child.grade, customLevel: child.customLevel, language: child.language, subjects: child.subjects },
  });
  const grade = watch("grade");
  const subjects = watch("subjects");

  const onSubmit = async (d: Out) => {
    setError("");
    setOk(false);
    try {
      // send only what changed (re-sending the age would re-record it for the current year)
      const patch: Record<string, unknown> = {};
      if (d.nickname !== child.nickname) patch.nickname = d.nickname;
      if (d.age !== child.age) patch.age = d.age;
      if (d.grade !== child.grade || (d.grade === "custom" && d.customLevel !== child.customLevel)) {
        patch.grade = d.grade;
        patch.customLevel = d.grade === "custom" ? d.customLevel : null;
      }
      if (d.language !== child.language) patch.language = d.language;
      if (d.subjects.join(",") !== child.subjects.join(",")) patch.subjects = d.subjects;
      await api(`/api/children/${child.id}`, patch, "PATCH");
      setOk(true);
      reset(d);
      router.refresh();
    } catch (e) {
      setError(err(e));
    }
  };

  return (
    <LightCard className="p-6">
      <h2 className="mb-4 font-display text-xl">{t("editProfile")}</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" onChange={() => setOk(false)}>
        <Field label={t("wizNicknameLabel")} hint={t("wizNicknameWarn")} error={v(errors.nickname?.message)}>
          <input className={inputCls} maxLength={24} autoComplete="off" {...register("nickname")} aria-invalid={!!errors.nickname} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fieldAge")} error={v(errors.age?.message)}>
            <select className={inputCls} {...register("age", { valueAsNumber: true })}>
              {AGES.map((a) => <option key={a} value={a}>{t("years", { n: a })}</option>)}
            </select>
          </Field>
          <Field label={t("fieldGrade")} error={v(errors.grade?.message)}>
            <select className={inputCls} {...register("grade")}>
              {GRADE_CODES.map((g) => <option key={g} value={g}>{gradeLabel(g, null, t)}</option>)}
            </select>
          </Field>
        </div>
        <p className="flex gap-2 text-xs text-slate-500">
          <Info className="size-4 shrink-0" aria-hidden />
          {t("wizGradeNote")}
        </p>
        {grade === "custom" && (
          <Field label={t("wizCustomLevel")} error={v(errors.customLevel?.message)}>
            <Controller
              control={control}
              name="customLevel"
              render={({ field }) => (
                <select className={inputCls} value={field.value === null || field.value === undefined ? "" : String(field.value)} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} onBlur={field.onBlur}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l, t)}</option>)}
                </select>
              )}
            />
          </Field>
        )}
        <Field label={t("wizLanguage")}>
          <select className={inputCls} {...register("language")}>
            {(["ru", "en", "uz"] as const).map((l) => <option key={l} value={l}>{t(LANG_KEYS[l])}</option>)}
          </select>
        </Field>
        <div>
          <p className="text-sm font-bold">{t("fieldSubjects")}</p>
          <p className="text-xs text-slate-500">{t("wizSubjectsHint")}</p>
          <div role="group" aria-label={t("fieldSubjects")} className="mt-2 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const sel = subjects.includes(s.slug);
              return (
                <Chip key={s.slug} selected={sel} onClick={() => { setOk(false); setValue("subjects", sel ? subjects.filter((x) => x !== s.slug) : [...subjects, s.slug], { shouldDirty: true }); }}>
                  {tx(s.name, locale)}
                </Chip>
              );
            })}
          </div>
        </div>
        <ErrorNote>{error}</ErrorNote>
        {ok && <SuccessNote>{t("profileSaved")}</SuccessNote>}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
          {isSubmitting ? t("saving") : t("save")}
        </Button>
      </form>
    </LightCard>
  );
}
