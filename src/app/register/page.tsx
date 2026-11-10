import type { Metadata } from "next";
import { getPublicDict } from "@/lib/i18n/public";
import { getServerLocale } from "@/components/landing/server-locale";
import { AuthShell } from "@/components/authentication/AuthShell";
import { RegisterForm } from "@/components/authentication/RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = getPublicDict(await getServerLocale());
  return { title: t.auth.register.title };
}

export default async function RegisterPage() {
  const locale = await getServerLocale();
  const t = getPublicDict(locale);
  return (
    <AuthShell locale={locale} langLabel={t.langLabel} homeLabel={t.common.home} foxySays={t.auth.register.foxy} foxyEmotion="celebrate">
      <RegisterForm t={t.auth} />
    </AuthShell>
  );
}
