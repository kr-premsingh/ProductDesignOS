use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, sqlx::FromRow)]
pub struct Category {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub accent_color: Option<String>,
    pub allowed_fulfillment_types: Vec<String>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Design {
    pub id: String,
    pub owner_id: Option<String>,
    pub category_id: Option<String>,
    pub source_type: String,
    pub title: Option<String>,
    pub asset_url: String,
    pub prompt: Option<String>,
    pub visibility: String,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct CreateDesignPayload {
    pub category_slug: Option<String>,
    pub title: Option<String>,
    pub asset_url: String,
    pub prompt: Option<String>,
    pub visibility: Option<String>,
    pub tags: Option<Vec<String>>,
    pub owner_id: Option<String>,
}
