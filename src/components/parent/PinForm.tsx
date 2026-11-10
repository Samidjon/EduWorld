"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, LockOpen } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, inputCls } from "@/components/ui";
import { api } from "@/lib/client";
import { pinSchema } from "@/lib/validation";
import { useP } from "./i18n";
import { SuccessNote } from "./controls";

const schema = z.object({ pin: pinSchema, confirm: z.string() }).refine((d) => d.pin === d.confirm, { path: ["confirm"], message: "pin_mismatch" });
type F = z.infer<typeof schema>;

/** Set, change or remove the parent PIN (POST /api/parent/pin). */
export function PinForm({ hasPin }: { hasPin: boolean }) {
  const { t, err, v } = useP();
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [removing, setRemoving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { pin: "", confirm: "" } });

  const save = async (d: F) => {
    setError("");
    setOk("");
    try {
      await api("/api/parent/pin", { pin: d.pin });
      reset();
      setOk(t("pinSaved"));
      router.refresh();
    } catch (e) {
      setError(err(e));
    }
  };

  const remove = async () => {
    setRemoving(true);
    setError("");
    setOk("");
    try {
      await api("/api/parent/pin", { pin: null });
      setOk(t("pinRemoved"));
      router.refresh();
    } catch (e) {
      setError(err(e));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <LightCard className="space-y-4 p-6">
      <h2 className="font-display text-xl">{t("setPin")}</h2>
      <p className="flex gap-2 text-sm text-slate-600">
        {hasPin ? <Lock className="size-5 shrink-0 text-emerald-600" aria-hidden /> : <LockOpen className="size-5 shrink-0 text-amber-600" aria-hidden />}
        {hasPin ? t("pinIsSet") : t("pinNotSet")}
      </p>
      <p className="text-sm text-slate-500">{t("pinExplain")}</p>
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <div className="grid max-w-md grid-cols-2 gap-4">
          <Field label={t("newPin")} error={v(errors.pin?.message)}>
            <input type="password" inputMode="numeric" maxLength={4} autoComplete="new-password" className={inputCls} {...register("pin")} aria-invalid={!!errors.pin} />
          </Field>
          <Field label={t("pinConfirm")} error={v(errors.confirm?.message)}>
            <input type="password" inputMode="numeric" maxLength={4} autoComplete="new-password" className={inputCls} {...register("confirm")} aria-invalid={!!errors.confirm} />
          </Field>
        </div>
        <ErrorNote>{error}</ErrorNote>
        {ok && <SuccessNote>{ok}</SuccessNote>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" loading={isSubmitting}>{t("setPinBtn")}</Button>
          {hasPin && (
            <Button type="button" variant="light" onClick={remove} loading={removing}>{t("removePin")}</Button>
          )}
        </div>
      </form>
    </LightCard>
  );
}
