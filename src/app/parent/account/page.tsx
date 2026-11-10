import { requireParentArea } from "@/services/context";
import { LightCard } from "@/components/ui";
import { getParentT } from "@/components/parent/server";
import { LogoutButton, PageHeader } from "@/components/parent/ParentShell";
import { DeleteAccount, DisplayNameForm, PasswordForm } from "@/components/parent/AccountForms";

export default async function AccountPage() {
  const { user, parent } = await requireParentArea();
  const { t } = await getParentT();
  return (
    <div className="space-y-6">
      <PageHeader title={t("accTitle")} />
      <LightCard className="space-y-4 p-6">
        <div>
          <p className="text-xs font-bold text-slate-500">{t("accEmail")}</p>
          <p className="font-semibold">{user.email}</p>
        </div>
        <DisplayNameForm initial={parent.display_name} />
      </LightCard>
      <PasswordForm />
      <LightCard className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl">{t("accSession")}</h2>
          <p className="text-sm text-slate-600">{t("accSessionText")}</p>
        </div>
        <LogoutButton />
      </LightCard>
      <DeleteAccount />
    </div>
  );
}
