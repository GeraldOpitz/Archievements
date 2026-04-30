import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface FileSnapshotEntry {
  path: string;
  relativePath: string;
  size: number;
  modifiedAt: number;
}

interface SnapshotChange {
  kind: "created" | "modified" | "deleted";
  file: FileSnapshotEntry;
}

function compareSnapshots(
  before: FileSnapshotEntry[],
  after: FileSnapshotEntry[]
): SnapshotChange[] {
  const beforeMap = new Map(
    before.map((file) => [file.relativePath, file])
  );

  const afterMap = new Map(
    after.map((file) => [file.relativePath, file])
  );

  const changes: SnapshotChange[] = [];

  for (const file of after) {
    const previous = beforeMap.get(file.relativePath);

    if (!previous) {
      changes.push({
        kind: "created",
        file,
      });

      continue;
    }

    if (
      previous.size !== file.size ||
      previous.modifiedAt !== file.modifiedAt
    ) {
      changes.push({
        kind: "modified",
        file,
      });
    }
  }

  for (const file of before) {
    if (!afterMap.has(file.relativePath)) {
      changes.push({
        kind: "deleted",
        file,
      });
    }
  }

  return changes;
}

const changeLabels: Record<SnapshotChange["kind"], string> = {
  created: "Creado",
  modified: "Modificado",
  deleted: "Eliminado",
};

export function FolderSnapshotPanel() {
  const [folderPath, setFolderPath] = useState("");
  const [baseline, setBaseline] = useState<FileSnapshotEntry[]>([]);
  const [changes, setChanges] = useState<SnapshotChange[]>([]);
  const [message, setMessage] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");

  async function takeBaseline() {
    if (!folderPath.trim()) return;

    try {
      const snapshot = await invoke<FileSnapshotEntry[]>(
        "scan_folder_snapshot",
        {
          folderPath: folderPath.trim(),
        }
      );

      setBaseline(snapshot);
      setChanges([]);
      setMessage(`Snapshot inicial tomado: ${snapshot.length} archivos.`);
    } catch (error) {
      console.error(error);
      setMessage(`Error tomando snapshot: ${String(error)}`);
    }
  }

  async function compareNow() {
    if (!folderPath.trim()) return;

    if (baseline.length === 0) {
      setMessage("Primero debes tomar un snapshot inicial.");
      return;
    }

    try {
      const currentSnapshot = await invoke<FileSnapshotEntry[]>(
        "scan_folder_snapshot",
        {
          folderPath: folderPath.trim(),
        }
      );

      const detectedChanges = compareSnapshots(baseline, currentSnapshot);

      setChanges(detectedChanges);
      setMessage(`Comparación lista: ${detectedChanges.length} cambios detectados.`);
    } catch (error) {
      console.error(error);
      setMessage(`Error comparando snapshot: ${String(error)}`);
    }
  }

    async function previewFile(path: string) {
    try {
        setSelectedFilePath(path);
        setPreviewMessage("Leyendo archivo...");
        setFilePreview("");

        const content = await invoke<string>("read_text_file", {
        filePath: path,
        });

        setFilePreview(content.slice(0, 8000));

        if (content.length > 8000) {
        setPreviewMessage(
            "Archivo leído parcialmente. Se muestran los primeros 8000 caracteres."
        );
        } else {
        setPreviewMessage("Archivo leído correctamente.");
        }
    } catch (error) {
        console.error(error);
        setPreviewMessage(`No se pudo leer como texto: ${String(error)}`);
        setFilePreview("");
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-slate-900/60 p-5">
      <h2 className="text-xl font-bold mb-4">
        Análisis guiado de carpeta
      </h2>

      <p className="text-sm text-slate-400 mb-4">
        Toma un snapshot antes de jugar, luego compara después de conseguir un objetivo.
      </p>

      <div className="space-y-4">
        <input
          value={folderPath}
          onChange={(event) => setFolderPath(event.target.value)}
          placeholder="Ruta de carpeta, ej: C:\\Users\\Gerald\\Saved Games\\Hades"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-yellow-400"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={takeBaseline}
            className="
              px-6 py-4
              rounded-2xl
              bg-sky-500
              text-black
              font-bold
              hover:bg-sky-400
              transition
            "
          >
            Tomar snapshot inicial
          </button>

          <button
            onClick={compareNow}
            className="
              px-6 py-4
              rounded-2xl
              bg-purple-500
              text-black
              font-bold
              hover:bg-purple-400
              transition
            "
          >
            Comparar ahora
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
          Archivos modificados
        </h3>

        {changes.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no hay cambios detectados.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-auto">
            {changes.map((change, index) => (
              <article
                key={`${change.file.relativePath}-${index}`}
                className="
                  rounded-xl
                  bg-slate-800
                  border border-slate-700
                  p-3
                "
              >
                <div className="flex justify-between gap-4">
                  <p className="text-sm font-bold break-all">
                    {change.file.relativePath}
                  </p>

                  <span className="text-xs font-bold text-yellow-300">
                    {changeLabels[change.kind]}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 break-all">
                  {change.file.path}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Tamaño: {change.file.size} bytes
                </p>

                {change.kind !== "deleted" && (
                    <button
                        onClick={() => previewFile(change.file.path)}
                        className="
                        mt-3
                        px-4 py-2
                        rounded-xl
                        bg-sky-500
                        text-black
                        font-bold
                        text-sm
                        hover:bg-sky-400
                        transition
                        "
                    >
                        Ver contenido
                    </button>
                    )}
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedFilePath && (
        <div className="mt-6 rounded-2xl bg-slate-950 border border-slate-700 p-4">
            <h3 className="font-bold mb-2">
            Vista previa del archivo
            </h3>

            <p className="text-xs text-slate-400 break-all mb-3">
            {selectedFilePath}
            </p>

            {previewMessage && (
            <p className="text-sm text-slate-300 mb-3">
                {previewMessage}
            </p>
            )}

            {filePreview ? (
            <pre
                className="
                max-h-96
                overflow-auto
                whitespace-pre-wrap
                break-words
                rounded-xl
                bg-black
                p-4
                text-xs
                text-slate-200
                "
            >
                {filePreview}
            </pre>
            ) : (
            <p className="text-sm text-slate-500">
                No hay contenido para mostrar.
            </p>
            )}
        </div>
        )}
    </section>
  );
}
