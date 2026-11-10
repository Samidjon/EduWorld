"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, ErrorNote, Field, LightCard, inputCls } from "@/components/ui";
import { SUBJECTS } from "@/data/worlds";
import { tx } from "@/lib/i18n/text";
import { api } from "@/lib/client";
import { SUBJECT_SLUGS, settingsSchema } from "@/lib/validation";
import type { ParentKey } from "@/lib/i18n/parent";
import type { ParentSettings } from "@/types/db";
import { useP } from "./i18n";
import { Chip, SuccessNote, Toggle } from "./controls";

const int = (min: number, max: number) => z.number({ invalid_type_error: "required" }).int("range").min(min, "range").max(max, "range");
const time = z.string().regex(/^\d{2}:\d{2}$/, "required");

const schema = z
  .object({
    dailyLimitMinutes: int(0, 480),
    breakEveryMinutes: int(0, 120),
    weeklyGoalLessons: int(1, 50),
    allowedSubjects: z.array(z.enum(SUBJECT_SLUGS)),
    scheduleEnabled: z.boolean(),
    days: z.array(z.number().int().min(0).max(6)),
    from: time,
    to: time,
    aiEnabled: z.boolean(),
    aiPhotoEnabled: z.boolean(),
    aiSaveHistory: z.boolean(),
    minigamesEnabled: z.boolean(),
    shopEnabled: z.boolean(),
    weeklyReport: z.boolean(),
    achievements: z.boolean(),
  })
  .refine((d) => !d.scheduleEnabled || d.days.length > 0, { path: ["days"], message: "days" })
  .refine((d) => !d.scheduleEnabled || d.from < d.to, { path: ["to"], message: "time_order" });

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;
export type PublicSettings = Omit<ParentSettings, "pinHash">;

const DAYS = [1, 2, 3, 4, 5, 6, 0];
type Slug = (typeof SUBJECT_SLUGS)[number];
const isSlug = (s: string): s is Slug => (SUBJECT_SLUGS as readonly string[]).includes(s);

function toForm(s: PublicSettings): In {
  return {
    dailyLimitMinutes: s.dailyLimitMinutes,
    breakEveryMinutes: s.breakEveryMinutes,
    weeklyGoalLessons: s.weeklyGoalLessons,
    allowedSubjects: s.allowedSubjects.filter(isSlug),
    scheduleEnabled: !!s.schedule,
    days: s.schedule?.days ?? [1, 2, 3, 4, 5],
    from: s.schedule?.from ?? "15:00",
    to: s.schedule?.to ?? "19:00",
    aiEnabled: s.aiEnabled,
    aiPhotoEnabled: s.aiPhotoEnabled,
    aiSaveHistory: s.aiSaveHistory,
    minigamesEnabled: s.minigamesEnabled,
    shopEnabled: s.shopEnabled,
    weeklyReport: s.notifications.weeklyReport,
    achievements: s.notifications.achievements,
  };
}

