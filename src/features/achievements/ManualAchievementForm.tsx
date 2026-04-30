import { useState } from "react";
import type {
  AchievementRarity,
  AchievementUnlockEvent,
} from "./types";

interface Props {
  onUnlock: (achievement: AchievementUnlockEvent) => void;
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

export function ManualAchievementForm({ onUnlock }: Props) {
  const [gameTitle, setGameTitle] = useState("");
  const [achievementTitle, setAchievementTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<AchievementRarity>("common");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gameTitle.trim() || !achievementTitle.trim()) return;

    onUnlock({
      id: crypto.randomUUID(),
      gameTitle: gameTitle.trim(),
      achievementTitle: achievementTitle.trim(),
      description: description.trim(),
      rarity,
      unlockedAt: new Date().toISOString(),
    });

    setAchievementTitle("");
    setDescription("");
    setRarity("common");
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Desbloquear logro manual
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={gameTitle}
          onChange={(event) => setGameTitle(event.target.value)}
          placeholder="Juego, ej: Pokémon Emerald"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <input
          value={achievementTitle}
          onChange={(event) => setAchievementTitle(event.target.value)}
          placeholder="Logro, ej: Primera medalla"
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
          Desbloquear logro manual
        </button>
      </form>
    </section>
  );
}
