export type AchievementRarity =
  | "common"
  | "rare"
  | "epic"
  | "legendary"
  | "platinum";

export interface AchievementUnlockEvent {
  id: string;
  gameTitle: string;
  achievementTitle: string;
  description: string;
  rarity: AchievementRarity;
  unlockedAt: string;
}
