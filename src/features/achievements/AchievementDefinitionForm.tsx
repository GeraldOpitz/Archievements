import { useEffect, useState } from "react";
import type { AchievementRarity } from "./types";
import {
  createAchievement,
  getGames,
  type GameRecord,
} from "./achievementHistory";

interface Props {
  refreshKey: number;
  onAchievementCreated: () => void;
}

const rarityOptions: AchievementRarity[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "platinum",
];

const rarityLabels: Record<AchievementRarity, string> = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  platinum: "Platino",
};

export function AchievementDefinitionForm({
  refreshKey,
  onAchievementCreated,
}: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [gameId, setGameId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<AchievementRarity>("common");

  async function loadGames() {
    const savedGames = await getGames();
    setGames(savedGames);

    if (!gameId && savedGames.length > 0) {
      setGameId(savedGames[0].id);
    }
  }

  useEffect(() => {
    loadGames();
  }, [refreshKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gameId || !title.trim()) return;

    try {
      await createAchievement(
        gameId,
        title.trim(),
        description.trim(),
        rarity
      );

      setTitle("");
      setDescription("");
      setRarity("common");

      onAchievementCreated();
    } catch (error) {
      console.error("Error creando logro:", error);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Agregar logro a juego
      </h2>

      {games.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Primero agrega un juego a la biblioteca.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
                {game.platform ? ` (${game.platform})` : ""}
              </option>
            ))}
          </select>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nombre del logro"
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descripción opcional"
            className="w-full min-h-24 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          />

          <select
            value={rarity}
            onChange={(event) =>
              setRarity(event.target.value as AchievementRarity)
            }
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
          >
            {rarityOptions.map((option) => (
              <option key={option} value={option}>
                {rarityLabels[option]}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="
              w-full
              px-6 py-4
              rounded-2xl
              bg-yellow-500
              text-black
              font-bold
              hover:bg-yellow-400
              transition
            "
          >
            Guardar logro
          </button>
        </form>
      )}
    </section>
  );
}
