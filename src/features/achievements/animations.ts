import type { AchievementRarity } from "./types";

export const achievementAnimations: Record<
  AchievementRarity,
  {
    initial: object;
    animate: object;
    exit: object;
    transition: object;
    extraClass?: string;
  }
> = {
  common: {
    initial: { opacity: 0, y: -24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -24, scale: 0.98 },
    transition: { duration: 0.25 },
  },
  rare: {
    initial: { opacity: 0, y: -45, scale: 0.92 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -35, scale: 0.95 },
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
  epic: {
    initial: { opacity: 0, scale: 0.65, rotate: -2 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.85, rotate: 2 },
    transition: { type: "spring", stiffness: 220, damping: 14 },
  },
  legendary: {
    initial: { opacity: 0, x: 80, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 80, scale: 0.9 },
    transition: { type: "spring", stiffness: 240, damping: 16 },
    extraClass: "shadow-yellow-400/30",
  },
  platinum: {
    initial: { opacity: 0, scale: 0.4, rotate: -8 },
    animate: { opacity: 1, scale: 1.08, rotate: 0 },
    exit: { opacity: 0, scale: 0.75, rotate: 8 },
    transition: { type: "spring", stiffness: 200, damping: 10 },
    extraClass: "shadow-cyan-200/40",
  },
};
