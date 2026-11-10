import { notFound } from "next/navigation";
import { requireChild } from "@/services/context";
import { TOPIC_MAP } from "@/data/content";
import { getWorld } from "@/data/worlds";
import { ChallengeRunner } from "@/components/lessons/ChallengeRunner";

export default async function ReviewPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: topicId } = await params;
  const topic = TOPIC_MAP.get(decodeURIComponent(topicId));
  if (!topic) notFound();
  await requireChild();
  const world = getWorld(topic.world)!;
  return (
    <ChallengeRunner
      kind="review"
      targetId={topic.id}
      title={{ en: `Review: ${topic.title.en}`, ru: `Повторение: ${topic.title.ru}` }}
      description={{ en: "A few quick questions so the skill stays strong.", ru: "Несколько вопросов, чтобы навык оставался крепким." }}
      emoji="🔁"
      color={world.palette.from}
      guide={world.guide}
      backHref={`/play/worlds/${world.slug}`}
    />
  );
}
