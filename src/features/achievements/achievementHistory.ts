import Database from "@tauri-apps/plugin-sql";
import type { AchievementUnlockEvent } from "./types";

const DB_URL = "sqlite:archivements.db";

export interface AchievementUnlockRecord extends AchievementUnlockEvent {
  source: string;
  rarity: AchievementUnlockEvent["rarity"];
}

export interface GameProgressRecord {
  gameTitle: string;
  totalUnlocks: number;
  commonCount: number;
  rareCount: number;
  epicCount: number;
  legendaryCount: number;
  platinumCount: number;
  lastUnlockedAt: string;
}

export async function getGameProgress() {
  const db = await getDatabase();

  return db.select<GameProgressRecord[]>(
    `
    SELECT
      game_title as gameTitle,
      COUNT(*) as totalUnlocks,
      SUM(CASE WHEN rarity = 'common' THEN 1 ELSE 0 END) as commonCount,
      SUM(CASE WHEN rarity = 'rare' THEN 1 ELSE 0 END) as rareCount,
      SUM(CASE WHEN rarity = 'epic' THEN 1 ELSE 0 END) as epicCount,
      SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) as legendaryCount,
      SUM(CASE WHEN rarity = 'platinum' THEN 1 ELSE 0 END) as platinumCount,
      MAX(unlocked_at) as lastUnlockedAt
    FROM achievement_unlocks
    GROUP BY game_title
    ORDER BY lastUnlockedAt DESC;
    `
  );
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
