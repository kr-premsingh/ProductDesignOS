use axum::{extract::State, Json};
use serde::Deserialize;

use crate::{error::AppError, state::AppState};

#[derive(Deserialize)]
pub struct WaitlistPayload {
    pub email: String,
    pub name: Option<String>,
    pub role: Option<String>,
    pub mood: Option<String>,
}

pub async fn join_waitlist(
    State(state): State<AppState>,
    Json(payload): Json<WaitlistPayload>,
) -> Result<Json<serde_json::Value>, AppError> {
    if !payload.email.contains('@') {
        return Err(AppError::BadRequest("a valid email is required".to_string()));
    }
    sqlx::query("INSERT INTO waitlist (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING")
        .bind(payload.name.or(payload.role).or(payload.mood))
        .bind(payload.email)
        .execute(&state.pool)
        .await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}
