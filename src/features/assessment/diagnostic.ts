import type { GradeLevel, Question, Topic } from "@/types/content";
import { rng } from "@/lib/rng";
import { GENERATORS } from "@/features/learning/generators";

/**
 * Initial diagnostic: a short adaptive staircase per domain.
 * - starts one band BELOW the child's grade (never with hard questions)
 * - two correct answers on a rung → step up; a wrong answer → step down after a second miss
 * - preschoolers get only visual/audio question types
 * The placement level of each domain marks lower topics as "understood" (placed_by_assessment).
 */

export type Domain = "math" | "reading" | "logic";

export const LADDERS: Record<Domain, string[]> = {
  math: ["early.numbers", "early.counting", "early.compare-quantities", "math.addition-20", "math.subtraction-20", "math.place-value", "math.multiplication", "math.division", "math.fractions", "math.decimals", "math.percentages", "math.equations", "math.powers", "math.functions", "math.quadratics", "math.trigonometry", "math.logarithms"],
  reading: ["early.letters", "early.letter-sounds", "reading.syllables", "reading.words", "reading.sentences", "reading.parts-of-speech", "reading.punctuation", "reading.comprehension", "reading.morphology", "reading.literature", "reading.syntax", "reading.text-analysis"],
  logic: ["early.colors-shapes", "early.patterns", "tech.algorithms", "tech.loops", "tech.conditions", "math.probability"],
};

const YOUNG_TYPES = new Set(["image_selection", "audio_recognition", "single", "true_false", "number_input", "drawing"]);

export interface DomainState { rung: number; correctOnRung: number; wrongOnRung: number; asked: number; best: number; correct: number; done: boolean }
export interface DiagnosticState {
  grade: GradeLevel;
  young: boolean;
  seed: number;
  domains: Record<Domain, DomainState>;
  current: Domain;
  used: string[];
  totalMs: number;
  answered: number;
}

export function maxPerDomain(young: boolean) {
  return young ? 3 : 5;
}

export function startRung(domain: Domain, grade: GradeLevel, topics: Map<string, Topic>): number {
  const ladder = LADDERS[domain];
  let rung = 0;
  ladder.forEach((id, i) => {
    const t = topics.get(id);
    if (t && t.grades[1] <= grade - 1) rung = i; // one band below
  });
  return rung;
}

export function initDiagnostic(grade: GradeLevel, age: number, topics: Map<string, Topic>, seed: number): DiagnosticState {
  const young = age <= 6 || grade <= 0;
  const mk = (d: Domain): DomainState => ({ rung: startRung(d, grade, topics), correctOnRung: 0, wrongOnRung: 0, asked: 0, best: -1, correct: 0, done: false });
  return { grade, young, seed, domains: { math: mk("math"), reading: mk("reading"), logic: mk("logic") }, current: "math", used: [], totalMs: 0, answered: 0 };
}

export function pickQuestion(state: DiagnosticState, pool: (topicId: string) => Question[]): { q: Question; topicId: string } | null {
  const d = state.domains[state.current];
  const ladder = LADDERS[state.current];
  const r = rng(state.seed + state.answered * 7919);
  for (let offset = 0; offset < ladder.length; offset++) {
    // search the current rung first, then nearest lower rungs
    const idx = Math.max(0, d.rung - offset);
    const topicId = ladder[idx];
    let candidates = pool(topicId).filter((q) => !state.used.includes(q.id) && q.type !== "drawing" && q.type !== "code_blocks");
    if (state.young) candidates = candidates.filter((q) => YOUNG_TYPES.has(q.type));
    const gens = Object.entries(GENERATORS).filter(([, g]) => g.topicId === topicId).map(([id]) => id);
    if (gens.length && (r.next() < 0.5 || !candidates.length)) {
      const gid = r.pick(gens);
      const seed = r.int(1, 1_000_000);
      const q = GENERATORS[gid].make(seed, `gen:${gid}:${seed}`);
      return { q, topicId };
    }
    if (candidates.length) return { q: r.pick(candidates), topicId };
    if (idx === 0) break;
  }
  return null;
}

export function recordDiagnosticAnswer(state: DiagnosticState, questionId: string, correct: boolean, ms: number): DiagnosticState {
  const s: DiagnosticState = structuredClone(state);
  const d = s.domains[s.current];
  const ladder = LADDERS[s.current];
  s.used.push(questionId);
  s.answered++;
  s.totalMs += Math.min(ms, 120_000);
  d.asked++;
  if (correct) {
    d.correct++;
    d.correctOnRung++;
    d.wrongOnRung = 0;
    if (d.correctOnRung >= (s.young ? 1 : 2)) {
      d.best = Math.max(d.best, d.rung);
      d.correctOnRung = 0;
      if (d.rung < ladder.length - 1) d.rung++;
    }
  } else {
    d.wrongOnRung++;
    if (d.wrongOnRung >= 2 || s.young) {
      d.wrongOnRung = 0;
      d.correctOnRung = 0;
      if (d.rung > 0) d.rung--;
      else d.done = d.asked >= 2;
    }
  }
  if (d.asked >= maxPerDomain(s.young)) d.done = true;
  if (d.done) {
    const next = (["math", "reading", "logic"] as Domain[]).find((k) => !s.domains[k].done);
    if (next) s.current = next;
  }
  return s;
}

export const diagnosticFinished = (s: DiagnosticState) => Object.values(s.domains).every((d) => d.done);

export interface DiagnosticResult {
  domains: Record<Domain, { placedTopic: string | null; accuracy: number; asked: number }>;
  placedTopics: string[];
  avgSeconds: number;
}

/** Topics placed as "understood": every ladder rung up to the best one, plus their prerequisites. */
export function diagnosticResult(s: DiagnosticState, topics: Map<string, Topic>): DiagnosticResult {
  const placed = new Set<string>();
  const addWithPrereqs = (id: string) => {
    if (placed.has(id)) return;
    placed.add(id);
    topics.get(id)?.prerequisites.forEach(addWithPrereqs);
  };
  const domains = {} as DiagnosticResult["domains"];
  for (const k of Object.keys(LADDERS) as Domain[]) {
    const d = s.domains[k];
    const ladder = LADDERS[k];
    for (let i = 0; i <= d.best; i++) addWithPrereqs(ladder[i]);
    domains[k] = { placedTopic: d.best >= 0 ? ladder[d.best] : null, accuracy: d.asked ? d.correct / d.asked : 0, asked: d.asked };
  }
  return { domains, placedTopics: [...placed], avgSeconds: s.answered ? Math.round(s.totalMs / s.answered / 100) / 10 : 0 };
}
