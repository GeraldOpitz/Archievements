import { useEffect, useState } from "react";
import {
  getGameProgress,
  type GameProgressRecord,
} from "./achievementHistory";

interface Props {
  refreshKey: number;
}

export function GameProgress({ refreshKey }: Props) {
  const [games, setGames] = useState<GameProgressRecord[]>([]);

  async function loadProgress() {
    const progress = await getGameProgress();
    setGames(progress);
  }

  useEffect(() => {
    loadProgress();
  }, [refreshKey]);

  if (games.length === 0) {
    return (
      <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
        <h2 className="text-xl font-bold mb-2">
          Progreso por juego
        </h2>

        <p className="text-slate-400 text-sm">
          Aún no hay juegos con logros desbloqueados.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Progreso por juego
      </h2>

      <div className="space-y-3">
        {games.map((game) => (
            <article
            key={game.gameTitle}
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
                    {game.gameTitle}
                </p>

                <p className="text-sm text-slate-400">
                    {game.platform ?? "Sin plataforma"}
                </p>
                </div>

                <span className="text-sm font-bold text-yellow-300">
                {game.progressPercentage}%
                </span>
            </div>

            <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>
                    {game.unlockedAchievements} / {game.totalAchievements} logros
                </span>

                <span>
                    {game.totalAchievements === 0
                    ? "Sin logros definidos"
                    : "Progreso"}
                </span>
                </div>

                <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
                <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${game.progressPercentage}%` }}
                />
                </div>
            </div>

            {game.lastUnlockedAt && (
                <p className="text-xs text-slate-500 mt-3">
                Último desbloqueo:{" "}
                {new Date(game.lastUnlockedAt).toLocaleString()}
                </p>
            )}
            </article>
        ))}
      </div>
    </section>
  );
}
