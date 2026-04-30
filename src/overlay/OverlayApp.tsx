import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { AchievementToast } from "../features/achievements/AchievementToast";
import type { AchievementUnlockEvent } from "../features/achievements/types";
import { useAchievementQueue } from "../features/achievements/useAchievementQueue";

export function OverlayApp() {
  const {
    currentAchievement,
    enqueueAchievement,
  } = useAchievementQueue();

  useEffect(() => {
    const unlistenPromise = listen<AchievementUnlockEvent>(
      "achievement-unlocked",
      (event) => {
        enqueueAchievement(event.payload);
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
        theme="xbox"
      />
    </main>
  );
}
