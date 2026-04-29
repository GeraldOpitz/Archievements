import { useEffect, useState } from "react";
import type { AchievementUnlockEvent } from "./types";

export function useAchievementQueue(displayDuration = 4000) {
  const [currentAchievement, setCurrentAchievement] =
    useState<AchievementUnlockEvent | null>(null);

  const [queue, setQueue] = useState<AchievementUnlockEvent[]>([]);

  function enqueueAchievement(achievement: AchievementUnlockEvent) {
    setQueue((prev) => [...prev, achievement]);
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
    }, displayDuration);

    return () => clearTimeout(timeout);
  }, [currentAchievement, displayDuration]);

  return {
    currentAchievement,
    queue,
    queueLength: queue.length,
    enqueueAchievement,
  };
}
