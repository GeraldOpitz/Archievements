import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface FileChangedPayload {
  path: string;
  kind: string;
}

interface Props {
  onFileChanged?: (payload: FileChangedPayload) => void;
}

export function FileWatcherPanel({ onFileChanged }: Props) {
  const [folderPath, setFolderPath] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [events, setEvents] = useState<FileChangedPayload[]>([]);
  const [message, setMessage] = useState("");

  async function startWatcher() {
    if (!folderPath.trim()) return;

    try {
      await invoke("start_file_watcher", {
        folderPath: folderPath.trim(),
      });

      setIsWatching(true);
      setMessage(`Vigilando carpeta: ${folderPath}`);
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${String(error)}`);
    }
  }

  async function stopWatcher() {
    try {
      await invoke("stop_file_watcher");
      setIsWatching(false);
      setMessage("Watcher detenido.");
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${String(error)}`);
    }
  }

  useEffect(() => {
    const unlistenPromise = listen<FileChangedPayload>(
      "file-watcher:changed",
      (event) => {
        setEvents((prev) => [event.payload, ...prev].slice(0, 20));
        onFileChanged?.(event.payload);
      }
    );

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [onFileChanged]);

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Detector local de archivos
      </h2>

      <div className="space-y-4">
        <input
          value={folderPath}
          onChange={(event) => setFolderPath(event.target.value)}
          placeholder="Ruta de carpeta a vigilar, ej: C:\Users\Gerald\Saved Games\Hades"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startWatcher}
            disabled={isWatching}
            className="
              px-6 py-4
              rounded-2xl
              bg-emerald-500
              text-black
              font-bold
              hover:bg-emerald-400
              transition
              disabled:opacity-50
            "
          >
            Iniciar watcher
          </button>

          <button
            onClick={stopWatcher}
            disabled={!isWatching}
            className="
              px-6 py-4
              rounded-2xl
              bg-red-500
              text-black
              font-bold
              hover:bg-red-400
              transition
              disabled:opacity-50
            "
          >
            Detener watcher
          </button>
        </div>

        {message && (
          <p className="text-sm text-slate-300">
            {message}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="font-bold mb-3">
          Cambios detectados
        </h3>

        {events.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no se detectan cambios.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-auto">
            {events.map((event, index) => (
              <article
                key={`${event.path}-${index}`}
                className="
                  rounded-xl
                  bg-slate-800
                  border border-slate-700
                  p-3
                "
              >
                <p className="text-sm font-bold break-all">
                  {event.path}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Tipo: {event.kind}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
