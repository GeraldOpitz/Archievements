import { motion } from "framer-motion";
import type {
  AchievementRarity,
  AchievementUnlockEvent,
} from "./types";

interface Props {
  onSimulate: (achievement: AchievementUnlockEvent) => void;
  queueLength: number;
}

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

export function AchievementSimulator({ onSimulate, queueLength }: Props) {
  function simulateAchievement(rarity: AchievementRarity) {
    const event: AchievementUnlockEvent = {
      id: crypto.randomUUID(),
      gameTitle: "Archivements Demo",
      achievementTitle: demoTitles[rarity],
      description: `Simulaste un logro de rareza ${rarityLabels[rarity]}.`,
      rarity,
      unlockedAt: new Date().toISOString(),
    };

    onSimulate(event);
  }

  return (
    <section>
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
        Logros en cola: {queueLength}
      </p>
    </section>
  );
}
