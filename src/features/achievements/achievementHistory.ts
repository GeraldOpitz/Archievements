import Database from "@tauri-apps/plugin-sql";
import type { AchievementUnlockEvent } from "./types";

const DB_URL = "sqlite:archivements.db";

export interface AchievementUnlockRecord extends AchievementUnlockEvent {
  source: string;
  rarity: AchievementUnlockEvent["rarity"];
}

export async function getDatabase() {
  const db = await Database.load(DB_URL);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS achievement_unlocks (
      id TEXT PRIMARY KEY,
      game_title TEXT NOT NULL,
      achievement_title TEXT NOT NULL,
      description TEXT,
      rarity TEXT NOT NULL,
      source TEXT NOT NULL,
      unlocked_at TEXT NOT NULL
    );
  `);

  return db;
}

export async function saveAchievementUnlock(
  achievement: AchievementUnlockEvent,
  source = "simulator"
) {
  const db = await getDatabase();

  await db.execute(
    `
    INSERT OR REPLACE INTO achievement_unlocks (
      id,
      game_title,
      achievement_title,
      description,
      rarity,
      source,
      unlocked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      achievement.id,
      achievement.gameTitle,
      achievement.achievementTitle,
      achievement.description,
      achievement.rarity,
      source,
      achievement.unlockedAt,
    ]
  );
}

export async function getRecentAchievementUnlocks(limit = 10) {
  const db = await getDatabase();

  return db.select<AchievementUnlockRecord[]>(
    `
    SELECT
      id,
      game_title as gameTitle,
      achievement_title as achievementTitle,
      description,
      rarity,
      source,
      unlocked_at as unlockedAt
    FROM achievement_unlocks
    ORDER BY unlocked_at DESC
    LIMIT ?;
    `,
    [limit]
  );
}
