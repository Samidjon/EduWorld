import { route } from "@/lib/api";
import { childSchema } from "@/lib/validation";
import { apiParent, enterChildMode } from "@/services/context";
import { createChild } from "@/services/children";

/** Create a child profile. Age and grade are independent inputs. */
export const POST = route(childSchema, async (input) => {
  const ctx = await apiParent();
  const child = await createChild(ctx.store, ctx.parent.id, input);
  await enterChildMode(ctx.parent.id, child.id);
  return { ok: true, id: child.id };
});
