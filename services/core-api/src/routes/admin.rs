use axum::{extract::{Path, State}, Json};
use serde::Serialize;
use sqlx::FromRow;

use crate::{error::AppError, routes::auth::CurrentUser, state::AppState};

#[derive(Serialize, FromRow)]
pub struct ProviderReview {
    pub id: String,
    pub username: String,
    pub email: String,
    pub provider_status: Option<String>,
    pub provider_categories: Vec<String>,
    pub provider_capabilities: Vec<String>,
    pub provider_portfolio: Vec<String>,
}

pub async fn list_pending_providers(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Result<Json<Vec<ProviderReview>>, AppError> {
    require_admin(&current_user)?;
    let providers = sqlx::query_as::<_, ProviderReview>(
        "SELECT id, username, email, provider_status, provider_categories, provider_capabilities, provider_portfolio
         FROM users WHERE provider_status = 'pending' ORDER BY created_at ASC",
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(providers))
}

pub async fn approve_provider(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(user_id): Path<String>,
) -> Result<Json<ProviderReview>, AppError> {
    require_admin(&current_user)?;
    let provider = sqlx::query_as::<_, ProviderReview>(
        "UPDATE users SET provider_status = 'approved' WHERE id = $1 AND provider_status = 'pending'
         RETURNING id, username, email, provider_status, provider_categories, provider_capabilities, provider_portfolio",
    )
    .bind(&user_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;
    Ok(Json(provider))
}

fn require_admin(user: &CurrentUser) -> Result<(), AppError> {
    if user.roles.iter().any(|role| role == "admin") { Ok(()) } else { Err(AppError::Unauthorized) }
}
