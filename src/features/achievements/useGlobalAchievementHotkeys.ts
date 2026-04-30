import { useEffect } from "react";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import type { AchievementUnlockEvent } from "./types";

interface Options {
  onAchievement: (achievement: AchievementUnlockEvent) => void;
}

export function useGlobalAchievementHotkeys({ onAchievement }: Options) {
  useEffect(() => {
    const shortcut = "CommandOrControl+Shift+L";

    async function setup() {
      await register(shortcut, (event) => {
        if (event.state !== "Pressed") return;

        onAchievement({
          id: crypto.randomUUID(),
          gameTitle: "Archivements Hotkey",
          achievementTitle: "Logro disparado por hotkey",
          description: "Este logro fue generado con un atajo global.",
          rarity: "legendary",
          unlockedAt: new Date().toISOString(),
        });
      });
    }

    setup();

    return () => {
      unregister(shortcut);
    };
  }, [onAchievement]);
}
