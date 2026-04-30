import { useState } from "react";
import { createGame } from "./achievementHistory";

interface Props {
  onGameCreated: () => void;
}

export function GameForm({ onGameCreated }: Props) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) return;

    try {
      await createGame(title.trim(), platform.trim() || undefined);

      setTitle("");
      setPlatform("");
      onGameCreated();
    } catch (error) {
      console.error("Error creando juego:", error);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Agregar juego
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nombre del juego, ej: Pokémon Emerald"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <input
          value={platform}
          onChange={(event) => setPlatform(event.target.value)}
          placeholder="Plataforma, ej: GBA, PC, Steam, Xbox"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <button
          type="submit"
          className="
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
          Guardar juego
        </button>
      </form>
    </section>
  );
}
