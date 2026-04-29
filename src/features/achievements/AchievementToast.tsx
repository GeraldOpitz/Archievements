import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import type { AchievementUnlockEvent } from "./types";

interface Props {
  achievement: AchievementUnlockEvent | null;
}

const rarityLabel = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

export function AchievementToast({ achievement }: Props) {
  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className="
            fixed top-8 right-8 z-50
            w-[420px]
            rounded-3xl
            bg-slate-950/95
            border border-yellow-400/50
            shadow-2xl
            overflow-hidden
          "
        >
          <div className="h-1 bg-yellow-400" />

          <div className="p-5 flex gap-4 items-center">
            <div
              className="
                w-16 h-16
                rounded-2xl
                bg-yellow-400
                text-black
                flex items-center justify-center
                shadow-lg
              "
            >
              <Trophy size={34} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 text-yellow-300 text-sm font-bold uppercase tracking-wide">
                <Sparkles size={16} />
                Logro desbloqueado
              </div>

              <h2 className="text-xl font-bold text-white">
                {achievement.achievementTitle}
              </h2>

              <p className="text-sm text-slate-400">
                {achievement.gameTitle}
              </p>

              <p className="text-sm text-yellow-300 mt-1">
                Rareza: {rarityLabel[achievement.rarity]}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
