import { useEffect, useState } from "react";
import {
  getGames,
  type GameRecord,
} from "./achievementHistory";

interface Props {
  refreshKey: number;
}

export function GameLibrary({ refreshKey }: Props) {
  const [games, setGames] = useState<GameRecord[]>([]);

  async function loadGames() {
    const savedGames = await getGames();
    setGames(savedGames);
  }

  useEffect(() => {
    loadGames();
  }, [refreshKey]);

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Biblioteca de juegos
      </h2>

      {games.length === 0 ? (
        <p className="text-slate-400 text-sm">
          Aún no hay juegos guardados.
        </p>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <article
              key={game.id}
              className="
                rounded-xl
                bg-slate-800
                p-4
                border border-slate-700
              "
            >
              <p className="font-bold">
                {game.title}
              </p>

              <p className="text-sm text-slate-400">
                Plataforma: {game.platform ?? "Sin plataforma"}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Agregado: {new Date(game.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
