use axum::{http::StatusCode, response::{IntoResponse, Response}, Json};
use serde_json::json;

/// Wraps any sqlx error into a uniform 500 JSON response.
pub struct AppError(sqlx::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!("db error: {:?}", self.0);
        (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": "internal_error" }))).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError(err)
    }
}
