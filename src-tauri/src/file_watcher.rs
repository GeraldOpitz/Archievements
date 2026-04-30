use notify::{
    Config,
    Event,
    RecommendedWatcher,
    RecursiveMode,
    Watcher,
};
use serde::Serialize;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, State};
use std::time::UNIX_EPOCH;
use walkdir::WalkDir;

#[derive(Default)]
pub struct WatcherState {
    pub watcher: Arc<Mutex<Option<RecommendedWatcher>>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChangedPayload {
    pub path: String,
    pub kind: String,
}

#[tauri::command]
pub fn start_file_watcher(
    app: AppHandle,
    state: State<WatcherState>,
    folder_path: String,
) -> Result<(), String> {
    let path = PathBuf::from(folder_path.clone());

    if !path.exists() {
        return Err(format!("La carpeta no existe: {}", folder_path));
    }

    let app_handle = app.clone();

    let mut watcher = RecommendedWatcher::new(
        move |result: Result<Event, notify::Error>| {
            match result {
                Ok(event) => {
                    for path in event.paths {
                        let payload = FileChangedPayload {
                            path: path.to_string_lossy().to_string(),
                            kind: format!("{:?}", event.kind),
                        };

                        let _ = app_handle.emit("file-watcher:changed", payload);
                    }
                }
                Err(error) => {
                    let _ = app_handle.emit(
                        "file-watcher:error",
                        format!("Watcher error: {}", error),
                    );
                }
            }
        },
        Config::default(),
    )
    .map_err(|error| format!("No se pudo crear watcher: {}", error))?;

    watcher
        .watch(&path, RecursiveMode::Recursive)
        .map_err(|error| format!("No se pudo vigilar carpeta: {}", error))?;

    let mut guard = state
        .watcher
        .lock()
        .map_err(|_| "No se pudo bloquear WatcherState".to_string())?;

    *guard = Some(watcher);

    Ok(())
}

#[tauri::command]
pub fn stop_file_watcher(state: State<WatcherState>) -> Result<(), String> {
    let mut guard = state
        .watcher
        .lock()
        .map_err(|_| "No se pudo bloquear WatcherState".to_string())?;

    *guard = None;

    Ok(())
}

#[tauri::command]
pub fn read_text_file(file_path: String) -> Result<String, String> {
    let metadata = std::fs::metadata(&file_path)
        .map_err(|error| format!("No se pudo leer metadata: {}", error))?;

    if metadata.len() > 5 * 1024 * 1024 {
        return Err("Archivo demasiado grande para leer como texto.".to_string());
    }

    std::fs::read_to_string(&file_path)
        .map_err(|error| format!("No se pudo leer archivo como texto: {}", error))
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileSnapshotEntry {
    pub path: String,
    pub relative_path: String,
    pub size: u64,
    pub modified_at: u64,
}

#[tauri::command]
pub fn scan_folder_snapshot(folder_path: String) -> Result<Vec<FileSnapshotEntry>, String> {
    let root = PathBuf::from(folder_path.clone());

    if !root.exists() {
        return Err(format!("La carpeta no existe: {}", folder_path));
    }

    if !root.is_dir() {
        return Err(format!("La ruta no es una carpeta: {}", folder_path));
    }

    let mut entries = Vec::new();

    for entry in WalkDir::new(&root)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
    {
        let path = entry.path().to_path_buf();

        let metadata = match std::fs::metadata(&path) {
            Ok(metadata) => metadata,
            Err(_) => continue,
        };

        let modified_at = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs())
            .unwrap_or(0);

        let relative_path = path
            .strip_prefix(&root)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string();

        entries.push(FileSnapshotEntry {
            path: path.to_string_lossy().to_string(),
            relative_path,
            size: metadata.len(),
            modified_at,
        });
    }

    Ok(entries)
}
