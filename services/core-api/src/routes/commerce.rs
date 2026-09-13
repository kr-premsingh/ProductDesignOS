use axum::{extract::{Path, Query, State}, Json};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::{error::AppError, routes::auth::CurrentUser, state::AppState};

#[derive(Serialize, FromRow)]
pub struct Offering {
    pub id: String,
    pub owner_id: String,
    pub category_id: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub fulfillment_type: String,
    pub pricing_type: String,
    pub price_credits: Option<i32>,
    pub lead_time_days: Option<i32>,
    pub status: String,
}

#[derive(Deserialize)]
pub struct CreateOfferingPayload {
    pub category_slug: Option<String>,
    pub title: String,
    pub description: Option<String>,
    pub fulfillment_type: String,
    pub pricing_type: String,
    pub price_credits: Option<i32>,
    pub lead_time_days: Option<i32>,
}

#[derive(Deserialize)]
pub struct ProviderOnboardingPayload {
    pub categories: Vec<String>,
    pub capabilities: Vec<String>,
    pub portfolio: Vec<String>,
}

#[derive(Serialize, FromRow)]
pub struct Order {
    pub id: String,
    pub buyer_id: String,
    pub offering_id: String,
    pub provider_id: String,
    pub brief: String,
    pub status: String,
    pub quoted_credits: Option<i32>,
    pub platform_fee_bps: i32,
}

#[derive(Deserialize)]
pub struct CreateOrderPayload {
    pub brief: String,
}

#[derive(Deserialize)]
pub struct UpdateOrderPayload {
    pub status: String,
    pub quoted_credits: Option<i32>,
}

pub async fn list_offerings(
    State(state): State<AppState>,
    Query(query): Query<ListOfferingsQuery>,
) -> Result<Json<Vec<Offering>>, AppError> {
    let offerings = sqlx::query_as::<_, Offering>(
        "SELECT o.id, o.owner_id, o.category_id, o.title, o.description, o.fulfillment_type,
                o.pricing_type, o.price_credits, o.lead_time_days, o.status
         FROM offerings o
         LEFT JOIN categories c ON c.id = o.category_id
         WHERE o.status = 'active' AND ($1::text IS NULL OR c.slug = $1)
         ORDER BY o.created_at DESC LIMIT 100",
    )
    .bind(query.category)
    .fetch_all(&state.pool)
    .await?;
    Ok(Json(offerings))
}

pub async fn onboard_provider(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<ProviderOnboardingPayload>,
) -> Result<Json<serde_json::Value>, AppError> {
    if payload.categories.is_empty() || payload.capabilities.is_empty() || payload.portfolio.len() < 3 {
        return Err(AppError::BadRequest("categories, capabilities, and 3 portfolio links are required".to_string()));
    }
    sqlx::query(
        "UPDATE users SET provider_categories=$2, provider_capabilities=$3, provider_portfolio=$4, provider_status='pending' WHERE id=$1",
    )
    .bind(&current_user.id).bind(&payload.categories).bind(&payload.capabilities).bind(&payload.portfolio)
    .execute(&state.pool).await?;
    sqlx::query("INSERT INTO user_roles (user_id, role) VALUES ($1, 'provider') ON CONFLICT DO NOTHING")
        .bind(&current_user.id).execute(&state.pool).await?;
    Ok(Json(serde_json::json!({ "ok": true, "status": "pending" })))
}

#[derive(Deserialize)]
pub struct ListOfferingsQuery {
    pub category: Option<String>,
}

