import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  importSteamGameToDatabase,
  type SteamGameImport,
} from "./achievementHistory";

interface Props {
  onImported: () => void;
}

export function SteamImportForm({ onImported }: Props) {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("archivements:steam-api-key") ?? ""
  );

  const [appId, setAppId] = useState("1145360");
  const [language, setLanguage] = useState("spanish");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!apiKey.trim() || !appId.trim()) return;

    setIsImporting(true);
    setMessage("");

    try {
      localStorage.setItem("archivements:steam-api-key", apiKey.trim());

      const result = await invoke<SteamGameImport>(
        "import_steam_game_schema",
        {
          apiKey: apiKey.trim(),
          appId: Number(appId),
          language,
        }
      );

      const saved = await importSteamGameToDatabase(result);

      setMessage(
        `Importado: ${result.gameTitle} (${saved.importedAchievements} logros)`
      );

      onImported();
    } catch (error) {
      console.error(error);
      setMessage(`Error importando desde Steam: ${String(error)}`);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Importar logros desde Steam
      </h2>

      <form onSubmit={handleImport} className="space-y-4">
        <input
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="Steam Web API Key"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <input
          value={appId}
          onChange={(event) => setAppId(event.target.value)}
          placeholder="Steam AppID, ej: 1145360 para Hades"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        >
          <option value="spanish">Español</option>
          <option value="english">Inglés</option>
        </select>

        <button
          type="submit"
          disabled={isImporting}
          className="
            w-full
            px-6 py-4
            rounded-2xl
            bg-sky-500
            text-black
            font-bold
            hover:bg-sky-400
            transition
            disabled:opacity-50
          "
        >
          {isImporting ? "Importando..." : "Importar desde Steam"}
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-slate-300">
          {message}
        </p>
      )}
    </section>
  );
}
