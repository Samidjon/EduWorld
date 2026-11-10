import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TableName, Tables } from "@/types/db";
import { StoreError, type SelectOpts, type Store, type Where } from "./store";

/**
 * Store backed by Supabase Postgres. It is always constructed with the *user-scoped* client
 * (anon key + the signed-in parent's JWT from cookies), so every query is filtered by the
 * Row Level Security policies in supabase/migrations. The service-role key is never used here.
 */
export class SupabaseStore implements Store {
  // Table names are dynamic here; typing is enforced by the Store interface instead.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sb: SupabaseClient<any, "public", any>;
  constructor(sb: SupabaseClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sb = sb as SupabaseClient<any, "public", any>;
  }

  private applyWhere<Q extends { eq: (c: string, v: unknown) => Q; is: (c: string, v: null) => Q }>(q: Q, where?: Record<string, unknown>): Q {
    if (!where) return q;
    for (const [k, v] of Object.entries(where)) {
      if (v === undefined) continue;
      q = v === null ? q.is(k, null) : q.eq(k, v);
    }
    return q;
  }

  async select<K extends TableName>(table: K, where?: Where<Tables[K]>, opts: SelectOpts<Tables[K]> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = this.applyWhere(this.sb.from(table as string).select("*"), where as Record<string, unknown>);
    if (opts.gte) q = q.gte(String(opts.gte[0]), opts.gte[1]);
    if (opts.inList) q = q.in(String(opts.inList[0]), opts.inList[1]);
    if (opts.orderBy) q = q.order(String(opts.orderBy), { ascending: !opts.desc });
    if (opts.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error) throw new StoreError(`${table}.select: ${error.message}`);
    return (data ?? []) as Tables[K][];
  }

  async count<K extends TableName>(table: K, where?: Where<Tables[K]>, opts: Pick<SelectOpts<Tables[K]>, "gte"> = {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = this.applyWhere(this.sb.from(table as string).select("id", { count: "exact", head: true }), where as Record<string, unknown>);
    if (opts.gte) q = q.gte(String(opts.gte[0]), opts.gte[1]);
    const { count, error } = await q;
    if (error) throw new StoreError(`${table}.count: ${error.message}`);
    return count ?? 0;
  }

  async insert<K extends TableName>(table: K, row: Omit<Tables[K], "id"> & { id?: string }) {
    const { data, error } = await this.sb.from(table).insert(row as never).select("*").single();
    if (error) throw new StoreError(`${table}.insert: ${error.message}`);
    return data as Tables[K];
  }

  async update<K extends TableName>(table: K, where: Where<Tables[K]>, patch: Partial<Tables[K]>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.applyWhere(this.sb.from(table as string).update(patch as never) as never, where as Record<string, unknown>) as any).select("*");
    if (error) throw new StoreError(`${table}.update: ${error.message}`);
    return (data ?? []) as Tables[K][];
  }

  async remove<K extends TableName>(table: K, where: Where<Tables[K]>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.applyWhere(this.sb.from(table as string).delete() as never, where as Record<string, unknown>) as any);
    if (error) throw new StoreError(`${table}.delete: ${error.message}`);
  }
}
