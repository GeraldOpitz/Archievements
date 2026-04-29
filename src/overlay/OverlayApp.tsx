import { AchievementToast } from "../features/achievements/AchievementToast";
import type { AchievementUnlockEvent } from "../features/achievements/types";

const demoAchievement: AchievementUnlockEvent = {
  id: crypto.randomUUID(),
  gameTitle: "Archivements Overlay",
  achievementTitle: "Overlay Window Ready",
  description: "La ventana overlay está funcionando.",
  rarity: "legendary",
  unlockedAt: new Date().toISOString(),
};

export function OverlayApp() {
  return (
    <main className="min-h-screen bg-transparent">
      <AchievementToast
        achievement={demoAchievement}
        theme="xbox"
      />
    </main>
  );
}
