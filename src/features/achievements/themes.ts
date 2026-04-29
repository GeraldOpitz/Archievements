import type { AchievementRarity } from "./types";

export type AchievementTheme = "xbox" | "playstation" | "steam" | "retro";

export const themeLabels: Record<AchievementTheme, string> = {
  xbox: "Xbox",
  playstation: "PlayStation",
  steam: "Steam",
  retro: "Retro",
};

export const themeStyles: Record<
  AchievementTheme,
  {
    container: string;
    title: string;
    subtitle: string;
    accentByRarity: Record<AchievementRarity, string>;
  }
> = {
  xbox: {
    container: "bg-black/95 border-green-400/60",
    title: "text-white",
    subtitle: "text-green-300",
    accentByRarity: {
      common: "bg-green-500",
      rare: "bg-sky-400",
      epic: "bg-purple-400",
      legendary: "bg-yellow-400",
      platinum: "bg-cyan-200",
    },
  },
  playstation: {
    container: "bg-blue-950/95 border-blue-300/60",
    title: "text-white",
    subtitle: "text-blue-200",
    accentByRarity: {
      common: "bg-slate-300",
      rare: "bg-blue-300",
      epic: "bg-purple-300",
      legendary: "bg-yellow-300",
      platinum: "bg-cyan-100",
    },
  },
  steam: {
    container: "bg-slate-950/95 border-slate-500/60",
    title: "text-slate-100",
    subtitle: "text-sky-300",
    accentByRarity: {
      common: "bg-slate-400",
      rare: "bg-sky-500",
      epic: "bg-indigo-400",
      legendary: "bg-orange-400",
      platinum: "bg-teal-200",
    },
  },
  retro: {
    container: "bg-zinc-950 border-pink-400",
    title: "text-pink-200",
    subtitle: "text-lime-300",
    accentByRarity: {
      common: "bg-lime-400",
      rare: "bg-cyan-400",
      epic: "bg-fuchsia-400",
      legendary: "bg-yellow-300",
      platinum: "bg-white",
    },
  },
};
