import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AchievementToast } from "./features/achievements/AchievementToast";
import type {
  AchievementRarity,
  AchievementUnlockEvent,
} from "./features/achievements/types";

const rarityLabels: Record<AchievementRarity, string> = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

const demoTitles: Record<AchievementRarity, string> = {
  common: "Primer paso",
  rare: "Explorador curioso",
  epic: "Dominio avanzado",
  legendary: "Hazaña legendaria",
  platinum: "Juego completado al 100%",
};

export default function App() {
  const [currentAchievement, setCurrentAchievement] =
    useState<AchievementUnlockEvent | null>(null);

  const [queue, setQueue] = useState<AchievementUnlockEvent[]>([]);

  function simulateAchievement(rarity: AchievementRarity) {
    const event: AchievementUnlockEvent = {
      id: crypto.randomUUID(),
      gameTitle: "Archivements Demo",
      achievementTitle: demoTitles[rarity],
      description: `Simulaste un logro de rareza ${rarityLabels[rarity]}.`,
      rarity,
      unlockedAt: new Date().toISOString(),
    };

    setQueue((prev) => [...prev, event]);
  }

  useEffect(() => {
    if (currentAchievement !== null) return;
    if (queue.length === 0) return;

    const nextAchievement = queue[0];

    setCurrentAchievement(nextAchievement);
    setQueue((prev) => prev.slice(1));
}, [currentAchievement, queue]);


  useEffect(() => {
  if (currentAchievement === null) return;

  const timeout = setTimeout(() => {
    setCurrentAchievement(null);
  }, 4000);

  return () => clearTimeout(timeout);
}, [currentAchievement]);

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AchievementToast achievement={currentAchievement} />

      <div className="w-[760px] p-10 rounded-3xl bg-slate-800 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Trophy size={40} />

          <div>
            <h1 className="text-4xl font-bold">
              Archivements
            </h1>

            <p className="text-slate-400">
              Universal achievement engine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(rarityLabels).map(([rarity, label]) => (
            <motion.button
              key={rarity}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => simulateAchievement(rarity as AchievementRarity)}
              className="
                px-6 py-4
                rounded-2xl
                bg-slate-700
                hover:bg-slate-600
                text-white
                font-bold
                text-left
              "
            >
              Simular logro {label}
            </motion.button>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Logros en cola: {queue.length}
        </p>
      </div>
    </main>
  );
}
