use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tiny_http::{Header, Method, Response, Server};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiAchievementPayload {
    pub game_title: String,
    pub achievement_title: String,
    pub description: String,
    pub rarity: String,
}

fn is_valid_rarity(rarity: &str) -> bool {
    matches!(
        rarity,
        "common" | "rare" | "epic" | "legendary" | "platinum"
    )
}

fn json_response(body: &str, status_code: u16) -> Response<std::io::Cursor<Vec<u8>>> {
    Response::from_string(body)
        .with_status_code(status_code)
        .with_header(
            Header::from_bytes(
                &b"Content-Type"[..],
                &b"application/json"[..],
            )
            .unwrap(),
        )
}

pub fn start_local_api(app: AppHandle) {
    std::thread::spawn(move || {
        let server = Server::http("127.0.0.1:3030")
            .expect("No se pudo iniciar la API local en 127.0.0.1:3030");

        println!("Archivements local API running on http://127.0.0.1:3030");

        for mut request in server.incoming_requests() {
            let url = request.url().to_string();
            let method = request.method().clone();

            if method == Method::Post && url == "/unlock" {
                let mut body = String::new();

                if let Err(error) = request.as_reader().read_to_string(&mut body) {
                    let response = json_response(
                        &format!(
                            "{{\"ok\":false,\"error\":\"Error reading body: {}\"}}",
                            error
                        ),
                        400,
                    );

                    let _ = request.respond(response);
                    continue;
                }

                match serde_json::from_str::<ApiAchievementPayload>(&body) {
                    Ok(payload) => {
                        if !is_valid_rarity(&payload.rarity) {
                            let response = json_response(
                                "{\"ok\":false,\"error\":\"Invalid rarity. Valid values are: common, rare, epic, legendary, platinum\"}",
                                400,
                            );

                            let _ = request.respond(response);
                            continue;
                        }

                        let _ = app.emit("api-achievement-unlocked", payload);

                        let response = json_response("{\"ok\":true}", 200);

                        let _ = request.respond(response);
                    }
                    Err(error) => {
                        let response = json_response(
                            &format!(
                                "{{\"ok\":false,\"error\":\"{}\"}}",
                                error
                            ),
                            400,
                        );

                        let _ = request.respond(response);
                    }
                }
            } else {
                let response = json_response(
                    "{\"ok\":false,\"error\":\"Not found\"}",
                    404,
                );

                let _ = request.respond(response);
            }
        }
    });
}
