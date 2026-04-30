import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Gem, Crown, Star } from "lucide-react";
import type { AchievementRarity, AchievementUnlockEvent } from "./types";
import type { AchievementTheme } from "./themes";
import { themeStyles } from "./themes";
import type { OverlayPosition } from "./overlayPosition";
import { overlayPositionClasses } from "./overlayPosition";
import { achievementAnimations } from "./animations";

interface Props {
  achievement: AchievementUnlockEvent | null;
  theme: AchievementTheme;
  position?: OverlayPosition;
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

export function AchievementToast({ achievement, theme, position = "top-right" }: Props) {
  const config = achievement ? rarityConfig[achievement.rarity] : null;
  const themeConfig = themeStyles[theme];

  const Icon = config?.Icon ?? Trophy;
  const accent = achievement
    ? themeConfig.accentByRarity[achievement.rarity]
    : "bg-yellow-400";

  const animation = achievement
  ? achievementAnimations[achievement.rarity]
  : achievementAnimations.common;

  return (
    <AnimatePresence>
      {achievement && config && (
        <motion.div
          initial={animation.initial}
          animate={animation.animate}
          exit={animation.exit}
          transition={animation.transition}
          className={`
            fixed ${overlayPositionClasses[position]} z-50
            w-[420px]
            rounded-3xl
            border
            shadow-2xl
            overflow-hidden
            ${themeConfig.container}
            ${animation.extraClass ?? ""}
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
