import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { TableName, Tables } from "@/types/db";
import type { SelectOpts, Store, Where } from "./store";

/**
 * Development-only persistence: a JSON file under .data/. Lets the whole app run and be
 * tested without a Supabase project. Disabled in production unless explicitly allowed.
 * Tables also include `local_credentials` and `local_sessions` used by the local auth adapter.
 */
type Db = Record<string, Record<string, unknown>[]>;

const FILE = path.join(process.cwd(), ".data", "eduworld-dev.json");
const g = globalThis as unknown as { __ewDb?: Db; __ewQueue?: Promise<unknown> };

function load(): Db {
  if (g.__ewDb) return g.__ewDb;
  try {
    g.__ewDb = JSON.parse(fs.readFileSync(FILE, "utf8")) as Db;
  } catch {
    g.__ewDb = {};
  }
  return g.__ewDb;
}

let flushTimer: NodeJS.Timeout | null = null;
function persist() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(g.__ewDb ?? {}));
    fs.renameSync(tmp, FILE);
  }, 50);
}

/** Serialize writes so concurrent requests cannot interleave read-modify-write cycles. */
function serial<T>(fn: () => T): Promise<T> {
  const run = (g.__ewQueue ?? Promise.resolve()).then(fn);
  g.__ewQueue = run.catch(() => undefined);
  return run;
}

const matches = (row: Record<string, unknown>, where?: Record<string, unknown>) =>
  !where || Object.entries(where).every(([k, v]) => v === undefined || row[k] === v);

export function rawTable(name: string): Record<string, unknown>[] {
  const db = load();
  return (db[name] ??= []);
}

export const localRaw = {
  find: (table: string, where: Record<string, unknown>) => rawTable(table).filter((r) => matches(r, where)),
  insert: (table: string, row: Record<string, unknown>) =>
    serial(() => {
      const r = { id: randomUUID(), ...row };
      rawTable(table).push(r);
      persist();
      return r;
    }),
  remove: (table: string, where: Record<string, unknown>) =>
    serial(() => {
      const db = load();
      db[table] = rawTable(table).filter((r) => !matches(r, where));
      persist();
    }),
};

export class LocalStore implements Store {
  async select<K extends TableName>(table: K, where?: Where<Tables[K]>, opts: SelectOpts<Tables[K]> = {}) {
    let rows = rawTable(table).filter((r) => matches(r, where as Record<string, unknown>));
    if (opts.gte) {
      const [col, val] = opts.gte;
      rows = rows.filter((r) => (r[col] as string | number) >= val);
    }
    if (opts.inList) {
      const [col, vals] = opts.inList;
      rows = rows.filter((r) => vals.includes(r[col] as string | number));
    }
    if (opts.orderBy) {
      const col = opts.orderBy;
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string | number, bv = b[col] as string | number;
        return (av > bv ? 1 : av < bv ? -1 : 0) * (opts.desc ? -1 : 1);
      });
    }
    if (opts.limit) rows = rows.slice(0, opts.limit);
    return structuredClone(rows) as unknown as Tables[K][];
  }
  async count<K extends TableName>(table: K, where?: Where<Tables[K]>, opts: Pick<SelectOpts<Tables[K]>, "gte"> = {}) {
    return (await this.select(table, where, opts)).length;
  }
  insert<K extends TableName>(table: K, row: Omit<Tables[K], "id"> & { id?: string }) {
    return serial(() => {
      const r = { id: randomUUID(), ...structuredClone(row) } as Record<string, unknown>;
      if (!("created_at" in r) && table !== "learning_progress" && table !== "game_profiles") r.created_at = new Date().toISOString();
      rawTable(table).push(r);
      persist();
      return structuredClone(r) as unknown as Tables[K];
    });
  }
  update<K extends TableName>(table: K, where: Where<Tables[K]>, patch: Partial<Tables[K]>) {
    return serial(() => {
      const out: Tables[K][] = [];
      for (const r of rawTable(table)) {
        if (matches(r, where as Record<string, unknown>)) {
          Object.assign(r, structuredClone(patch));
          out.push(structuredClone(r) as unknown as Tables[K]);
        }
      }
      persist();
      return out;
    });
  }
  remove<K extends TableName>(table: K, where: Where<Tables[K]>) {
    return localRaw.remove(table, where as Record<string, unknown>);
  }
}
