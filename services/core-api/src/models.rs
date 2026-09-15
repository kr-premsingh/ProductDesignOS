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
}

#[derive(Deserialize)]
pub struct SignupPayload {
    pub username: String,
    pub email: String,
    pub password: String,
    /// Optional role selected by the member at signup ("user", "creator", or "provider").
    /// Admin is only granted from the server-side ADMIN_EMAILS allowlist.
    pub role: Option<String>,
}

#[derive(Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct PublicUser {
    pub id: String,
    pub username: String,
    pub email: String,
    pub roles: Vec<String>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: PublicUser,
}
