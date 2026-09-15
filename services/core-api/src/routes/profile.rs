use axum::{extract::{Path, State}, Json};
use serde::Serialize;
use sqlx::FromRow;

use crate::{error::AppError, state::AppState};

#[derive(Serialize, FromRow)]
pub struct PortfolioDesign {
    pub id: String,
    pub title: Option<String>,
    pub asset_url: String,
    pub source_type: String,
    pub tags: Vec<String>,
}

#[derive(Serialize, FromRow)]
pub struct PortfolioOffering {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub fulfillment_type: String,
    pub pricing_type: String,
    pub lead_time_days: Option<i32>,
}

#[derive(Serialize, FromRow)]
pub struct PortfolioProfile {
    pub id: String,
    pub username: String,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub provider_status: Option<String>,
    pub provider_categories: Vec<String>,
    pub provider_capabilities: Vec<String>,
    pub provider_portfolio: Vec<String>,
}

#[derive(Serialize)]
pub struct ProfileResponse {
    pub profile: PortfolioProfile,
    pub designs: Vec<PortfolioDesign>,
    pub offerings: Vec<PortfolioOffering>,
    pub follower_count: i64,
    pub following_count: i64,
}

pub async fn get_profile(
    State(state): State<AppState>,
    Path(username): Path<String>,
) -> Result<Json<ProfileResponse>, AppError> {
    let profile = sqlx::query_as::<_, PortfolioProfile>(
        "SELECT id, username, display_name, bio, avatar_url, provider_status,
                provider_categories, provider_capabilities, provider_portfolio
         FROM users WHERE username = $1",
    )
    .bind(&username)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let designs = sqlx::query_as::<_, PortfolioDesign>(
        "SELECT id, title, asset_url, source_type, tags
         FROM designs WHERE owner_id = $1 AND visibility = 'public' ORDER BY created_at DESC",
    )
    .bind(&profile.id)
    .fetch_all(&state.pool)
    .await?;

    let offerings = sqlx::query_as::<_, PortfolioOffering>(
        "SELECT id, title, description, fulfillment_type, pricing_type, lead_time_days
         FROM offerings WHERE owner_id = $1 AND status = 'active' ORDER BY created_at DESC",
    )
    .bind(&profile.id)
    .fetch_all(&state.pool)
    .await?;

    let follower_count = sqlx::query_scalar::<_, i64>("SELECT count(*) FROM follows WHERE followed_id = $1")
        .bind(&profile.id).fetch_one(&state.pool).await?;
    let following_count = sqlx::query_scalar::<_, i64>("SELECT count(*) FROM follows WHERE follower_id = $1")
        .bind(&profile.id).fetch_one(&state.pool).await?;

    Ok(Json(ProfileResponse { profile, designs, offerings, follower_count, following_count }))
}
