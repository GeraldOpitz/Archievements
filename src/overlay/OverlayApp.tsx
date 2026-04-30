import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { AchievementToast } from "../features/achievements/AchievementToast";
import type { AchievementUnlockEvent } from "../features/achievements/types";
import type { AchievementTheme } from "../features/achievements/themes";
import { useAchievementQueue } from "../features/achievements/useAchievementQueue";

interface OverlayAchievementEvent {
  achievement: AchievementUnlockEvent;
  theme: AchievementTheme;
}

export function OverlayApp() {
  const [theme, setTheme] = useState<AchievementTheme>("xbox");

  const {
    currentAchievement,
    enqueueAchievement,
  } = useAchievementQueue();

  useEffect(() => {
    const unlistenPromise = listen<OverlayAchievementEvent>(
      "achievement-unlocked",
      (event) => {
        setTheme(event.payload.theme);
        enqueueAchievement(event.payload.achievement);
      }
    );

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [enqueueAchievement]);

  return (
    <main className="min-h-screen bg-transparent">
      <AchievementToast
        achievement={currentAchievement}
        theme={theme}
      />
    </main>
  );
}
