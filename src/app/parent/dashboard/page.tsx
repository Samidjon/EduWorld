import Link from "next/link";
import { Plus } from "lucide-react";
import { requireParentArea } from "@/services/context";
import { loadChildOverview } from "@/services/analytics";
import { MAX_CHILDREN } from "@/services/children";
import { getParentT } from "@/components/parent/server";
import { PageHeader } from "@/components/parent/ParentShell";
import { ChildSummaryCard } from "@/components/parent/ChildSummaryCard";
import { Character } from "@/components/characters/Character";
import { LightCard } from "@/components/ui";

export default async function DashboardPage() {
  const { store, parent, settings } = await requireParentArea();
  const { t, locale } = await getParentT();
  const children = await store.select("child_profiles", { parent_id: parent.id }, { orderBy: "created_at" });
  const overviews = await Promise.all(children.map((c) => loadChildOverview(store, c, settings)));

  const addBtn = (
    <Link href="/parent/children/new" className="inline-flex h-11 items-center gap-2 self-start rounded-2xl bg-brand-blue px-5 font-display font-semibold text-white hover:bg-[#3f7fdc]">
      <Plus className="size-5" aria-hidden /> {t("addChild")}
    </Link>
  );

  return (
    <div>
      <PageHeader
        title={t("dashHello", { name: parent.display_name })}
        intro={t("dashIntro")}
        action={children.length > 0 && children.length < MAX_CHILDREN ? addBtn : undefined}
      />
      {children.length === 0 ? (
        <LightCard className="flex flex-col items-center gap-4 p-8 text-center">
          <Character id="foxy" size={120} animation="wave" />
          <h2 className="font-display text-2xl">{t("dashEmptyTitle")}</h2>
          <p className="max-w-md text-slate-600">{t("dashEmptyText")}</p>
          {addBtn}
        </LightCard>
      ) : (
        <div className="space-y-6">
          {overviews.map((o) => (
            <ChildSummaryCard key={o.child.id} o={o} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
