import { useEffect, useState } from "react";
import {
  getAchievementsByGame,
  type AchievementRecord,
  type GameRecord,
} from "./achievementHistory";

interface Props {
  game: GameRecord | null;
  onUnlock: (achievement: AchievementRecord) => void;
  refreshKey: number;
}

export function GameDetail({ game, onUnlock, refreshKey }: Props) {
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);

  async function load() {
    if (!game) return;

    const data = await getAchievementsByGame(game.id);
    setAchievements(data);
  }

  useEffect(() => {
    load();
  }, [game, refreshKey]);

  if (!game) {
    return (
      <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
        <p className="text-slate-400">
          Selecciona un juego para ver detalles.
        </p>
      </section>
    );
  }

  const unlocked = achievements.filter((a) => a.unlockedAt).length;
  const total = achievements.length;
  const percentage = total === 0 ? 0 : Math.round((unlocked / total) * 100);

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-2xl font-bold mb-2">
        {game.title}
      </h2>

      <p className="text-slate-400 mb-4">
        {game.platform ?? "Sin plataforma"}
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>{unlocked} / {total} logros</span>
          <span>{percentage}%</span>
        </div>

        <div className="h-3 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-yellow-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {achievements.map((a) => (
          <article
            key={a.id}
            className={`
              rounded-xl p-4 border
              ${a.unlockedAt
                ? "bg-emerald-900/20 border-emerald-700"
                : "bg-slate-800 border-slate-700"}
            `}
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{a.title}</p>

                {a.description && (
                  <p className="text-sm text-slate-400 mt-1">
                    {a.description}
                  </p>
                )}
              </div>

              <span className="text-xs text-yellow-300 font-bold">
                {a.rarity}
              </span>
            </div>

            {a.unlockedAt ? (
              <p className="text-xs text-slate-500 mt-2">
                Desbloqueado: {new Date(a.unlockedAt).toLocaleString()}
              </p>
            ) : (
              <button
                onClick={() => onUnlock(a)}
                className="
                  mt-3 px-4 py-2 rounded-xl
                  bg-emerald-500 text-black font-bold
                  hover:bg-emerald-400 transition
                "
              >
                Desbloquear
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
