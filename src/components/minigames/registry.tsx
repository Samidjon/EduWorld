"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { MiniGameId } from "@/types/content";
import type { MiniGameProps } from "./types";
import { Spinner } from "@/components/ui";

const loading = () => (
  <div className="grid min-h-60 place-items-center">
    <Spinner />
  </div>
);

/** Each game is code-split and loaded only when opened (Phaser is loaded only by Logic Maze). */
export const GAME_COMPONENTS: Record<MiniGameId, ComponentType<MiniGameProps>> = {
  "alphabet-finder": dynamic(() => import("./games/AlphabetFinder"), { ssr: false, loading }),
  "word-builder": dynamic(() => import("./games/WordBuilder"), { ssr: false, loading }),
  "number-counting": dynamic(() => import("./games/NumberCounting"), { ssr: false, loading }),
  "math-challenge": dynamic(() => import("./games/MathChallenge"), { ssr: false, loading }),
  "memory-match": dynamic(() => import("./games/MemoryMatch"), { ssr: false, loading }),
  "pattern-puzzle": dynamic(() => import("./games/PatternPuzzle"), { ssr: false, loading }),
  "logic-maze": dynamic(() => import("./games/LogicMaze"), { ssr: false, loading }),
  "shape-builder": dynamic(() => import("./games/ShapeBuilder"), { ssr: false, loading }),
  "reading-adventure": dynamic(() => import("./games/ReadingAdventure"), { ssr: false, loading }),
  "science-lab": dynamic(() => import("./games/ScienceLab"), { ssr: false, loading }),
  "robot-coder": dynamic(() => import("./games/RobotCoder"), { ssr: false, loading }),
};
