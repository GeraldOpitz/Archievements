import { useEffect, useState } from "react";
import {
  getAchievementsByGame,
  getGames,
  type AchievementRecord,
  type GameRecord,
} from "./achievementHistory";

interface Props {
  refreshKey: number;
  onUnlockAchievement: (achievement: {
    gameTitle: string;
    achievementTitle: string;
    description: string;
    rarity: AchievementRecord["rarity"];
  }) => void;
}

const rarityLabels = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

export function AchievementDefinitionList({
  refreshKey,
  onUnlockAchievement,
}: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);

  async function loadGames() {
    const savedGames = await getGames();

    setGames(savedGames);

    if (!selectedGameId && savedGames.length > 0) {
      setSelectedGameId(savedGames[0].id);
    }
  }

  async function loadAchievements(gameId: string) {
    if (!gameId) return;

    const savedAchievements = await getAchievementsByGame(gameId);
    setAchievements(savedAchievements);
  }

  useEffect(() => {
    loadGames();
  }, [refreshKey]);

  useEffect(() => {
    loadAchievements(selectedGameId);
  }, [selectedGameId, refreshKey]);

  function handleUnlock(achievement: AchievementRecord) {
    const game = games.find((g) => g.id === achievement.gameId);

    if (!game) return;

    onUnlockAchievement({
      gameTitle: game.title,
      achievementTitle: achievement.title,
      description: achievement.description ?? "",
      rarity: achievement.rarity,
    });
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Logros definidos
      </h2>

      {games.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Aún no hay juegos guardados.
        </p>
      ) : (
        <>
          <select
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
            className="w-full mb-4 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
                {game.platform ? ` (${game.platform})` : ""}
              </option>
            ))}
          </select>

          {achievements.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Este juego aún no tiene logros definidos.
            </p>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="
                    rounded-xl
                    bg-slate-800
                    p-4
                    border border-slate-700
                  "
                >
                  <div className="flex justify-between gap-4 items-start">
                    <div>
                      <p className="font-bold">
                        {achievement.title}
                      </p>

                      {achievement.description && (
                        <p className="text-sm text-slate-400 mt-1">
                          {achievement.description}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-bold text-yellow-300">
                      {rarityLabels[achievement.rarity]}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                      Creado: {new Date(achievement.createdAt).toLocaleString()}
                    </p>
                </div>

                {achievement.unlockedAt ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                    className="
                        px-4 py-2
                        rounded-xl
                        bg-emerald-500/20
                        text-emerald-300
                        font-bold
                        text-sm
                    "
                    >
                    Desbloqueado
                    </span>

                    <span className="text-xs text-slate-500">
                    {new Date(achievement.unlockedAt).toLocaleString()}
                    </span>
                </div>
                ) : (
                <div className="mt-3">
                    <button
                    onClick={() => handleUnlock(achievement)}
                    className="
                        px-4 py-2
                        rounded-xl
                        bg-emerald-500
                        text-black
                        font-bold
                        text-sm
                        hover:bg-emerald-400
                        transition
                    "
                    >
                    Desbloquear
                    </button>
                </div>
                )}
                  
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
