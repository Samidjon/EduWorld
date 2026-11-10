import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/lib/api";
import { GRADE_CODES, SUBJECT_SLUGS } from "@/lib/validation";
import { apiParent, enterChildMode, getOwnedChild, HttpError } from "@/services/context";
import { ageGroupOf, deleteChild, exportChild } from "@/services/children";

type P = { params: Promise<{ id: string }> };

async function owned(id: string) {
  const ctx = await apiParent();
  if (!z.string().uuid().safeParse(id).success) throw new HttpError(404, "not_found");
  const child = await getOwnedChild(ctx.store, ctx.parent.id, id);
  if (!child) throw new HttpError(404, "not_found");
  return { ctx, child };
}

/** GET = data export (JSON download). */
export async function GET(_req: Request, { params }: P) {
  try {
    const { ctx, child } = await owned((await params).id);
    const data = await exportChild(ctx.store, child.id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: { "content-type": "application/json", "content-disposition": `attachment; filename="eduworld-${child.nickname.replace(/[^\w-]/g, "_")}.json"` },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

const patchSchema = z.object({
  nickname: z.string().trim().min(1).max(24).refine((s) => !/@|\d{5,}|https?:/i.test(s), "nickname_private").optional(),
  age: z.number().int().min(4).max(17).optional(),
  grade: z.enum(GRADE_CODES).optional(),
  customLevel: z.number().int().min(-1).max(11).nullable().optional(),
  language: z.enum(["ru", "en", "uz"]).optional(),
  subjects: z.array(z.enum(SUBJECT_SLUGS)).max(6).optional(),
  resetAssessment: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: P) {
  try {
    const { ctx, child } = await owned((await params).id);
    const p = patchSchema.parse(await req.json());
    await ctx.store.update("child_profiles", { id: child.id }, {
      ...(p.nickname && { nickname: p.nickname }),
      ...(p.age && { age_years: p.age, age_recorded_year: new Date().getFullYear(), age_group: ageGroupOf(p.age) }),
      ...(p.grade && { current_grade: p.grade, custom_level: p.grade === "custom" ? p.customLevel ?? child.custom_level : null }),
      ...(p.language && { interface_language: p.language }),
      ...(p.subjects && { preferred_subjects: p.subjects }),
      ...(p.resetAssessment && { assessment_completed_at: null }),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: P) {
  try {
    const { ctx, child } = await owned((await params).id);
    await deleteChild(ctx.store, child.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

/** POST = switch this device into child mode for the given child. */
export async function POST(_req: Request, { params }: P) {
  try {
    const { ctx, child } = await owned((await params).id);
    await enterChildMode(ctx.parent.id, child.id);
    return NextResponse.json({ ok: true, needsAssessment: !child.assessment_completed_at });
  } catch (e) {
    return errorResponse(e);
  }
}
