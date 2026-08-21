use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;

use crate::{
    error::AppError,
    models::{Category, CreateDesignPayload, Design},
    routes::auth::CurrentUser,
    state::AppState,
};

pub async fn list_categories(State(state): State<AppState>) -> Result<Json<Vec<Category>>, AppError> {
    let categories = sqlx::query_as::<_, Category>(
        "SELECT id, slug, name, accent_color, allowed_fulfillment_types FROM categories ORDER BY name",
    )
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(categories))
}

#[derive(Deserialize)]
pub struct ListDesignsQuery {
    pub category: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn list_designs(
    State(state): State<AppState>,
    Query(q): Query<ListDesignsQuery>,
) -> Result<Json<Vec<Design>>, AppError> {
    let limit = q.limit.unwrap_or(24).min(100);
    let offset = q.offset.unwrap_or(0);

    let designs = if let Some(slug) = q.category {
        sqlx::query_as::<_, Design>(
            "SELECT d.id, d.owner_id, d.category_id, d.source_type, d.title, d.asset_url, d.prompt, d.visibility, d.tags, d.created_at
             FROM designs d JOIN categories c ON c.id = d.category_id
             WHERE c.slug = $1 AND d.visibility = 'public'
             ORDER BY d.created_at DESC LIMIT $2 OFFSET $3",
        )
        .bind(slug)
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?
    } else {
        sqlx::query_as::<_, Design>(
            "SELECT id, owner_id, category_id, source_type, title, asset_url, prompt, visibility, tags, created_at
             FROM designs WHERE visibility = 'public' ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.pool)
        .await?
    };

    Ok(Json(designs))
}

pub async fn create_design(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateDesignPayload>,
) -> Result<Json<Design>, AppError> {
    let id = uuid::Uuid::new_v4().to_string();

    let category_id: Option<String> = if let Some(slug) = &payload.category_slug {
        sqlx::query_scalar::<_, String>("SELECT id FROM categories WHERE slug = $1")
            .bind(slug)
            .fetch_optional(&state.pool)
            .await?
    } else {
        None
    };

    let tags = payload.tags.unwrap_or_default();
    let visibility = payload.visibility.unwrap_or_else(|| "public".to_string());

    let design = sqlx::query_as::<_, Design>(
        "INSERT INTO designs (id, owner_id, category_id, source_type, title, asset_url, prompt, visibility, tags)
         VALUES ($1, $2, $3, 'upload', $4, $5, $6, $7, $8)
         RETURNING id, owner_id, category_id, source_type, title, asset_url, prompt, visibility, tags, created_at",
    )
    .bind(&id)
    .bind(&current_user.id)
    .bind(&category_id)
    .bind(&payload.title)
    .bind(&payload.asset_url)
    .bind(&payload.prompt)
    .bind(&visibility)
    .bind(&tags)
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(design))
}
