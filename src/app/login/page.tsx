import type { Metadata } from "next";
import { getPublicDict } from "@/lib/i18n/public";
import { getServerLocale } from "@/components/landing/server-locale";
import { AuthShell } from "@/components/authentication/AuthShell";
import { LoginForm } from "@/components/authentication/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = getPublicDict(await getServerLocale());
  return { title: t.auth.login.submit };
}

export default async function LoginPage() {
  const locale = await getServerLocale();
  const t = getPublicDict(locale);
  return (
    <AuthShell locale={locale} langLabel={t.langLabel} homeLabel={t.common.home} foxySays={t.auth.login.foxy}>
      <LoginForm t={t.auth} />
    </AuthShell>
  );
}
