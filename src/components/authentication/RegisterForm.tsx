"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Circle, Info, MailCheck, UserPlus } from "lucide-react";
import { registerSchema } from "@/lib/validation";
import { api, ApiError } from "@/lib/client";
import { Button, inputCls } from "@/components/ui";
import { authErrorKey, type AuthDict, type AuthErrorKey } from "@/lib/i18n/public";
import { FormAlert, FormRow, describe } from "./FormRow";
import { PasswordInput } from "./PasswordInput";

const formSchema = registerSchema
  .extend({
    confirm: z.string(),
    guardian: z.boolean().refine((v) => v, { message: "guardian" }),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "mismatch" });

type In = z.input<typeof formSchema>;
type Out = z.output<typeof formSchema>;

function serverErrorKey(e: unknown): AuthErrorKey {
  if (!(e instanceof ApiError)) return "generic";
  switch (e.code) {
    case "email_taken":
      return "emailTaken";
    case "rate_limited":
      return "rateLimited";
    case "weak_password":
      return "weakPassword";
    case "network":
      return "network";
    case "invalid_input":
      return "invalidInput";
    default:
      return e.status === 409 ? "emailTaken" : e.status === 429 ? "rateLimited" : "generic";
  }
}

export function RegisterForm({ t }: { t: AuthDict }) {
  const [serverError, setServerError] = useState<AuthErrorKey | null>(null);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", confirm: "", guardian: false },
  });

  const password = watch("password") ?? "";
  const rules = [
    { ok: password.length >= 8, label: t.register.ruleLength },
    { ok: /[A-Za-zА-Яа-я]/.test(password), label: t.register.ruleLetter },
    { ok: /\d/.test(password), label: t.register.ruleDigit },
  ];

  const onSubmit = async (values: Out) => {
    setServerError(null);
    try {
      const res = await api<{ ok: boolean; needsEmailConfirmation: boolean }>("/api/auth/register", { email: values.email, password: values.password });
      if (res.needsEmailConfirmation) {
        setCheckEmail(values.email);
        return;
      }
      setRedirecting(true);
      window.location.href = "/parent/onboarding";
    } catch (e) {
      const key = serverErrorKey(e);
      // Field-specific problems are shown next to the field (and focused); the rest in the alert.
      if (key === "emailTaken") setError("email", { type: "server", message: "emailTaken" }, { shouldFocus: true });
      else if (key === "weakPassword") setError("password", { type: "server", message: "weakPassword" }, { shouldFocus: true });
      else setServerError(key);
    }
  };

  if (checkEmail) {
    return (
      <div role="status" className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-mint text-[#0f3d2a]">
          <MailCheck className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">{t.register.checkTitle}</h1>
        <p className="mt-2 break-words font-bold text-ink">{checkEmail}</p>
        <p className="mt-3 text-ink/80">{t.register.checkText}</p>
        <p className="mt-2 text-sm text-ink/65">{t.register.checkSpam}</p>
        <Link href="/login" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#6aa9f2] to-[#3f7fdc] px-6 font-display font-semibold text-white shadow-[var(--shadow-button)]">
          {t.register.toLogin}
        </Link>
      </div>
    );
  }

  const fieldError = (msg: string | undefined, fallback: AuthErrorKey) => {
    if (msg === undefined) return undefined;
    if (msg === "emailTaken" || msg === "weakPassword") return t.errors[msg];
    return t.errors[authErrorKey(msg, fallback)];
  };
  const emailErr = fieldError(errors.email?.message, "email");
  const passErr = fieldError(errors.password?.message, "weakPassword");
  const confirmErr = fieldError(errors.confirm?.message, "mismatch");
  const guardianErr = errors.guardian ? t.errors.guardian : undefined;
  const busy = isSubmitting || redirecting;

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-ink">{t.register.title}</h1>
      <p className="mt-1 text-ink/75">{t.register.subtitle}</p>
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sky/40 px-4 py-3 text-sm font-semibold text-ink">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{t.register.childNote}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4" aria-busy={busy}>
        <FormAlert>{serverError ? t.errors[serverError] : null}</FormAlert>

        <FormRow id="reg-email" label={t.email} error={emailErr}>
          <input {...describe("reg-email", emailErr)} type="email" autoComplete="email" inputMode="email" className={inputCls} {...register("email")} />
        </FormRow>

        <FormRow
          id="reg-password"
          label={t.password}
          error={passErr}
          hint={
            <div className="rounded-2xl bg-white/70 px-3 py-2 text-xs">
              <p className="font-bold text-ink/80">{t.register.rulesTitle}</p>
              <ul className="mt-1 space-y-0.5">
                {rules.map((r) => (
                  <li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? "font-bold text-[#1f7a4d]" : "text-ink/70"}`}>
                    {r.ok ? <Check className="size-3.5" aria-hidden /> : <Circle className="size-3" aria-hidden />}
                    <span>{r.label}</span>
                    {r.ok && <span className="sr-only">✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <PasswordInput
            {...describe("reg-password", passErr, true)}
            autoComplete="new-password"
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
            {...register("password")}
          />
        </FormRow>

        <FormRow id="reg-confirm" label={t.register.confirm} error={confirmErr}>
          <PasswordInput
            {...describe("reg-confirm", confirmErr)}
            autoComplete="new-password"
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
            {...register("confirm")}
          />
        </FormRow>

        <div className="space-y-1.5">
          <label htmlFor="reg-guardian" className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink">
            <input
              {...describe("reg-guardian", guardianErr)}
              type="checkbox"
              className="mt-0.5 size-5 shrink-0 accent-[#3f7fdc]"
              {...register("guardian")}
            />
            <span>{t.register.guardian}</span>
          </label>
          {guardianErr && (
            <p id="reg-guardian-error" className="text-xs font-bold text-red-700">
              {guardianErr}
            </p>
          )}
        </div>

        <Button type="submit" variant="sun" size="lg" loading={busy} icon={<UserPlus className="size-5" aria-hidden />} className="w-full">
          {t.register.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/80">
        {t.register.haveAccount}{" "}
        <Link href="/login" className="font-bold text-[#2f62b8] underline-offset-2 hover:underline">
          {t.register.toLogin}
        </Link>
      </p>
    </>
  );
}
