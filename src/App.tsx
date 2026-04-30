import { Trophy } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { AchievementToast } from "./features/achievements/AchievementToast";
import { AchievementSimulator } from "./features/achievements/AchievementSimulator";
import type { AchievementUnlockEvent } from "./features/achievements/types";
import type { AchievementTheme } from "./features/achievements/themes";
import { themeLabels } from "./features/achievements/themes";
import { useAchievementQueue } from "./features/achievements/useAchievementQueue";
import type { OverlayPosition } from "./features/achievements/overlayPosition";
import { overlayPositionLabels } from "./features/achievements/overlayPosition";
import { useGlobalAchievementHotkeys } from "./features/achievements/useGlobalAchievementHotkeys";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { AchievementRarity } from "./features/achievements/types";
import {
  saveAchievementUnlock,
  getRecentAchievementUnlocks,
} from "./features/achievements/achievementHistory";
import { AchievementHistory } from "./features/achievements/AchievementHistoryView";
import { ManualAchievementForm } from "./features/achievements/ManualAchievementForm";
import { GameProgress } from "./features/achievements/GameProgress";
import { GameForm } from "./features/achievements/GameForm";
import { GameLibrary } from "./features/achievements/GameLibrary";
import { AchievementDefinitionForm } from "./features/achievements/AchievementDefinitionForm";
import { AchievementDefinitionList } from "./features/achievements/AchievementDefinitionList";

export default function App() {
  const [theme, setTheme] = useState<AchievementTheme>("xbox");
  const [position, setPosition] = useState<OverlayPosition>("top-right");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  const {
    currentAchievement,
    queueLength,
    enqueueAchievement,
  } = useAchievementQueue();

  useEffect(() => {
  const unlistenPromise = listen<{
    gameTitle: string;
    achievementTitle: string;
    description: string;
    rarity: AchievementRarity;
        }>("api-achievement-unlocked", (event) => {
      handleAchievementUnlocked(
        {
          id: crypto.randomUUID(),
          gameTitle: event.payload.gameTitle,
          achievementTitle: event.payload.achievementTitle,
          description: event.payload.description,
          rarity: event.payload.rarity,
          unlockedAt: new Date().toISOString(),
        },
        "api"
      );
  });

  return () => {
    unlistenPromise.then((unlisten) => unlisten());
  };
}, [theme, position]);

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

  async function handleAchievementUnlocked(achievement: AchievementUnlockEvent, source: string) {
    enqueueAchievement(achievement);

    try {
      await saveAchievementUnlock(achievement, source);

      console.log("Logro guardado en SQLite:", achievement);

      const recentUnlocks = await getRecentAchievementUnlocks(10);

      console.table(recentUnlocks);

      setHistoryRefreshKey((prev) => prev + 1);

    } catch (error) {
      console.error("Error guardando logro:", error);
    }

    localStorage.setItem(
      "archivements:last-unlock",
      JSON.stringify({
        achievement,
        theme,
        position,
      })
    );

    await openOverlayWindow();
  }

    useGlobalAchievementHotkeys({
      onAchievement: (achievement) =>
        handleAchievementUnlocked(achievement, "hotkey"),
    });

  return (
    <main className="min-h-screen bg-slate-900 flex items-start justify-center p-8">
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
          onSimulate={(achievement) =>
            handleAchievementUnlocked(achievement, "simulator")
          }
          queueLength={queueLength}
        />
        <GameForm
          onGameCreated={() => setLibraryRefreshKey((prev) => prev + 1)}
        />

        <GameLibrary refreshKey={libraryRefreshKey} />

        <AchievementDefinitionForm
          refreshKey={libraryRefreshKey}
          onAchievementCreated={() =>
            setLibraryRefreshKey((prev) => prev + 1)
          }
        />

        <AchievementDefinitionList
          refreshKey={libraryRefreshKey + historyRefreshKey}
          onUnlockAchievement={(data) =>
            handleAchievementUnlocked(
              {
                id: crypto.randomUUID(),
                gameTitle: data.gameTitle,
                achievementTitle: data.achievementTitle,
                description: data.description,
                rarity: data.rarity,
                unlockedAt: new Date().toISOString(),
              },
              "library"
            )
          }
        />

        <ManualAchievementForm
          onUnlock={(achievement) =>
            handleAchievementUnlocked(achievement, "manual")
          }
        />

        <GameProgress refreshKey={historyRefreshKey} />
        <AchievementHistory refreshKey={historyRefreshKey} />
      </div>
    </main>
  );
}
