"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import { Button, ErrorNote, Field, LightCard, Modal, inputCls } from "@/components/ui";
import { api } from "@/lib/client";
import { passwordSchema } from "@/lib/validation";
import { useP } from "./i18n";
import { SuccessNote } from "./controls";

const nameSchema = z.object({ displayName: z.string().trim().min(1, "required").max(60, "too_long") });
type NameF = z.infer<typeof nameSchema>;

export function DisplayNameForm({ initial }: { initial: string }) {
  const { t, err, v } = useP();
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<NameF>({ resolver: zodResolver(nameSchema), defaultValues: { displayName: initial } });
  const onSubmit = async (d: NameF) => {
    setError("");
    setOk(false);
    try {
      await api("/api/parent/profile", d);
      reset(d);
      setOk(true);
      router.refresh();
    } catch (e) {
      setError(err(e));
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3" onChange={() => setOk(false)}>
      <Field label={t("accName")} hint={t("displayNameHint")} error={v(errors.displayName?.message)}>
        <input className={inputCls} autoComplete="nickname" {...register("displayName")} aria-invalid={!!errors.displayName} />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      {ok && <SuccessNote>{t("nameSaved")}</SuccessNote>}
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>{t("save")}</Button>
    </form>
  );
}

const pwSchema = z
  .object({ current: z.string().min(1, "required").max(128, "too_long"), next: passwordSchema, repeat: z.string() })
  .refine((d) => d.next === d.repeat, { path: ["repeat"], message: "password_mismatch" });
type PwF = z.infer<typeof pwSchema>;

export function PasswordForm() {
  const { t, err, v } = useP();
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwF>({ resolver: zodResolver(pwSchema), defaultValues: { current: "", next: "", repeat: "" } });
  const onSubmit = async (d: PwF) => {
    setError("");
    setOk(false);
    try {
      await api("/api/parent/password", { current: d.current, next: d.next });
      reset();
      setOk(true);
    } catch (e) {
      setError(err(e));
    }
  };
  return (
    <LightCard className="space-y-4 p-6">
      <h2 className="font-display text-xl">{t("accPassword")}</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label={t("currentPassword")} error={v(errors.current?.message)}>
          <input type="password" autoComplete="current-password" className={inputCls} {...register("current")} aria-invalid={!!errors.current} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("newPassword")} hint={t("passwordRules")} error={v(errors.next?.message)}>
            <input type="password" autoComplete="new-password" className={inputCls} {...register("next")} aria-invalid={!!errors.next} />
          </Field>
          <Field label={t("repeatPassword")} error={v(errors.repeat?.message)}>
            <input type="password" autoComplete="new-password" className={inputCls} {...register("repeat")} aria-invalid={!!errors.repeat} />
          </Field>
        </div>
        <ErrorNote>{error}</ErrorNote>
        {ok && <SuccessNote>{t("passwordChanged")}</SuccessNote>}
        <Button type="submit" loading={isSubmitting}>{t("changePassword")}</Button>
      </form>
    </LightCard>
  );
}

export function DeleteAccount() {
  const { t, err } = useP();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const del = async () => {
    if (confirm !== "DELETE") return;
    setBusy(true);
    setError("");
    try {
      await api("/api/parent/delete-account", { confirm: "DELETE" });
      window.location.href = "/";
    } catch (e) {
      setError(err(e));
      setBusy(false);
    }
  };
  return (
    <LightCard className="space-y-3 border-red-200 p-6">
      <h2 className="font-display text-xl text-red-700">{t("accDelete")}</h2>
      <p className="text-sm text-slate-600">{t("accDeleteText")}</p>
      <Button type="button" variant="danger" onClick={() => { setOpen(true); setConfirm(""); setError(""); }} icon={<Trash2 className="size-4" aria-hidden />}>
        {t("accDelete")}
      </Button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={t("accDelete")} light>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{t("accDeleteText")}</p>
          <Field label={t("accDeleteConfirm")}>
            <input className={inputCls} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" autoCapitalize="characters" autoFocus />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="light" onClick={() => setOpen(false)} disabled={busy}>{t("cancel")}</Button>
            <Button type="button" variant="danger" onClick={del} disabled={confirm !== "DELETE"} loading={busy}>
              {busy ? t("deleting") : t("accDeleteBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </LightCard>
  );
}
