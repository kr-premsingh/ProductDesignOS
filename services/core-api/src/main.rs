mod db;
mod error;
mod models;
mod routes;

use axum::{routing::get, Router};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = db::create_pool(&database_url).await;

    let app = Router::new()
        .route("/health", get(routes::health::health))
        .route("/categories", get(routes::catalog::list_categories))
        .route(
            "/designs",
            get(routes::catalog::list_designs).post(routes::catalog::create_design),
        )
        .with_state(pool)
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
