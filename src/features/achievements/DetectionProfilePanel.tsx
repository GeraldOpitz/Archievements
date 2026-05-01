import { useEffect, useState } from "react";
import {
  getAchievementsByGame,
  getGames,
  type AchievementRecord,
  type GameRecord,
} from "./achievementHistory";
import {
  deleteDetectionProfile,
  getDetectionProfiles,
  saveDetectionProfile,
  type DetectionProfile,
  type DetectionProfileDraft,
  type DetectionMatchType,
} from "./detectionProfiles";

interface Props {
  refreshKey: number;
  onProfilesChanged: () => void;
  draft?: DetectionProfileDraft | null;
}

export function DetectionProfilePanel({
  refreshKey,
  onProfilesChanged,
  draft,
}: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [profiles, setProfiles] = useState<DetectionProfile[]>([]);

  const [gameId, setGameId] = useState("");
  const [achievementId, setAchievementId] = useState("");
  const [fileNameIncludes, setFileNameIncludes] = useState("");
  const [pattern, setPattern] = useState("");
  const [matchType, setMatchType] = useState<DetectionMatchType>("contains");

  async function loadGames() {
    const savedGames = await getGames();
    setGames(savedGames);

    if (!gameId && savedGames.length > 0) {
      setGameId(savedGames[0].id);
    }
  }

  async function loadAchievements(selectedGameId: string) {
    if (!selectedGameId) return;

    const savedAchievements = await getAchievementsByGame(selectedGameId);
    setAchievements(savedAchievements);

    if (savedAchievements.length > 0) {
      setAchievementId(savedAchievements[0].id);
    }
  }

  function loadProfiles() {
    setProfiles(getDetectionProfiles());
  }

  useEffect(() => {
    loadGames();
    loadProfiles();
  }, [refreshKey]);

  useEffect(() => {
    loadAchievements(gameId);
  }, [gameId, refreshKey]);

useEffect(() => {
  if (!draft) return;

  setFileNameIncludes(draft.fileNameIncludes);
  setPattern(draft.pattern);
  setMatchType(draft.matchType ?? "contains");
}, [draft]);

  function handleSave() {
    const game = games.find((item) => item.id === gameId);
    const achievement = achievements.find((item) => item.id === achievementId);

    if (!game || !achievement) return;
    if (!fileNameIncludes.trim() || !pattern.trim()) return;

    saveDetectionProfile({
      id: crypto.randomUUID(),
      gameTitle: game.title,
      achievementTitle: achievement.title,
      description: achievement.description ?? "",
      rarity: achievement.rarity,
      fileNameIncludes: fileNameIncludes.trim(),
      pattern: pattern.trim(),
      matchType,
      createdAt: new Date().toISOString(),
    });

    setFileNameIncludes("");
    setPattern("");
    setMatchType("contains");

    loadProfiles();
    onProfilesChanged();
  }

  function handleDelete(id: string) {
    deleteDetectionProfile(id);
    loadProfiles();
    onProfilesChanged();
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Perfiles de detección
      </h2>

      {games.length === 0 ? (
        <p className="text-sm text-slate-400">
          Primero importa o crea un juego.
        </p>
      ) : (
        <div className="space-y-4">
          <select
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>

          <select
            value={achievementId}
            onChange={(event) => setAchievementId(event.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            {achievements.map((achievement) => (
              <option key={achievement.id} value={achievement.id}>
                {achievement.title}
              </option>
            ))}
          </select>

          <input
            value={fileNameIncludes}
            onChange={(event) => setFileNameIncludes(event.target.value)}
            placeholder="Archivo contiene, ej: log.txt, Profile, save"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          />

          <select
            value={matchType}
            onChange={(event) =>
              setMatchType(event.target.value as DetectionMatchType)
            }
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            <option value="contains">Texto exacto</option>
            <option value="regex">Regex</option>
          </select>

          <input
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            placeholder="Texto a buscar dentro del archivo"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          />

          <button
            onClick={handleSave}
            className="
              w-full
              px-6 py-4
              rounded-2xl
              bg-purple-500
              text-black
              font-bold
              hover:bg-purple-400
              transition
            "
          >
            Guardar perfil de detección
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {profiles.map((profile) => (
          <article
            key={profile.id}
            className="rounded-xl bg-slate-800 border border-slate-700 p-4"
          >
            <p className="font-bold">
              {profile.gameTitle} — {profile.achievementTitle}
            </p>

            <p className="text-sm text-slate-400 mt-1">
              Archivo contiene: <strong>{profile.fileNameIncludes}</strong>
            </p>

            <p className="text-sm text-slate-400">
              Patrón: <strong>{profile.pattern}</strong>
            </p>

            <p className="text-sm text-slate-400">
              Tipo: <strong>{profile.matchType ?? "contains"}</strong>
            </p>

            <button
              onClick={() => handleDelete(profile.id)}
              className="
                mt-3
                px-4 py-2
                rounded-xl
                bg-red-500
                text-black
                font-bold
                text-sm
                hover:bg-red-400
                transition
              "
            >
              Eliminar
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
