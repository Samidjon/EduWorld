import Link from "next/link";
import { requireParentArea } from "@/services/context";
import { MAX_CHILDREN } from "@/services/children";
import { ChildWizard } from "@/components/parent/ChildWizard";
import { getParentT } from "@/components/parent/server";

export default async function NewChildPage() {
  const { store, parent } = await requireParentArea();
  const { t } = await getParentT();
  const count = await store.count("child_profiles", { parent_id: parent.id });
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 font-display text-3xl">{t("wizTitle")}</h1>
      {count >= MAX_CHILDREN ? (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
          <p role="alert">{t("errTooManyChildren")}</p>
          <Link href="/parent/dashboard" className="font-bold text-brand-blue underline">{t("backToOverview")}</Link>
        </div>
      ) : (
        <ChildWizard />
      )}
    </div>
  );
}
