import { Trophy } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { AchievementToast } from "./features/achievements/AchievementToast";
import { AchievementSimulator } from "./features/achievements/AchievementSimulator";
import type { AchievementUnlockEvent } from "./features/achievements/types";
import type { AchievementTheme } from "./features/achievements/themes";
import { themeLabels } from "./features/achievements/themes";
import { useAchievementQueue } from "./features/achievements/useAchievementQueue";
import { useEffect, useState } from "react";
import {
  achievementHotkeys,
  registerAchievementHotkeys,
  unregisterAchievementHotkeys,
} from "./features/achievements/hotkeys";
import type { OverlayPosition } from "./features/achievements/overlayPosition";
import { overlayPositionLabels } from "./features/achievements/overlayPosition";

export default function App() {
  const [theme, setTheme] = useState<AchievementTheme>("xbox");
  const [hotkeysEnabled, setHotkeysEnabled] = useState(false);
  const [position, setPosition] = useState<OverlayPosition>("top-right");

  const {
    currentAchievement,
    queueLength,
    enqueueAchievement,
  } = useAchievementQueue();

  async function openOverlayWindow() {
    const existingOverlay = await WebviewWindow.getByLabel("overlay");

    if (existingOverlay) {
      await existingOverlay.show();
      return existingOverlay;
    }

    const overlay = new WebviewWindow("overlay", {
      url: "index.html?view=overlay",
      title: "Archivements Overlay",
      width: 520,
      height: 180,
      decorations: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
    });

    return overlay;
  }

  async function handleAchievementSimulated(achievement: AchievementUnlockEvent) {
    enqueueAchievement(achievement);

    localStorage.setItem(
      "archivements:last-unlock",
      JSON.stringify({
        achievement,
        theme,
        position
      })
    );

    await openOverlayWindow();
  }

  async function handleHotkeysToggle() {
    if (hotkeysEnabled) {
      await unregisterAchievementHotkeys();
      setHotkeysEnabled(false);
      return;
    }

    await registerAchievementHotkeys(handleAchievementSimulated);
    setHotkeysEnabled(true);
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center">
      <AchievementToast achievement={currentAchievement} theme={theme} position={position} />

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

        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">
            Tema de notificación
          </p>

          <div className="grid grid-cols-4 gap-3">
            {Object.entries(themeLabels).map(([themeKey, label]) => (
              <button
                key={themeKey}
                onClick={() => setTheme(themeKey as AchievementTheme)}
                className={`
                  px-4 py-3
                  rounded-xl
                  font-bold
                  transition
                  ${
                    theme === themeKey
                      ? "bg-yellow-500 text-black"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openOverlayWindow}
          className="
            mb-6
            w-full
            px-6 py-4
            rounded-2xl
            bg-emerald-500
            text-black
            font-bold
            hover:bg-emerald-400
            transition
          "
        >
          Abrir overlay manualmente
        </button>

        <div className="mb-6 rounded-2xl bg-slate-900/60 p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold">
                Hotkeys globales
              </h2>

              <p className="text-sm text-slate-400">
                Dispara logros aunque la app no esté enfocada.
              </p>
            </div>

            <button
              onClick={handleHotkeysToggle}
              className={`
                px-5 py-3
                rounded-xl
                font-bold
                transition
                ${
                  hotkeysEnabled
                    ? "bg-red-500 text-white hover:bg-red-400"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }
              `}
            >
              {hotkeysEnabled ? "Desactivar" : "Activar"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm text-slate-300">
            {Object.entries(achievementHotkeys).map(([rarity, shortcut]) => (
              <div
                key={rarity}
                className="flex justify-between rounded-xl bg-slate-800 px-4 py-2"
              >
                <span>{rarity}</span>
                <code>{shortcut}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-3">
            Posición del overlay
          </p>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(overlayPositionLabels).map(([positionKey, label]) => (
              <button
                key={positionKey}
                onClick={() => setPosition(positionKey as OverlayPosition)}
                className={`
                  px-4 py-3
                  rounded-xl
                  font-bold
                  transition
                  ${
                    position === positionKey
                      ? "bg-emerald-500 text-black"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <AchievementSimulator
          onSimulate={handleAchievementSimulated}
          queueLength={queueLength}
        />
      </div>
    </main>
  );
}
