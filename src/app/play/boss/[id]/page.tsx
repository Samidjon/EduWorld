import { notFound } from "next/navigation";
import { requireChild } from "@/services/context";
import { getBoss, getWorld } from "@/data/worlds";
import { ChallengeRunner } from "@/components/lessons/ChallengeRunner";

export default async function BossPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const boss = getBoss(id);
  if (!boss) notFound();
  await requireChild();
  const world = getWorld(boss.world)!;
  return <ChallengeRunner kind="boss" targetId={boss.id} title={boss.name} description={boss.description} emoji={boss.emoji} color={boss.color} guide={world.guide} backHref={`/play/worlds/${world.slug}`} />;
}
