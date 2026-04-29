import { useState } from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AchievementToast } from "./features/achievements/AchievementToast";
import type { AchievementUnlockEvent } from "./features/achievements/types";

export default function App() {
  const [achievement, setAchievement] =
    useState<AchievementUnlockEvent | null>(null);

  function simulateLegendaryAchievement() {
    const event: AchievementUnlockEvent = {
      id: crypto.randomUUID(),
      gameTitle: "Archivements Demo",
      achievementTitle: "First Legendary Unlock",
      description: "Simulaste tu primer logro legendario.",
      rarity: "legendary",
      unlockedAt: new Date().toISOString(),
    };

    setAchievement(event);

    setTimeout(() => {
      setAchievement(null);
    }, 4000);
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AchievementToast achievement={achievement} />

      <div className="w-[700px] p-10 rounded-3xl bg-slate-800 shadow-2xl">
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

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={simulateLegendaryAchievement}
          className="
            px-8 py-4
            rounded-2xl
            bg-yellow-500
            text-black
            font-bold
          "
        >
          Simular logro legendario
        </motion.button>
      </div>
    </main>
  );
}
