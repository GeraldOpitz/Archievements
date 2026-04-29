import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { AchievementToast } from "./features/achievements/AchievementToast";
import { AchievementSimulator } from "./features/achievements/AchievementSimulator";
import type { AchievementUnlockEvent } from "./features/achievements/types";

export default function App() {
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
    }, 4000);

    return () => clearTimeout(timeout);
  }, [currentAchievement]);

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AchievementToast achievement={currentAchievement} />

      <div className="w-[760px] p-10 rounded-3xl bg-slate-800 shadow-2xl">
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

        <AchievementSimulator
          onSimulate={enqueueAchievement}
          queueLength={queue.length}
        />
      </div>
    </main>
  );
}
