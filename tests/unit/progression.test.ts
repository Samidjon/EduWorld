import { describe, expect, it } from "vitest";
import { achievementMet, addXp, dailyChallengesFor, gameReward, GAME_REWARD_DAILY_CAP, lessonReward, newGameProfile, touchStreak, xpToNext } from "@/features/progression/rules";
import { ACHIEVEMENTS } from "@/data/achievements";
import { ITEMS } from "@/data/items";
import type { GameProfileRow } from "@/types/db";

const gp = (): GameProfileRow => ({ id: "g", ...newGameProfile("c") });

describe("xp & levels", () => {
  it("levels up and carries over xp", () => {
    const { profile, levelsGained } = addXp(gp(), xpToNext(1) + 10);
    expect(levelsGained).toBe(1);
    expect(profile.level).toBe(2);
    expect(profile.xp).toBe(10);
    expect(profile.total_xp).toBe(xpToNext(1) + 10);
  });
  it("can gain several levels at once", () => {
    expect(addXp(gp(), 1000).profile.level).toBeGreaterThan(3);
  });
});

describe("streaks never punish", () => {
  it("continues on consecutive days and restarts at 1 after a gap", () => {
    let p = touchStreak(gp(), "2026-03-01");
    p = touchStreak(p, "2026-03-02");
    expect(p.streak).toBe(2);
    p = touchStreak(p, "2026-03-02");
    expect(p.streak).toBe(2);
    p = touchStreak(p, "2026-03-10");
    expect(p.streak).toBe(1);
    expect(p.longest_streak).toBe(2);
    expect(p.coins).toBe(gp().coins); // nothing is taken away
  });
});

describe("rewards", () => {
  it("first mastery gives a bonus; repeats give less", () => {
    expect(lessonReward(2, 1, true, false).xp).toBeGreaterThan(lessonReward(2, 1, false, false).xp);
    expect(lessonReward(2, 1, false, true).xp).toBeLessThan(lessonReward(2, 1, false, false).xp);
  });
  it("game rewards are capped per day", () => {
    expect(gameReward(5, 10, 0).xp).toBeGreaterThan(0);
    expect(gameReward(10, 10, GAME_REWARD_DAILY_CAP)).toEqual({ xp: 0, coins: 0 });
  });
  it("shop sells cosmetics only", () => {
    expect(ITEMS.every((i) => ["hat", "outfit", "accessory", "shoes", "pet", "decor", "color"].includes(i.type))).toBe(true);
  });
});

describe("achievements & challenges", () => {
  const stats = { lessonsCompleted: 1, topicsMastered: 0, correctAnswers: 0, streak: 0, level: 1, bossesDefeated: 0, gamesPlayed: 0, worldsUnlocked: 1, assessmentDone: true, itemsOwned: 0 };
  it("evaluates requirements", () => {
    expect(achievementMet(ACHIEVEMENTS.find((a) => a.id === "first-lesson")!, stats)).toBe(true);
    expect(achievementMet(ACHIEVEMENTS.find((a) => a.id === "lessons-10")!, stats)).toBe(false);
    expect(achievementMet(ACHIEVEMENTS.find((a) => a.id === "first-steps")!, stats)).toBe(true);
  });
  it("daily challenges are deterministic per date", () => {
    expect(dailyChallengesFor("2026-05-05")).toEqual(dailyChallengesFor("2026-05-05"));
    expect(dailyChallengesFor("2026-05-05")).toHaveLength(3);
  });
});
