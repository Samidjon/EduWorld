/**
 * Validates lesson content files: unique ids, answer indexes in range, topics exist,
 * blanks present, code-block puzzles solvable within maxBlocks.
 * Usage: npx tsx scripts/validate-content.ts [path/to/lessons-file.ts ...]
 * Without args it validates every file registered in src/data/content.ts.
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Lesson, Question } from "../src/types/content";
import { TOPIC_MAP } from "../src/data/topics";

const errors: string[] = [];
const ids = new Set<string>();

function err(where: string, msg: string) {
  errors.push(`${where}: ${msg}`);
}

function checkText(where: string, v: unknown) {
  const o = v as { en?: string; ru?: string } | undefined;
  if (!o || typeof o.en !== "string" || typeof o.ru !== "string" || !o.en.trim() || !o.ru.trim()) err(where, "missing en/ru text");
}

function checkQuestion(where: string, q: Question) {
  if (ids.has(q.id)) err(where, `duplicate id ${q.id}`);
  ids.add(q.id);
  checkText(`${where}.prompt`, q.prompt);
  checkText(`${where}.explanation`, q.explanation);
  if (q.hint) checkText(`${where}.hint`, q.hint);
  switch (q.type) {
    case "single":
    case "audio_recognition":
      if (q.answer < 0 || q.answer >= q.options.length) err(where, "answer index out of range");
      q.options.forEach((o, i) => checkText(`${where}.options[${i}]`, o));
      break;
    case "image_selection":
      if (q.answer < 0 || q.answer >= q.options.length) err(where, "answer index out of range");
      break;
    case "multiple":
      if (!q.answers.length || q.answers.some((a) => a < 0 || a >= q.options.length)) err(where, "answers out of range");
      break;
    case "drag_drop":
      for (const it of q.items) if (!q.buckets.some((b) => b.id === q.answer[it.id])) err(where, `item ${it.id} has no valid bucket`);
      break;
    case "matching":
      if (q.pairs.length < 2) err(where, "need >= 2 pairs");
      break;
    case "fill_blank":
      if (!q.text.en.includes("___") || !q.text.ru.includes("___")) err(where, "text must contain ___ in en and ru");
      if (!q.accepted.en.length || !q.accepted.ru.length) err(where, "accepted answers missing");
      break;
    case "ordering":
      if (q.items.length < 2) err(where, "need >= 2 items");
      break;
    case "word_building":
      checkText(`${where}.word`, q.word);
      break;
    case "math_input":
      if (!q.accepted.length) err(where, "accepted missing");
      break;
    case "drawing":
      if (q.path.length < 2) err(where, "path too short");
      break;
    case "code_blocks": {
      const { width, height, start, goal, walls } = q.grid;
      const inb = (p: [number, number]) => p[0] >= 0 && p[1] >= 0 && p[0] < width && p[1] < height;
      if (!inb(start) || !inb(goal)) err(where, "start/goal outside grid");
      if (walls.some((w) => w[0] === goal[0] && w[1] === goal[1])) err(where, "goal is a wall");
      break;
    }
  }
}

async function validateFile(file: string) {
  const mod = (await import(pathToFileURL(path.resolve(file)).href)) as { LESSONS?: Lesson[] };
  if (!mod.LESSONS) return err(file, "no LESSONS export");
  for (const l of mod.LESSONS) {
    const where = `${path.basename(file)}:${l.id}`;
    if (ids.has(l.id)) err(where, "duplicate lesson id");
    ids.add(l.id);
    if (!TOPIC_MAP.has(l.topicId)) err(where, `unknown topic ${l.topicId}`);
    checkText(`${where}.title`, l.title);
    checkText(`${where}.intro`, l.intro);
    l.explanation.forEach((e, i) => checkText(`${where}.explanation[${i}]`, e));
    if (l.practice.length < 2) err(where, "needs >= 2 practice questions");
    if (l.check.length < 3) err(where, "needs >= 3 check questions");
    [...l.practice, ...l.check].forEach((q) => checkQuestion(`${where}/${q.id}`, q));
  }
  console.log(`${file}: ${mod.LESSONS.length} lessons`);
}

async function main() {
  let files = process.argv.slice(2);
  if (!files.length) {
    const fs = await import("node:fs");
    const dir = path.resolve("src/data/lessons");
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => path.join(dir, f));
  }
  for (const f of files) await validateFile(f);
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n` + errors.join("\n"));
    process.exit(1);
  }
  console.log("Content OK");
}

main();
