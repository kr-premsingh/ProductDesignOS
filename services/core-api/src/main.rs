mod ai;
mod db;
mod error;
mod models;
mod routes;
mod state;

use axum::{
    routing::{get, post},
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use ai::StubProvider;
use state::AppState;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret".to_string());
    let pool = db::create_pool(&database_url).await;
    let state = AppState { pool, jwt_secret, ai_provider: Arc::new(StubProvider) };

    let app = Router::new()
        .route("/health", get(routes::health::health))
        .route("/auth/signup", post(routes::auth::signup))
        .route("/auth/login", post(routes::auth::login))
        .route("/auth/me", get(routes::auth::me))
        .route("/categories", get(routes::catalog::list_categories))
        .route(
            "/designs",
            get(routes::catalog::list_designs).post(routes::catalog::create_design),
        )
        .route("/ai/jobs", post(routes::ai::create_job))
        .route("/ai/jobs/:id", get(routes::ai::get_job))
        .route("/providers/onboard", post(routes::commerce::onboard_provider))
        .route("/offerings", get(routes::commerce::list_offerings).post(routes::commerce::create_offering))
        .route("/offerings/:id/orders", post(routes::commerce::create_order))
        .route("/orders", get(routes::commerce::list_my_orders))
        .route("/orders/:id", axum::routing::patch(routes::commerce::update_order))
        .route("/designs/:id/like", post(routes::social::toggle_like))
        .route("/designs/:id/save", post(routes::social::toggle_save))
        .route("/designs/:id/visibility", axum::routing::patch(routes::social::set_design_visibility))
        .route("/users/:username/follow", post(routes::social::toggle_follow))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(4100);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    tracing::info!("core-api listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
