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
