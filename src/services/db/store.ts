import "server-only";
import type { TableName, Tables } from "@/types/db";

/**
 * Minimal table-oriented data access API. All business logic is written against this
 * interface once; it is implemented by
 *   - SupabaseStore (production): user-scoped client, so Postgres Row Level Security applies
 *   - LocalStore (development only): JSON file in .data/, used when Supabase env vars are absent
 */
export type Where<T> = Partial<{ [K in keyof T]: T[K] }>;
export interface SelectOpts<T> {
  orderBy?: keyof T & string;
  desc?: boolean;
  limit?: number;
  gte?: [keyof T & string, string | number];
  inList?: [keyof T & string, (string | number)[]];
}

export interface Store {
  select<K extends TableName>(table: K, where?: Where<Tables[K]>, opts?: SelectOpts<Tables[K]>): Promise<Tables[K][]>;
  count<K extends TableName>(table: K, where?: Where<Tables[K]>, opts?: Pick<SelectOpts<Tables[K]>, "gte">): Promise<number>;
  insert<K extends TableName>(table: K, row: Omit<Tables[K], "id"> & { id?: string }): Promise<Tables[K]>;
  update<K extends TableName>(table: K, where: Where<Tables[K]>, patch: Partial<Tables[K]>): Promise<Tables[K][]>;
  remove<K extends TableName>(table: K, where: Where<Tables[K]>): Promise<void>;
}

export class StoreError extends Error {}
