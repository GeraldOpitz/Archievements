import Database from "@tauri-apps/plugin-sql";
import type { AchievementUnlockEvent } from "./types";

const DB_URL = "sqlite:archivements.db";

export interface AchievementUnlockRecord extends AchievementUnlockEvent {
  source: string;
  rarity: AchievementUnlockEvent["rarity"];
}

export interface GameProgressRecord {
  gameTitle: string;
  platform: string | null;
  totalAchievements: number;
  unlockedAchievements: number;
  progressPercentage: number;
  lastUnlockedAt: string | null;
}

export interface GameRecord {
  id: string;
  title: string;
  platform: string | null;
  createdAt: string;
}

export interface AchievementRecord {
  id: string;
  gameId: string;
  title: string;
  description: string | null;
  rarity: AchievementUnlockEvent["rarity"];
  createdAt: string;
}

export async function getGameProgress() {
  const db = await getDatabase();

  return db.select<GameProgressRecord[]>(
    `
    SELECT
      games.title as gameTitle,
      games.platform as platform,
      COUNT(achievements.id) as totalAchievements,
      COUNT(DISTINCT achievement_unlocks.achievement_title) as unlockedAchievements,
      CASE
        WHEN COUNT(achievements.id) = 0 THEN 0
        ELSE ROUND(
          COUNT(DISTINCT achievement_unlocks.achievement_title) * 100.0 / COUNT(achievements.id)
        )
      END as progressPercentage,
      MAX(achievement_unlocks.unlocked_at) as lastUnlockedAt
    FROM games
    LEFT JOIN achievements
      ON achievements.game_id = games.id
    LEFT JOIN achievement_unlocks
      ON achievement_unlocks.game_title = games.title
      AND achievement_unlocks.achievement_title = achievements.title
    GROUP BY games.id
    ORDER BY lastUnlockedAt DESC, games.created_at DESC;
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

  await db.execute(`
  CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    platform TEXT,
    created_at TEXT NOT NULL
  );
`);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      rarity TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id)
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

export async function createGame(title: string, platform?: string) {
  const db = await getDatabase();

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.execute(
    `
    INSERT INTO games (
      id,
      title,
      platform,
      created_at
    ) VALUES (?, ?, ?, ?);
    `,
    [id, title, platform ?? null, createdAt]
  );

  return {
    id,
    title,
    platform: platform ?? null,
    createdAt,
  };
}

export async function getGames() {
  const db = await getDatabase();

  return db.select<GameRecord[]>(
    `
    SELECT
      id,
      title,
      platform,
      created_at as createdAt
    FROM games
    ORDER BY created_at DESC;
    `
  );
}

export async function createAchievement(
  gameId: string,
  title: string,
  description: string,
  rarity: AchievementUnlockEvent["rarity"]
) {
  const db = await getDatabase();

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db.execute(
    `
    INSERT INTO achievements (
      id,
      game_id,
      title,
      description,
      rarity,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?);
    `,
    [id, gameId, title, description, rarity, createdAt]
  );

  return {
    id,
    gameId,
    title,
    description,
    rarity,
    createdAt,
  };
}

export async function getAchievementsByGame(gameId: string) {
  const db = await getDatabase();

  return db.select<AchievementRecord[]>(
    `
    SELECT
      id,
      game_id as gameId,
      title,
      description,
      rarity,
      created_at as createdAt
    FROM achievements
    WHERE game_id = ?
    ORDER BY created_at DESC;
    `,
    [gameId]
  );
}
