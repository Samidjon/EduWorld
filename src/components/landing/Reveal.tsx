"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";

/**
 * Respect the OS "reduce motion" setting for every framer-motion animation below it:
 * transform animations (slides, floating characters) are disabled, only gentle fades remain.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Fades/slides content in once it scrolls into view. */
export function Reveal({ children, delay = 0, className, y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
