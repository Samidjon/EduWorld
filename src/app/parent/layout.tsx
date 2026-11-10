import type { Metadata } from "next";
import { getParent } from "@/services/context";
import { ParentLocaleProvider } from "@/components/parent/i18n";
import { ParentShell } from "@/components/parent/ParentShell";
import { getParentLocale, isParentLocked } from "@/components/parent/server";

export const metadata: Metadata = { title: "Parent" };
export const dynamic = "force-dynamic";

/**
 * Parent-area shell. Guards are applied per page (onboarding and unlock must render without a
 * profile / while locked); the layout only decides whether to render the navigation.
 */
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const locale = await getParentLocale();
  const ctx = await getParent();
  const parent = ctx?.parent ?? null;
  const showNav = !!(ctx && parent && !(await isParentLocked(ctx.store, parent.id)));
  return (
    <ParentLocaleProvider locale={locale}>
      <ParentShell showNav={showNav} displayName={showNav ? parent?.display_name : undefined}>
        {children}
      </ParentShell>
    </ParentLocaleProvider>
  );
}