pub async fn create_offering(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateOfferingPayload>,
) -> Result<Json<Offering>, AppError> {
    require_provider(&state, &current_user).await?;
    if payload.title.trim().is_empty() {
        return Err(AppError::BadRequest("title is required".to_string()));
    }
    if !["digital", "physical", "service"].contains(&payload.fulfillment_type.as_str()) {
        return Err(AppError::BadRequest("invalid fulfillment_type".to_string()));
    }

    let category_id = if let Some(slug) = payload.category_slug {
        sqlx::query_scalar::<_, String>("SELECT id FROM categories WHERE slug = $1")
            .bind(slug).fetch_optional(&state.pool).await?
    } else { None };
    let offering = sqlx::query_as::<_, Offering>(
        "INSERT INTO offerings (id, owner_id, category_id, title, description, fulfillment_type, pricing_type, price_credits, lead_time_days)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id, owner_id, category_id, title, description, fulfillment_type, pricing_type, price_credits, lead_time_days, status",
    )
    .bind(uuid::Uuid::new_v4().to_string()).bind(&current_user.id).bind(category_id)
    .bind(payload.title).bind(payload.description).bind(payload.fulfillment_type)
    .bind(payload.pricing_type).bind(payload.price_credits).bind(payload.lead_time_days)
    .fetch_one(&state.pool).await?;
    Ok(Json(offering))
}

pub async fn create_order(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(offering_id): Path<String>,
    Json(payload): Json<CreateOrderPayload>,
) -> Result<Json<Order>, AppError> {
    if payload.brief.trim().is_empty() { return Err(AppError::BadRequest("brief is required".to_string())); }
    let provider_id: String = sqlx::query_scalar("SELECT owner_id FROM offerings WHERE id = $1 AND status = 'active'")
        .bind(&offering_id).fetch_optional(&state.pool).await?.ok_or(AppError::NotFound)?;
    if provider_id == current_user.id { return Err(AppError::BadRequest("provider cannot order their own offering".to_string())); }
    let order = sqlx::query_as::<_, Order>(
        "INSERT INTO orders (id, buyer_id, offering_id, provider_id, brief)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, buyer_id, offering_id, provider_id, brief, status, quoted_credits, platform_fee_bps",
    )
    .bind(uuid::Uuid::new_v4().to_string()).bind(&current_user.id).bind(&offering_id).bind(provider_id).bind(payload.brief)
    .fetch_one(&state.pool).await?;
    Ok(Json(order))
}

pub async fn list_my_orders(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Result<Json<Vec<Order>>, AppError> {
    let orders = sqlx::query_as::<_, Order>(
        "SELECT id, buyer_id, offering_id, provider_id, brief, status, quoted_credits, platform_fee_bps
         FROM orders WHERE buyer_id = $1 OR provider_id = $1 ORDER BY created_at DESC",
    ).bind(&current_user.id).fetch_all(&state.pool).await?;
    Ok(Json(orders))
}

pub async fn update_order(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(order_id): Path<String>,
    Json(payload): Json<UpdateOrderPayload>,
) -> Result<Json<Order>, AppError> {
    let allowed = ["requested", "quoted", "accepted", "in_progress", "delivered", "completed", "cancelled"];
    if !allowed.contains(&payload.status.as_str()) { return Err(AppError::BadRequest("invalid order status".to_string())); }
    let order = sqlx::query_as::<_, Order>(
        "UPDATE orders SET status=$3, quoted_credits=COALESCE($4, quoted_credits), updated_at=now()
         WHERE id=$1 AND (provider_id=$2 OR buyer_id=$2)
         RETURNING id, buyer_id, offering_id, provider_id, brief, status, quoted_credits, platform_fee_bps",
    ).bind(&order_id).bind(&current_user.id).bind(payload.status).bind(payload.quoted_credits)
    .fetch_optional(&state.pool).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}

async fn require_provider(state: &AppState, user: &CurrentUser) -> Result<(), AppError> {
    if user.roles.iter().any(|r| r == "provider" || r == "admin") {
        return Ok(());
    }
    let status: Option<String> = sqlx::query_scalar("SELECT provider_status FROM users WHERE id = $1")
        .bind(&user.id).fetch_optional(&state.pool).await?;
    if status.as_deref() == Some("pending") || status.as_deref() == Some("approved") {
        Ok(())
    } else {
        Err(AppError::Unauthorized)
    }
}
