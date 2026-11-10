"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { LogIn } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { api, ApiError } from "@/lib/client";
import { Button, inputCls } from "@/components/ui";
import type { AuthDict, AuthErrorKey } from "@/lib/i18n/public";
import { FormAlert, FormRow, describe } from "./FormRow";
import { PasswordInput } from "./PasswordInput";

type In = z.input<typeof loginSchema>;
type Out = z.output<typeof loginSchema>;

function serverErrorKey(e: unknown): AuthErrorKey {
  if (!(e instanceof ApiError)) return "generic";
  switch (e.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "rate_limited":
      return "rateLimited";
    case "network":
      return "network";
    case "invalid_input":
      return "invalidInput";
    default:
      return e.status === 401 ? "invalidCredentials" : e.status === 429 ? "rateLimited" : "generic";
  }
}

export function LoginForm({ t }: { t: AuthDict }) {
  const [serverError, setServerError] = useState<AuthErrorKey | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: Out) => {
    setServerError(null);
    try {
      const res = await api<{ ok: boolean; onboarded: boolean }>("/api/auth/login", values);
      setRedirecting(true);
      window.location.href = res.onboarded ? "/parent/dashboard" : "/parent/onboarding";
    } catch (e) {
      setServerError(serverErrorKey(e));
    }
  };

  const emailErr = errors.email ? t.errors.email : undefined;
  const passErr = errors.password ? t.errors.passwordRequired : undefined;
  const busy = isSubmitting || redirecting;

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-ink">{t.login.title}</h1>
      <p className="mt-1 text-ink/75">{t.login.subtitle}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4" aria-busy={busy}>
        <FormAlert>{serverError ? t.errors[serverError] : null}</FormAlert>

        <FormRow id="login-email" label={t.email} error={emailErr}>
          <input {...describe("login-email", emailErr)} type="email" autoComplete="email" inputMode="email" className={inputCls} {...register("email")} />
        </FormRow>

        <FormRow id="login-password" label={t.password} error={passErr}>
          <PasswordInput
            {...describe("login-password", passErr)}
            autoComplete="current-password"
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
            {...register("password")}
          />
        </FormRow>

        <Button type="submit" variant="primary" size="lg" loading={busy} icon={<LogIn className="size-5" aria-hidden />} className="w-full">
          {t.login.submit}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/80">
        {t.login.noAccount}{" "}
        <Link href="/register" className="font-bold text-[#2f62b8] underline-offset-2 hover:underline">
          {t.login.toRegister}
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-ink/65">{t.login.childHint}</p>
    </>
  );
}
