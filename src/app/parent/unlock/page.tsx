import { redirect } from "next/navigation";
import { getParent } from "@/services/context";
import { UnlockPad } from "@/components/parent/UnlockPad";
import { getParentT, isParentLocked } from "@/components/parent/server";

export default async function UnlockPage() {
  const ctx = await getParent();
  if (!ctx) redirect("/login");
  if (!ctx.parent) redirect("/parent/onboarding");
  if (!(await isParentLocked(ctx.store, ctx.parent.id))) redirect("/parent/dashboard");
  const { t } = await getParentT();
  return (
    <div className="mx-auto max-w-sm text-center">
      <h1 className="font-display text-3xl">{t("unlockTitle")}</h1>
      <p className="mt-2 text-slate-600">{t("unlockIntro")}</p>
      <div className="mt-6">
        <UnlockPad />
      </div>
    </div>
  );
}
