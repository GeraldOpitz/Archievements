import { useCallback, useEffect, useRef, useState } from "react";
import { AchievementToast } from "../features/achievements/AchievementToast";
import type { AchievementUnlockEvent } from "../features/achievements/types";
import type { AchievementTheme } from "../features/achievements/themes";
import { useAchievementQueue } from "../features/achievements/useAchievementQueue";

interface StoredOverlayEvent {
  achievement: AchievementUnlockEvent;
  theme: AchievementTheme;
}

export function OverlayApp() {
  const [theme, setTheme] = useState<AchievementTheme>("xbox");

  const { currentAchievement, enqueueAchievement } = useAchievementQueue();

  const lastProcessedIdRef = useRef<string | null>(null);

  const loadLastAchievement = useCallback(() => {
    const raw = localStorage.getItem("archivements:last-unlock");

    if (!raw) return;

    const payload = JSON.parse(raw) as StoredOverlayEvent;

    if (payload.achievement.id === lastProcessedIdRef.current) return;

    lastProcessedIdRef.current = payload.achievement.id;

    setTheme(payload.theme);
    enqueueAchievement(payload.achievement);
  }, [enqueueAchievement]);

  useEffect(() => {
    loadLastAchievement();

    const interval = window.setInterval(() => {
      loadLastAchievement();
    }, 300);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadLastAchievement]);

  return (
    <main className="min-h-screen bg-transparent">
      <AchievementToast
        achievement={currentAchievement}
        theme={theme}
      />
    </main>
  );
}
