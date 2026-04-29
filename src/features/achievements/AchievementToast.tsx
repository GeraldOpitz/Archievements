import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Gem, Crown, Star } from "lucide-react";
import type { AchievementRarity, AchievementUnlockEvent } from "./types";

interface Props {
  achievement: AchievementUnlockEvent | null;
}

const rarityConfig: Record<
  AchievementRarity,
  {
    label: string;
    border: string;
    bar: string;
    iconBg: string;
    text: string;
    Icon: typeof Trophy;
  }
> = {
  common: {
    label: "Común",
    border: "border-slate-400/50",
    bar: "bg-slate-400",
    iconBg: "bg-slate-400",
    text: "text-slate-300",
    Icon: Star,
  },
  rare: {
    label: "Raro",
    border: "border-sky-400/50",
    bar: "bg-sky-400",
    iconBg: "bg-sky-400",
    text: "text-sky-300",
    Icon: Sparkles,
  },
  epic: {
    label: "Épico",
    border: "border-purple-400/50",
    bar: "bg-purple-400",
    iconBg: "bg-purple-400",
    text: "text-purple-300",
    Icon: Gem,
  },
  legendary: {
    label: "Legendario",
    border: "border-yellow-400/50",
    bar: "bg-yellow-400",
    iconBg: "bg-yellow-400",
    text: "text-yellow-300",
    Icon: Crown,
  },
  platinum: {
    label: "Platino",
    border: "border-cyan-200/70",
    bar: "bg-cyan-200",
    iconBg: "bg-cyan-200",
    text: "text-cyan-100",
    Icon: Trophy,
  },
};

export function AchievementToast({ achievement }: Props) {
  const config = achievement ? rarityConfig[achievement.rarity] : null;
  const Icon = config?.Icon ?? Trophy;

  return (
    <AnimatePresence>
      {achievement && config && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.35 }}
          className={`
            fixed top-8 right-8 z-50
            w-[420px]
            rounded-3xl
            bg-slate-950/95
            border ${config.border}
            shadow-2xl
            overflow-hidden
          `}
        >
          <div className={`h-1 ${config.bar}`} />

          <div className="p-5 flex gap-4 items-center">
            <div
              className={`
                w-16 h-16
                rounded-2xl
                ${config.iconBg}
                text-black
                flex items-center justify-center
                shadow-lg
              `}
            >
              <Icon size={34} />
            </div>

            <div className="flex-1">
              <div
                className={`
                  flex items-center gap-2
                  ${config.text}
                  text-sm font-bold uppercase tracking-wide
                `}
              >
                <Sparkles size={16} />
                Logro desbloqueado
              </div>

              <h2 className="text-xl font-bold text-white">
                {achievement.achievementTitle}
              </h2>

              <p className="text-sm text-slate-400">
                {achievement.gameTitle}
              </p>

              <p className={`text-sm mt-1 ${config.text}`}>
                Rareza: {config.label}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
