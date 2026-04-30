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
                    let response = Response::from_string(format!("Error reading body: {}", error))
                        .with_status_code(400);

                    let _ = request.respond(response);
                    continue;
                }

                match serde_json::from_str::<ApiAchievementPayload>(&body) {
                    Ok(payload) => {
                        let _ = app.emit("api-achievement-unlocked", payload);

                        let response = Response::from_string("{\"ok\":true}")
                            .with_header(
                                Header::from_bytes(
                                    &b"Content-Type"[..],
                                    &b"application/json"[..],
                                )
                                .unwrap(),
                            );

                        let _ = request.respond(response);
                    }
                    Err(error) => {
                        let response = Response::from_string(format!(
                            "{{\"ok\":false,\"error\":\"{}\"}}",
                            error
                        ))
                        .with_status_code(400)
                        .with_header(
                            Header::from_bytes(
                                &b"Content-Type"[..],
                                &b"application/json"[..],
                            )
                            .unwrap(),
                        );

                        let _ = request.respond(response);
                    }
                }
            } else {
                let response = Response::from_string("{\"ok\":false,\"error\":\"Not found\"}")
                    .with_status_code(404)
                    .with_header(
                        Header::from_bytes(
                            &b"Content-Type"[..],
                            &b"application/json"[..],
                        )
                        .unwrap(),
                    );

                let _ = request.respond(response);
            }
        }
    });
}
