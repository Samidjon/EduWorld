import { redirect } from "next/navigation";
import { getParent } from "@/services/context";
import { OnboardingForm } from "@/components/parent/OnboardingForm";
import { getParentT } from "@/components/parent/server";

export default async function OnboardingPage() {
  const ctx = await getParent();
  if (!ctx) redirect("/login");
  if (ctx.parent) redirect("/parent/dashboard");
  const { t } = await getParentT();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl">{t("onbTitle")}</h1>
      <p className="mt-2 text-slate-600">{t("onbIntro")}</p>
      <div className="mt-6">
        <OnboardingForm />
      </div>
    </div>
  );
}