export function SettingsForm({ initial }: { initial: PublicSettings }) {
  const { t, locale, err, v } = useP();
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting, isDirty } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: toForm(initial),
  });
  const w = watch();

  const onSubmit = async (d: Out) => {
    setError("");
    setOk(false);
    const parsed = settingsSchema.safeParse({
      dailyLimitMinutes: d.dailyLimitMinutes,
      breakEveryMinutes: d.breakEveryMinutes,
      weeklyGoalLessons: d.weeklyGoalLessons,
      allowedSubjects: d.allowedSubjects,
      schedule: d.scheduleEnabled ? { days: [...d.days].sort((a, b) => a - b), from: d.from, to: d.to } : null,
      aiEnabled: d.aiEnabled,
      aiPhotoEnabled: d.aiPhotoEnabled,
      aiSaveHistory: d.aiSaveHistory,
      minigamesEnabled: d.minigamesEnabled,
      shopEnabled: d.shopEnabled,
      notifications: { weeklyReport: d.weeklyReport, achievements: d.achievements },
    });
    if (!parsed.success) {
      setError(t("errInvalidInput"));
      return;
    }
    try {
      await api("/api/parent/settings", parsed.data);
      setOk(true);
      reset(d);
      router.refresh();
    } catch (e) {
      setError(err(e));
    }
  };

  const toggle = (name: "aiEnabled" | "aiPhotoEnabled" | "aiSaveHistory" | "minigamesEnabled" | "shopEnabled" | "weeklyReport" | "achievements", label: ParentKey, hint?: ParentKey, disabled?: boolean) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => <Toggle checked={field.value} onChange={(val) => { setOk(false); field.onChange(val); }} label={t(label)} hint={hint ? t(hint) : undefined} disabled={disabled} />}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" onChange={() => setOk(false)}>
      <LightCard className="space-y-5 p-6">
        <h2 className="font-display text-xl">{t("setLimits")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("dailyLimit")} hint={t("dailyLimitHint")} error={v(errors.dailyLimitMinutes?.message)}>
            <input type="number" inputMode="numeric" min={0} max={480} step={5} className={inputCls} {...register("dailyLimitMinutes", { valueAsNumber: true })} />
          </Field>
          <Field label={t("breakEvery")} hint={t("breakEveryHint")} error={v(errors.breakEveryMinutes?.message)}>
            <input type="number" inputMode="numeric" min={0} max={120} step={5} className={inputCls} {...register("breakEveryMinutes", { valueAsNumber: true })} />
          </Field>
          <Field label={t("weeklyGoal")} error={v(errors.weeklyGoalLessons?.message)}>
            <input type="number" inputMode="numeric" min={1} max={50} className={inputCls} {...register("weeklyGoalLessons", { valueAsNumber: true })} />
          </Field>
        </div>

        <div>
          <p className="text-sm font-bold">{t("allowedSubjects")}</p>
          <p className="text-xs text-slate-500">{t("allowedSubjectsHint")}</p>
          <div role="group" aria-label={t("allowedSubjects")} className="mt-2 flex flex-wrap gap-2">
            <Chip selected={w.allowedSubjects.length === 0} onClick={() => { setOk(false); setValue("allowedSubjects", [], { shouldDirty: true }); }}>{t("all")}</Chip>
            {SUBJECTS.map((s) => {
              const sel = w.allowedSubjects.includes(s.slug);
              return (
                <Chip key={s.slug} selected={sel} onClick={() => { setOk(false); setValue("allowedSubjects", sel ? w.allowedSubjects.filter((x) => x !== s.slug) : [...w.allowedSubjects, s.slug], { shouldDirty: true }); }}>
                  {tx(s.name, locale)}
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <Controller control={control} name="scheduleEnabled" render={({ field }) => <Toggle checked={field.value} onChange={(val) => { setOk(false); field.onChange(val); }} label={t("scheduleOn")} />} />
          {w.scheduleEnabled && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold">{t("scheduleDays")}</p>
                <div role="group" aria-label={t("scheduleDays")} className="mt-2 flex flex-wrap gap-2">
                  {DAYS.map((d) => {
                    const sel = w.days.includes(d);
                    return (
                      <Chip key={d} selected={sel} onClick={() => { setOk(false); setValue("days", sel ? w.days.filter((x) => x !== d) : [...w.days, d], { shouldDirty: true, shouldValidate: true }); }}>
                        {t(`day${d}` as ParentKey)}
                      </Chip>
                    );
                  })}
                </div>
                {errors.days && <p role="alert" className="mt-1 text-xs font-semibold text-red-600">{v(errors.days.message)}</p>}
              </div>
              <div className="grid max-w-md grid-cols-2 gap-4">
                <Field label={t("scheduleFrom")} error={v(errors.from?.message)}>
                  <input type="time" className={inputCls} {...register("from")} />
                </Field>
                <Field label={t("scheduleTo")} error={v(errors.to?.message)}>
                  <input type="time" className={inputCls} {...register("to")} />
                </Field>
              </div>
            </div>
          )}
        </div>
      </LightCard>

      <LightCard className="divide-y divide-slate-100 p-6">
        <h2 className="pb-2 font-display text-xl">{t("setFeatures")}</h2>
        {toggle("aiEnabled", "fAi", "fAiHint")}
        {toggle("minigamesEnabled", "fGames")}
        {toggle("shopEnabled", "fShop")}
      </LightCard>

      <LightCard className="divide-y divide-slate-100 p-6">
        <h2 className="pb-2 font-display text-xl">{t("setNotifications")}</h2>
        {toggle("weeklyReport", "nWeekly")}
        {toggle("achievements", "nAchievements")}
      </LightCard>

      <div className="sticky bottom-20 z-10 space-y-2 lg:bottom-4">
        <ErrorNote>{error}</ErrorNote>
        {ok && <SuccessNote>{t("settingsSaved")}</SuccessNote>}
        <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty} className="shadow-lg">
          {isSubmitting ? t("saving") : t("saveSettings")}
        </Button>
      </div>
    </form>
  );
}
