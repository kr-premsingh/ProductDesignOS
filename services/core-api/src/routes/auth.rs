use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::request::Parts,
    Json,
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::{
    error::AppError,
    models::{AuthResponse, LoginPayload, PublicUser, SignupPayload},
    state::AppState,
};

const ALLOWED_ADDITIONAL_ROLES: [&str; 2] = ["creator", "provider"];

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    username: String,
    roles: Vec<String>,
    exp: usize,
}

/// The authenticated caller, extracted from a valid `Authorization: Bearer <jwt>` header.
pub struct CurrentUser {
    pub id: String,
    pub username: String,
    pub roles: Vec<String>,
}

#[async_trait]
impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .ok_or(AppError::Unauthorized)?;
        let token = header.strip_prefix("Bearer ").ok_or(AppError::Unauthorized)?;
        let claims = decode::<Claims>(
            token,
            &DecodingKey::from_secret(state.jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| AppError::Unauthorized)?
        .claims;
        Ok(CurrentUser { id: claims.sub, username: claims.username, roles: claims.roles })
    }
}

fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    Ok(Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string())
}

fn verify_password(password: &str, hash: &str) -> Result<(), AppError> {
    let parsed = PasswordHash::new(hash).map_err(|_| AppError::Unauthorized)?;
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .map_err(|_| AppError::Unauthorized)
}

fn issue_token(jwt_secret: &str, id: &str, username: &str, roles: &[String]) -> Result<String, AppError> {
    let exp = (chrono::Utc::now() + chrono::Duration::days(7)).timestamp() as usize;
    let claims = Claims { sub: id.to_string(), username: username.to_string(), roles: roles.to_vec(), exp };
    Ok(encode(&Header::default(), &claims, &EncodingKey::from_secret(jwt_secret.as_bytes()))?)
}

async fn fetch_roles(pool: &PgPool, user_id: &str) -> Result<Vec<String>, AppError> {
    let roles = sqlx::query_scalar::<_, String>("SELECT role FROM user_roles WHERE user_id = $1")
        .bind(user_id)
        .fetch_all(pool)
        .await?;
    Ok(roles)
}

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    if let Some(role) = &payload.role {
        if !ALLOWED_ADDITIONAL_ROLES.contains(&role.as_str()) {
            return Err(AppError::BadRequest(format!("unsupported role: {role}")));
        }
    }

    let existing = sqlx::query_scalar::<_, i64>("SELECT count(*) FROM users WHERE username = $1 OR email = $2")
        .bind(&payload.username)
        .bind(&payload.email)
        .fetch_one(&state.pool)
        .await?;
    if existing > 0 {
        return Err(AppError::Conflict("username or email already taken".to_string()));
    }

    let id = uuid::Uuid::new_v4().to_string();
    let password_hash = hash_password(&payload.password)?;

    sqlx::query(
        "INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)",
    )
    .bind(&id)
    .bind(&payload.username)
    .bind(&payload.email)
    .bind(&password_hash)
    .execute(&state.pool)
    .await?;

    let mut roles = vec!["explorer".to_string()];
    if let Some(role) = &payload.role {
        roles.push(role.clone());
    }
    for role in &roles {
        sqlx::query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(&id)
            .bind(role)
            .execute(&state.pool)
            .await?;
    }

    let token = issue_token(&state.jwt_secret, &id, &payload.username, &roles)?;
    Ok(Json(AuthResponse {
        token,
        user: PublicUser { id, username: payload.username, email: payload.email, roles },
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> Result<Json<AuthResponse>, AppError> {
    let row = sqlx::query_as::<_, (String, String, String, Option<String>)>(
        "SELECT id, username, email, password_hash FROM users WHERE username = $1",
    )
    .bind(&payload.username)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::Unauthorized)?;

    let (id, username, email, password_hash) = row;
    let password_hash = password_hash.ok_or(AppError::Unauthorized)?;
    verify_password(&payload.password, &password_hash)?;

    let roles = fetch_roles(&state.pool, &id).await?;
    let token = issue_token(&state.jwt_secret, &id, &username, &roles)?;
    Ok(Json(AuthResponse { token, user: PublicUser { id, username, email, roles } }))
}

pub async fn me(current_user: CurrentUser) -> Json<PublicUser> {
    Json(PublicUser {
        id: current_user.id,
        username: current_user.username.clone(),
        email: String::new(),
        roles: current_user.roles,
    })
}
