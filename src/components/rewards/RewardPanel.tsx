"use client";

import { motion } from "framer-motion";
import { Coin } from "@/components/shared/Coin";
import { useEffect } from "react";
import type { LText } from "@/types/content";
import { useT } from "@/components/shared/LocaleProvider";
import { sfx } from "@/lib/audio";
import { getItem } from "@/data/items";

export interface RewardData {
  xp: number;
  coins: number;
  levelUp?: number;
  achievements?: { id: string; icon: string; name: LText }[];
  challenges?: { title: LText }[];
  item?: string;
}

/** Reward chest: always deterministic rewards for learning results - no random loot. */
export function RewardPanel({ reward }: { reward: RewardData }) {
  const { t, tl } = useT();
  useEffect(() => {
    sfx(reward.levelUp ? "levelUp" : "coin");
  }, [reward.levelUp]);
  const item = reward.item ? getItem(reward.item) : null;
  return (
    <div className="space-y-3">
      <motion.div initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="mx-auto grid size-24 place-items-center rounded-3xl bg-gradient-to-b from-sun to-[#f0a83a] text-5xl shadow-lg" aria-hidden>
        🎁
      </motion.div>
      <div className="flex justify-center gap-3">
        <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white/10 px-4 py-2 font-display text-xl">
          +{reward.xp} <span className="text-sm opacity-80">{t("xp")}</span>
        </motion.span>
        <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="rounded-2xl bg-white/10 px-4 py-2 font-display text-xl">
          +{reward.coins} <Coin size={20} />
        </motion.span>
      </div>
      {!!reward.levelUp && <p className="text-center font-display text-2xl text-sun">⭐ {t("levelUp")}</p>}
      {item && (
        <p className="text-center font-semibold">
          {t("newItem")} {item.art.length <= 3 ? item.art : "🎀"} {tl(item.name)}
        </p>
      )}
      {reward.achievements?.map((a) => (
        <motion.div key={a.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 rounded-2xl bg-lavender/20 p-3">
          <span className="text-3xl" aria-hidden>{a.icon}</span>
          <span>
            <span className="block text-xs uppercase opacity-70">{t("newAchievement")}</span>
            <span className="font-bold">{tl(a.name)}</span>
          </span>
        </motion.div>
      ))}
      {reward.challenges?.map((c, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-mint/20 p-3">
          <span className="text-2xl" aria-hidden>✅</span>
          <span>
            <span className="block text-xs uppercase opacity-70">{t("challengeDone")}</span>
            <span className="font-bold">{tl(c.title)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
