import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import type {
  AchievementRarity,
  AchievementUnlockEvent,
} from "./types";

const hotkeyByRarity: Record<AchievementRarity, string> = {
  common: "Ctrl+Alt+1",
  rare: "Ctrl+Alt+2",
  epic: "Ctrl+Alt+3",
  legendary: "Ctrl+Alt+4",
  platinum: "Ctrl+Alt+5",
};

const titleByRarity: Record<AchievementRarity, string> = {
  common: "Hotkey: logro común",
  rare: "Hotkey: logro raro",
  epic: "Hotkey: logro épico",
  legendary: "Hotkey: logro legendario",
  platinum: "Hotkey: platino desbloqueado",
};

export async function registerAchievementHotkeys(
  onUnlock: (achievement: AchievementUnlockEvent) => void
) {
  console.log("Registrando hotkeys...");

  await unregisterAll();

  await register(Object.values(hotkeyByRarity), (event) => {
    console.log("Hotkey event:", event);

    if (event.state !== "Pressed") return;

    const rarity = Object.entries(hotkeyByRarity).find(
      ([, shortcut]) => shortcut === event.shortcut
    )?.[0] as AchievementRarity | undefined;

    if (!rarity) return;

    onUnlock({
      id: crypto.randomUUID(),
      gameTitle: "Archivements Hotkeys",
      achievementTitle: titleByRarity[rarity],
      description: `Logro disparado con ${event.shortcut}`,
      rarity,
      unlockedAt: new Date().toISOString(),
    });
  });

  console.log("Hotkeys registradas:", Object.values(hotkeyByRarity));
}

export async function unregisterAchievementHotkeys() {
  await unregisterAll();
}

export const achievementHotkeys = hotkeyByRarity;
