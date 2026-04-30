import Database from "@tauri-apps/plugin-sql";
import type { AchievementUnlockEvent } from "./types";

const DB_URL = "sqlite:archivements.db";

type LoadedDatabase = Awaited<ReturnType<typeof Database.load>>;

export interface AchievementUnlockRecord extends AchievementUnlockEvent {
  source: string;
  rarity: AchievementUnlockEvent["rarity"];
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
  gameTitle?: string;
  title: string;
  description: string | null;
  rarity: AchievementUnlockEvent["rarity"];
  createdAt: string;
  unlockedAt: string | null;
}

export interface GameProgressRecord {
  gameTitle: string;
  platform: string | null;
  totalAchievements: number;
  unlockedAchievements: number;
  progressPercentage: number;
  lastUnlockedAt: string | null;
}

export interface SteamAchievementImport {
  externalId: string;
  title: string;
  description: string;
  iconUrl: string | null;
  iconGrayUrl: string | null;
  globalPercentage: number | null;
}

export interface SteamGameImport {
  appId: number;
  gameTitle: string;
  achievements: SteamAchievementImport[];
}

async function ensureColumn(
  db: LoadedDatabase,
  table: string,
  column: string,
  definition: string
) {
  const columns = await db.select<{ name: string }[]>(
    `PRAGMA table_info(${table});`
  );

  const exists = columns.some((item) => item.name === column);

  if (!exists) {
    await db.execute(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`
    );
  }
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

  await ensureColumn(db, "games", "source", "TEXT");
  await ensureColumn(db, "games", "external_app_id", "TEXT");

  await ensureColumn(db, "achievements", "source", "TEXT");
  await ensureColumn(db, "achievements", "external_id", "TEXT");
  await ensureColumn(db, "achievements", "icon_url", "TEXT");
  await ensureColumn(db, "achievements", "icon_gray_url", "TEXT");
  await ensureColumn(db, "achievements", "global_percentage", "REAL");

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_unlock
    ON achievement_unlocks (game_title, achievement_title);
  `);

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_steam_game
    ON games (source, external_app_id);
  `);

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_achievement_external
    ON achievements (game_id, external_id);
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
    INSERT OR IGNORE INTO achievement_unlocks (
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
      achievements.id,
      achievements.game_id as gameId,
      games.title as gameTitle,
      achievements.title,
      achievements.description,
      achievements.rarity,
      achievements.created_at as createdAt,
      MAX(achievement_unlocks.unlocked_at) as unlockedAt
    FROM achievements
    INNER JOIN games
      ON games.id = achievements.game_id
    LEFT JOIN achievement_unlocks
      ON achievement_unlocks.game_title = games.title
      AND achievement_unlocks.achievement_title = achievements.title
    WHERE achievements.game_id = ?
    GROUP BY achievements.id
    ORDER BY achievements.created_at DESC;
    `,
    [gameId]
  );
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

function rarityFromGlobalPercentage(
  percentage: number | null
): AchievementUnlockEvent["rarity"] {
  if (percentage === null) return "common";
  if (percentage < 5) return "legendary";
  if (percentage < 10) return "epic";
  if (percentage < 50) return "rare";

  return "common";
}

export async function importSteamGameToDatabase(data: SteamGameImport) {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const externalAppId = String(data.appId);

  const existingByExternal = await db.select<GameRecord[]>(
    `
    SELECT
      id,
      title,
      platform,
      created_at as createdAt
    FROM games
    WHERE source = 'steam'
      AND external_app_id = ?;
    `,
    [externalAppId]
  );

  let gameId = existingByExternal[0]?.id;

  if (!gameId) {
    const existingByTitle = await db.select<GameRecord[]>(
      `
      SELECT
        id,
        title,
        platform,
        created_at as createdAt
      FROM games
      WHERE title = ?;
      `,
      [data.gameTitle]
    );

    gameId = existingByTitle[0]?.id;
  }

  if (gameId) {
    await db.execute(
      `
      UPDATE games
      SET
        title = ?,
        platform = ?,
        source = ?,
        external_app_id = ?
      WHERE id = ?;
      `,
      [data.gameTitle, "Steam", "steam", externalAppId, gameId]
    );
  } else {
    gameId = crypto.randomUUID();

    await db.execute(
      `
      INSERT INTO games (
        id,
        title,
        platform,
        created_at,
        source,
        external_app_id
      ) VALUES (?, ?, ?, ?, ?, ?);
      `,
      [gameId, data.gameTitle, "Steam", now, "steam", externalAppId]
    );
  }

  for (const achievement of data.achievements) {
    const rarity = rarityFromGlobalPercentage(achievement.globalPercentage);

    const existingAchievement = await db.select<AchievementRecord[]>(
      `
      SELECT
        id,
        game_id as gameId,
        title,
        description,
        rarity,
        created_at as createdAt,
        NULL as unlockedAt
      FROM achievements
      WHERE game_id = ?
        AND external_id = ?;
      `,
      [gameId, achievement.externalId]
    );

    if (existingAchievement.length > 0) {
      await db.execute(
        `
        UPDATE achievements
        SET
          title = ?,
          description = ?,
          rarity = ?,
          source = ?,
          icon_url = ?,
          icon_gray_url = ?,
          global_percentage = ?
        WHERE id = ?;
        `,
        [
          achievement.title,
          achievement.description,
          rarity,
          "steam",
          achievement.iconUrl,
          achievement.iconGrayUrl,
          achievement.globalPercentage,
          existingAchievement[0].id,
        ]
      );
    } else {
      await db.execute(
        `
        INSERT INTO achievements (
          id,
          game_id,
          title,
          description,
          rarity,
          created_at,
          source,
          external_id,
          icon_url,
          icon_gray_url,
          global_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          crypto.randomUUID(),
          gameId,
          achievement.title,
          achievement.description,
          rarity,
          now,
          "steam",
          achievement.externalId,
          achievement.iconUrl,
          achievement.iconGrayUrl,
          achievement.globalPercentage,
        ]
      );
    }
  }

  return {
    gameId,
    importedAchievements: data.achievements.length,
  };
}
