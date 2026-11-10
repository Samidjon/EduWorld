import { ShieldCheck } from "lucide-react";
import { requireParentArea } from "@/services/context";
import { LightCard } from "@/components/ui";
import { getParentT } from "@/components/parent/server";
import { PageHeader } from "@/components/parent/ParentShell";
import { SettingsForm, type PublicSettings } from "@/components/parent/SettingsForm";
import { PinForm } from "@/components/parent/PinForm";

export default async function SettingsPage() {
  const { settings } = await requireParentArea();
  const { t } = await getParentT();
  const { pinHash, ...rest } = settings;
  const publicSettings: PublicSettings = rest;

  return (
    <div className="space-y-6">
      <PageHeader title={t("setTitle")} intro={t("setIntro")} />
      <SettingsForm initial={publicSettings} />
      <PinForm hasPin={!!pinHash} />

      <LightCard className="space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-display text-xl">
          <ShieldCheck className="size-5 text-brand-blue" aria-hidden /> {t("setPrivacy")}
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
          <li>{t("consentStored")}</li>
          <li>{t("consentAi")}</li>
          <li>{t("privacyRetention")}</li>
          <li>{t("consentControl")}</li>
        </ul>
      </LightCard>
    </div>
  );
}
