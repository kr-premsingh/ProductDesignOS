use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct Health {
    status: &'static str,
    service: &'static str,
}

pub async fn health() -> Json<Health> {
    Json(Health { status: "ok", service: "core-api" })
}
