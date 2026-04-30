mod local_api;
mod steam_api;
mod file_watcher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .manage(file_watcher::WatcherState::default())
    .invoke_handler(tauri::generate_handler![
        steam_api::import_steam_game_schema,
        file_watcher::start_file_watcher,
        file_watcher::stop_file_watcher,
        file_watcher::read_text_file,
        file_watcher::scan_folder_snapshot
    ])
    .setup(|app| {
        local_api::start_local_api(app.handle().clone());
        Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
