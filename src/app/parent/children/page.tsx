import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { requireParentArea } from "@/services/context";
import { currentAge, MAX_CHILDREN } from "@/services/children";
import { getParentT } from "@/components/parent/server";
import { PageHeader } from "@/components/parent/ParentShell";
import { gradeLabel } from "@/components/parent/labels";
import { AvatarView } from "@/components/avatar/AvatarView";
import { LightCard } from "@/components/ui";

export default async function ChildrenPage() {
  const { store, parent } = await requireParentArea();
  const { t } = await getParentT();
  const children = await store.select("child_profiles", { parent_id: parent.id }, { orderBy: "created_at" });
  const add =
    children.length < MAX_CHILDREN ? (
      <Link href="/parent/children/new" className="inline-flex h-11 items-center gap-2 self-start rounded-2xl bg-brand-blue px-5 font-display font-semibold text-white hover:bg-[#3f7fdc]">
        <Plus className="size-5" aria-hidden /> {t("addChild")}
      </Link>
    ) : undefined;
  return (
    <div>
      <PageHeader title={t("childrenTitle")} action={add} />
      {children.length === 0 ? (
        <LightCard className="text-center text-slate-600">{t("dashEmptyText")}</LightCard>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {children.map((c) => (
            <li key={c.id}>
              <Link href={`/parent/children/${c.id}`} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-blue/50">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-cream">
                  <AvatarView config={c.avatar_config} size={56} showPet={false} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-xl">{c.nickname}</span>
                  <span className="block text-sm text-slate-600">
                    {t("years", { n: currentAge(c) })} · {gradeLabel(c.current_grade, c.custom_level, t)}
                  </span>
                </span>
                <ChevronRight className="size-5 text-slate-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
