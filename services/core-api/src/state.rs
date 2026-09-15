use sqlx::PgPool;

use crate::ai::AIProvider;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub jwt_secret: String,
    pub admin_emails: Vec<String>,
    pub ai_provider: Arc<dyn AIProvider>,
}
