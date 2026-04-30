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
                  {game.totalUnlocks} logros desbloqueados
                </p>
              </div>

              <span className="text-xs text-slate-500">
                Último: {new Date(game.lastUnlockedAt).toLocaleString()}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
              <span className="rounded-lg bg-slate-700 p-2">
                Común: {game.commonCount}
              </span>

              <span className="rounded-lg bg-sky-900/60 p-2">
                Raro: {game.rareCount}
              </span>

              <span className="rounded-lg bg-purple-900/60 p-2">
                Épico: {game.epicCount}
              </span>

              <span className="rounded-lg bg-yellow-900/60 p-2">
                Legendario: {game.legendaryCount}
              </span>

              <span className="rounded-lg bg-cyan-900/60 p-2">
                Platino: {game.platinumCount}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
