import { useEffect, useState } from "react";
import {
  getAchievementsByGame,
  getGames,
  type AchievementRecord,
  type GameRecord,
} from "./achievementHistory";

interface Props {
  refreshKey: number;
}

const rarityLabels = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

export function AchievementDefinitionList({ refreshKey }: Props) {
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
                  <div className="flex justify-between gap-4">
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

                  <p className="text-xs text-slate-500 mt-2">
                    Creado: {new Date(achievement.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
