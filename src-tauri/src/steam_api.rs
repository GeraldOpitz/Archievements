use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamAchievementDto {
    pub external_id: String,
    pub title: String,
    pub description: String,
    pub icon_url: Option<String>,
    pub icon_gray_url: Option<String>,
    pub global_percentage: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SteamGameSchemaDto {
    pub app_id: u32,
    pub game_title: String,
    pub achievements: Vec<SteamAchievementDto>,
}

#[derive(Debug, Deserialize)]
struct SteamSchemaResponse {
    game: SteamGame,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SteamGame {
    #[serde(rename = "gameName")]
    game_name: Option<String>,
    #[serde(rename = "availableGameStats")]
    available_game_stats: Option<SteamAvailableStats>,
}

#[derive(Debug, Deserialize)]
struct SteamAvailableStats {
    achievements: Option<Vec<SteamAchievementSchema>>,
}

#[derive(Debug, Deserialize)]
struct SteamAchievementSchema {
    name: String,
    #[serde(rename = "displayName")]
    display_name: Option<String>,
    description: Option<String>,
    icon: Option<String>,
    icongray: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SteamPercentagesResponse {
    achievementpercentages: SteamAchievementPercentages,
}

#[derive(Debug, Deserialize)]
struct SteamAchievementPercentages {
    achievements: Vec<SteamAchievementPercentage>,
}

#[derive(Debug, Deserialize)]
struct SteamAchievementPercentage {
    name: String,
    percent: f64,
}

#[tauri::command]
pub async fn import_steam_game_schema(
    api_key: String,
    app_id: u32,
    language: String,
) -> Result<SteamGameSchemaDto, String> {
    let client = reqwest::Client::new();

    let schema_response = client
        .get("https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/")
        .query(&[
            ("key", api_key.as_str()),
            ("appid", &app_id.to_string()),
            ("l", language.as_str()),
        ])
        .send()
        .await
        .map_err(|error| format!("Error consultando Steam schema: {}", error))?;

    if !schema_response.status().is_success() {
        return Err(format!(
            "Steam schema respondió con estado HTTP {}",
            schema_response.status()
        ));
    }

    let schema: SteamSchemaResponse = schema_response
        .json()
        .await
        .map_err(|error| format!("Error parseando Steam schema: {}", error))?;

    let percentages_response = client
        .get("https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/")
        .query(&[("gameid", &app_id.to_string())])
        .send()
        .await
        .map_err(|error| format!("Error consultando porcentajes globales: {}", error))?;

    let mut percentages_by_name: HashMap<String, f64> = HashMap::new();

    if percentages_response.status().is_success() {
        if let Ok(percentages) = percentages_response.json::<SteamPercentagesResponse>().await {
            for achievement in percentages.achievementpercentages.achievements {
                percentages_by_name.insert(achievement.name, achievement.percent);
            }
        }
    }

    let game_title = schema
        .game
        .game_name
        .unwrap_or_else(|| format!("Steam App {}", app_id));

    let achievements = schema
        .game
        .available_game_stats
        .and_then(|stats| stats.achievements)
        .unwrap_or_default()
        .into_iter()
        .map(|achievement| {
            let global_percentage = percentages_by_name.get(&achievement.name).copied();

            SteamAchievementDto {
                external_id: achievement.name,
                title: achievement
                    .display_name
                    .unwrap_or_else(|| "Hidden achievement".to_string()),
                description: achievement.description.unwrap_or_default(),
                icon_url: achievement.icon,
                icon_gray_url: achievement.icongray,
                global_percentage,
            }
        })
        .collect();

    Ok(SteamGameSchemaDto {
        app_id,
        game_title,
        achievements,
    })
}
