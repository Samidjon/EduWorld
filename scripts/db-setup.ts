/**
 * Applies supabase/migrations/*.sql (once each, tracked) and supabase/seed.sql to the database
 * in DATABASE_URL (read from .env.local or the environment). Run: npm run db:setup
 * The connection string is never printed.
 */
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

/**
 * Tolerant parser: passwords copied from the dashboard often contain characters that break
 * URL parsing (@ # / ? %) or are left wrapped in the [YOUR-PASSWORD] brackets.
 */
function parseConnection(raw: string) {
  const s = raw.trim().replace(/^postgres(ql)?:\/\//, "");
  const at = s.lastIndexOf("@");
  const cred = s.slice(0, at);
  const hostPart = s.slice(at + 1);
  const colon = cred.indexOf(":");
  let password = cred.slice(colon + 1);
  if (password.startsWith("[") && password.endsWith("]")) password = password.slice(1, -1);
  try {
    password = decodeURIComponent(password);
  } catch {
    /* not encoded - use as is */
  }
  const [hostPort, dbAndQuery = "postgres"] = hostPart.split("/");
  const [host, port = "5432"] = hostPort.split(":");
  return { user: decodeURIComponent(cred.slice(0, colon)), password, host, port: Number(port), database: dbAndQuery.split("?")[0] || "postgres" };
}

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set (add it to .env.local).");
    process.exit(1);
  }
  const client = new Client({ ...parseConnection(url), ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected.");
  await client.query("create table if not exists public.eduworld_migrations (name text primary key, applied_at timestamptz not null default now())");
  await client.query("alter table public.eduworld_migrations enable row level security");

  const dir = path.resolve("supabase/migrations");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    const done = await client.query("select 1 from public.eduworld_migrations where name = $1", [file]);
    if (done.rowCount) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    await client.query("begin");
    try {
      await client.query(fs.readFileSync(path.join(dir, file), "utf8"));
      await client.query("insert into public.eduworld_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`apply ${file}`);
    } catch (e) {
      await client.query("rollback");
      throw e;
    }
  }

  const seed = path.resolve("supabase/seed.sql");
  if (fs.existsSync(seed)) {
    await client.query(fs.readFileSync(seed, "utf8"));
    const { rows } = await client.query("select (select count(*) from public.lessons) as lessons, (select count(*) from public.questions) as questions, (select count(*) from public.topics) as topics");
    console.log(`seed  ok: ${rows[0].topics} topics, ${rows[0].lessons} lessons, ${rows[0].questions} questions`);
  }
  await client.end();
}

main().catch((e) => {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
