import { useEffect, useState } from "react";
import {
  getRecentAchievementUnlocks,
  type AchievementUnlockRecord,
} from "./achievementHistory";

const rarityLabels = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

export function AchievementHistory() {
  const [unlocks, setUnlocks] = useState<AchievementUnlockRecord[]>([]);

  async function loadHistory() {
    const recentUnlocks = await getRecentAchievementUnlocks(10);
    setUnlocks(recentUnlocks);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  if (unlocks.length === 0) {
    return (
      <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
        <h2 className="text-xl font-bold mb-2">
          Historial
        </h2>

        <p className="text-slate-400 text-sm">
          Aún no hay logros guardados.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          Últimos logros
        </h2>

        <button
          onClick={loadHistory}
          className="
            px-4 py-2
            rounded-xl
            bg-slate-700
            hover:bg-slate-600
            text-sm
            font-bold
          "
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-3">
        {unlocks.map((unlock) => (
          <article
            key={unlock.id}
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
                  {unlock.achievementTitle}
                </p>

                <p className="text-sm text-slate-400">
                  {unlock.gameTitle}
                </p>
              </div>

              <span className="text-xs font-bold text-yellow-300">
                {rarityLabels[unlock.rarity]}
              </span>
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>
                Fuente: {unlock.source}
              </span>

              <span>
                {new Date(unlock.unlockedAt).toLocaleString()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
