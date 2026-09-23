use axum::{
    extract::{Path, State},
    Json,
};
use serde::Serialize;

use crate::{
    error::AppError,
    models::Design,
    routes::auth::CurrentUser,
    state::AppState,
};

#[derive(Serialize)]
pub struct OkResponse {
    ok: bool,
    active: bool,
}

/// Toggle a like on a design. Idempotent per (user, design, type).
pub async fn toggle_like(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(design_id): Path<String>,
) -> Result<Json<OkResponse>, AppError> {
    toggle_interaction(&state, &current_user.id, &design_id, "like").await
}

/// Toggle a save on a design. Idempotent per (user, design, type).
pub async fn toggle_save(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(design_id): Path<String>,
) -> Result<Json<OkResponse>, AppError> {
    toggle_interaction(&state, &current_user.id, &design_id, "save").await
}

async fn toggle_interaction(
    state: &AppState,
    user_id: &str,
    design_id: &str,
    kind: &str,
) -> Result<Json<OkResponse>, AppError> {
    let existing: Option<i32> = sqlx::query_scalar(
        "SELECT id FROM design_interactions WHERE user_id = $1 AND design_id = $2 AND type = $3",
    )
    .bind(user_id)
    .bind(design_id)
    .bind(kind)
    .fetch_optional(&state.pool)
    .await?;

    let active = existing.is_none();
    if let Some(id) = existing {
        sqlx::query("DELETE FROM design_interactions WHERE id = $1")
            .bind(id)
            .execute(&state.pool)
            .await?;
    } else {
        sqlx::query("INSERT INTO design_interactions (user_id, design_id, type) VALUES ($1, $2, $3)")
            .bind(user_id)
            .bind(design_id)
            .bind(kind)
            .execute(&state.pool)
            .await?;

        // Saves land on the caller's default board so the portfolio (docs/03) has content.
        if kind == "save" {
            let board_id: String = sqlx::query_scalar(
                "INSERT INTO boards (id, owner_id, name, visibility)
                 VALUES ($1, $2, 'Saved', 'private')
                 ON CONFLICT DO NOTHING
                 RETURNING id",
            )
            .bind(format!("board_saved_{user_id}"))
            .bind(user_id)
            .fetch_optional(&state.pool)
            .await?
            .unwrap_or_else(|| format!("board_saved_{user_id}"));

            sqlx::query(
                "INSERT INTO board_items (board_id, design_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            )
            .bind(&board_id)
            .bind(design_id)
            .execute(&state.pool)
            .await?;
        }
    }

    Ok(Json(OkResponse { ok: true, active }))
}

/// List the designs the caller has saved, newest first.
pub async fn list_my_saved(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Result<Json<Vec<Design>>, AppError> {
    let designs = sqlx::query_as::<_, Design>(
        "SELECT d.id, d.owner_id, d.category_id, d.source_type, d.title, d.asset_url, d.prompt, d.visibility, d.tags, d.created_at
         FROM design_interactions di
         JOIN designs d ON d.id = di.design_id
         WHERE di.user_id = $1 AND di.type = 'save'
         ORDER BY di.id DESC",
    )
    .bind(&current_user.id)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(designs))
}

/// Toggle following another user.
pub async fn toggle_follow(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(username): Path<String>,
) -> Result<Json<OkResponse>, AppError> {
    let followed_id: Option<String> =
        sqlx::query_scalar("SELECT id FROM users WHERE username = $1")
            .bind(&username)
            .fetch_optional(&state.pool)
            .await?;
    let followed_id = followed_id.ok_or(AppError::NotFound)?;

    if followed_id == current_user.id {
        return Err(AppError::BadRequest("cannot follow yourself".to_string()));
    }

    let existing: Option<(String, String)> = sqlx::query_as(
        "SELECT follower_id, followed_id FROM follows WHERE follower_id = $1 AND followed_id = $2",
    )
    .bind(&current_user.id)
    .bind(&followed_id)
    .fetch_optional(&state.pool)
    .await?;

    let active = existing.is_none();
    if existing.is_some() {
        sqlx::query("DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2")
            .bind(&current_user.id)
            .bind(&followed_id)
            .execute(&state.pool)
            .await?;
    } else {
        sqlx::query("INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)")
            .bind(&current_user.id)
            .bind(&followed_id)
            .execute(&state.pool)
            .await?;
    }

    Ok(Json(OkResponse { ok: true, active }))
}

/// Publish a design the caller owns (make it visible on the public feed),
/// or set it back to private with visibility='private'.
pub async fn set_design_visibility(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(design_id): Path<String>,
    Json(payload): Json<VisibilityPayload>,
) -> Result<Json<Design>, AppError> {
    if payload.visibility != "public" && payload.visibility != "private" && payload.visibility != "followers" {
        return Err(AppError::BadRequest("visibility must be public | followers | private".to_string()));
    }

    let design = sqlx::query_as::<_, Design>(
        "UPDATE designs SET visibility = $3
         WHERE id = $1 AND owner_id = $2
         RETURNING id, owner_id, category_id, source_type, title, asset_url, prompt, visibility, tags, created_at",
    )
    .bind(&design_id)
    .bind(&current_user.id)
    .bind(&payload.visibility)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    // Publishing also boards the design on the owner's public 'Portfolio' board (docs/03).
    if payload.visibility == "public" {
        let board_id: String = sqlx::query_scalar(
            "INSERT INTO boards (id, owner_id, name, visibility)
             VALUES ($1, $2, 'Portfolio', 'public')
             ON CONFLICT DO NOTHING
             RETURNING id",
        )
        .bind(format!("board_portfolio_{}", current_user.id))
        .bind(&current_user.id)
        .fetch_optional(&state.pool)
        .await?
        .unwrap_or_else(|| format!("board_portfolio_{}", current_user.id));

        sqlx::query(
            "INSERT INTO board_items (board_id, design_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        )
        .bind(&board_id)
        .bind(&design_id)
        .execute(&state.pool)
        .await?;
    }

    Ok(Json(design))
}

#[derive(serde::Deserialize)]
pub struct VisibilityPayload {
    pub visibility: String,
}
