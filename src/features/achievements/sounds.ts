import type { AchievementRarity } from "./types";

export const achievementSounds: Record<AchievementRarity, string> = {
  common: "/sounds/common.mp3",
  rare: "/sounds/rare.mp3",
  epic: "/sounds/epic.mp3",
  legendary: "/sounds/legendary.mp3",
  platinum: "/sounds/platinum.mp3",
};

export function playAchievementSound(rarity: AchievementRarity) {
  const audio = new Audio(achievementSounds[rarity]);

  audio.volume = 0.7;

  audio.play().catch((error) => {
    console.warn("No se pudo reproducir el sonido:", error);
  });
}
