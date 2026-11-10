"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, inputCls } from "@/components/ui";
import { api } from "@/lib/client";
import { useP } from "./i18n";

const schema = z
  .object({
    displayName: z.string().trim().min(1, "required").max(60, "too_long"),
    pin: z.string().regex(/^(\d{4})?$/, "pin4"),
    pinConfirm: z.string(),
    consent: z.boolean().refine((v) => v, "consent"),
  })
  .refine((d) => !d.pin || d.pin === d.pinConfirm, { path: ["pinConfirm"], message: "pin_mismatch" });

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;

export function OnboardingForm() {
  const { t, err, v } = useP();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", pin: "", pinConfirm: "", consent: false },
  });
  const pin = watch("pin");

  const onSubmit = async (d: Out) => {
    setError("");
    try {
      await api("/api/parent/onboarding", { displayName: d.displayName, pin: d.pin || "", consent: true });
      setDone(true);
      window.location.href = "/parent/children/new";
    } catch (e) {
      setError(err(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <LightCard className="space-y-4">
        <Field label={t("displayName")} hint={t("displayNameHint")} error={v(errors.displayName?.message)}>
          <input className={inputCls} autoComplete="nickname" {...register("displayName")} aria-invalid={!!errors.displayName} />
        </Field>
      </LightCard>

      <LightCard className="space-y-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand-blue" aria-hidden />
          <p className="text-sm text-slate-600">{t("pinExplain")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t("pinOptional")} · ${t("optional")}`} error={v(errors.pin?.message)}>
            <input className={inputCls} type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} {...register("pin")} aria-invalid={!!errors.pin} />
          </Field>
          {!!pin && (
            <Field label={t("pinConfirm")} error={v(errors.pinConfirm?.message)}>
              <input className={inputCls} type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} {...register("pinConfirm")} aria-invalid={!!errors.pinConfirm} />
            </Field>
          )}
        </div>
      </LightCard>

      <LightCard className="space-y-3 bg-cream/60">
        <h2 className="font-display text-xl">{t("consentTitle")}</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
          <li>{t("consentStored")}</li>
          <li>{t("consentAi")}</li>
          <li>{t("consentControl")}</li>
        </ul>
        <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-semibold">
          <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#5799E8]" {...register("consent")} aria-invalid={!!errors.consent} />
          <span>{t("consentLabel")}</span>
        </label>
        {errors.consent && <p role="alert" className="text-xs font-semibold text-red-600">{v(errors.consent.message)}</p>}
      </LightCard>

      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" size="lg" loading={isSubmitting || done} className="w-full sm:w-auto">
        {t("onbSubmit")}
      </Button>
    </form>
  );
}
