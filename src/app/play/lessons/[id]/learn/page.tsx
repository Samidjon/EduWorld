import { notFound, redirect } from "next/navigation";
import { requireChild } from "@/services/context";
import { getLesson, TOPIC_MAP } from "@/data/content";
import { childOverview, gameLevelFor } from "@/services/child-view";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";

export default async function LearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  const ctx = await requireChild();
  const topic = TOPIC_MAP.get(lesson.topicId)!;
  const { worlds, pmap, grade } = await childOverview(ctx.store, ctx.child, ctx.settings);
  if (!worlds.find((w) => w.world.slug === topic.world)?.unlocked) redirect(`/play/worlds/${topic.world}`);
  const level = gameLevelFor(grade, pmap.get(topic.id)?.mastery_level ?? 0);
  return <LessonPlayer lesson={lesson} worldSlug={topic.world} gameLevel={level} gamesEnabled={ctx.settings.minigamesEnabled} />;
}
