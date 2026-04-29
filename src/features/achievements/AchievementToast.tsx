import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Gem, Crown, Star } from "lucide-react";
import type { AchievementRarity, AchievementUnlockEvent } from "./types";
import type { AchievementTheme } from "./themes";
import { themeStyles } from "./themes";

interface Props {
  achievement: AchievementUnlockEvent | null;
  theme: AchievementTheme;
}

const rarityConfig: Record<
  AchievementRarity,
  {
    label: string;
    Icon: typeof Trophy;
  }
> = {
  common: {
    label: "Común",
    Icon: Star,
  },
  rare: {
    label: "Raro",
    Icon: Sparkles,
  },
  epic: {
    label: "Épico",
    Icon: Gem,
  },
  legendary: {
    label: "Legendario",
    Icon: Crown,
  },
  platinum: {
    label: "Platino",
    Icon: Trophy,
  },
};

export function AchievementToast({ achievement, theme }: Props) {
  const config = achievement ? rarityConfig[achievement.rarity] : null;
  const themeConfig = themeStyles[theme];

  const Icon = config?.Icon ?? Trophy;
  const accent = achievement
    ? themeConfig.accentByRarity[achievement.rarity]
    : "bg-yellow-400";

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
            border
            shadow-2xl
            overflow-hidden
            ${themeConfig.container}
          `}
        >
          <div className={`h-1 ${accent}`} />

          <div className="p-5 flex gap-4 items-center">
            <div
              className={`
                w-16 h-16
                rounded-2xl
                ${accent}
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
                  ${themeConfig.subtitle}
                  text-sm font-bold uppercase tracking-wide
                `}
              >
                <Sparkles size={16} />
                Logro desbloqueado
              </div>

              <h2 className={`text-xl font-bold ${themeConfig.title}`}>
                {achievement.achievementTitle}
              </h2>

              <p className="text-sm text-slate-400">
                {achievement.gameTitle}
              </p>

              <p className={`text-sm mt-1 ${themeConfig.subtitle}`}>
                Rareza: {config.label}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
