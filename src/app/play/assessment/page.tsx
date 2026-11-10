import { redirect } from "next/navigation";
import { requireChild } from "@/services/context";
import { AssessmentFlow } from "@/features/assessment/AssessmentFlow";

export default async function AssessmentPage() {
  const ctx = await requireChild({ allowNoAssessment: true });
  if (ctx.child.assessment_completed_at) redirect("/play/dashboard");
  return <AssessmentFlow nickname={ctx.child.nickname} />;
}
