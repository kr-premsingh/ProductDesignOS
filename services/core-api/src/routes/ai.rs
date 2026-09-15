use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::{
    error::AppError,
    models::Design,
    routes::auth::CurrentUser,
    state::AppState,
};

const REMIX_CREDITS_COST: i32 = 1;
const VARIANTS_PER_JOB: usize = 3;

#[derive(FromRow)]
struct JobRow {
    id: String,
    status: String,
    result_design_ids: Vec<String>,
    #[allow(dead_code)]
    error: Option<String>,
}

#[derive(Serialize, FromRow)]
pub struct VariantCard {
    pub design_id: String,
    pub title: String,
    pub rationale: String,
    pub asset_url: String,
}

#[derive(Serialize)]
pub struct JobStatusResponse {
    pub job_id: String,
    pub status: String,
    pub variants: Vec<VariantCard>,
}

#[derive(Deserialize)]
pub struct CreateJobPayload {
    pub category_slug: String,
    pub prompt: String,
    pub source_design_id: Option<String>,
}

/// Enqueue a remix job. The stub provider completes synchronously (docs/07 keeps
/// the async job shape so hosted providers drop in without an API change).
pub async fn create_job(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Json(payload): Json<CreateJobPayload>,
) -> Result<(StatusCode, Json<JobStatusResponse>), AppError> {
    if payload.prompt.trim().is_empty() {
        return Err(AppError::BadRequest("prompt is required".to_string()));
    }

    debit_credits(&state, &current_user.id, REMIX_CREDITS_COST).await?;

    let category_id = sqlx::query_scalar::<_, String>("SELECT id FROM categories WHERE slug = $1")
        .bind(&payload.category_slug)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::BadRequest(format!("unknown category: {}", payload.category_slug)))?;

    let job_id = uuid::Uuid::new_v4().to_string();
    sqlx::query(
        "INSERT INTO ai_jobs (id, user_id, category_id, job_type, source_design_id, prompt, status, provider, credits_cost)
         VALUES ($1, $2, $3, 'remix', $4, $5, 'running', $6, $7)",
    )
    .bind(&job_id)
    .bind(&current_user.id)
    .bind(&category_id)
    .bind(&payload.source_design_id)
    .bind(&payload.prompt)
    .bind(state.ai_provider.name())
    .bind(REMIX_CREDITS_COST)
    .execute(&state.pool)
    .await?;

    let variants = match state.ai_provider.remix(&payload.prompt).await {
        Ok(variants) => variants,
        Err(err) => {
            sqlx::query("UPDATE ai_jobs SET status = 'failed', error = $2, completed_at = now() WHERE id = $1")
                .bind(&job_id)
                .bind(&err)
                .execute(&state.pool)
                .await?;
            refund_credits(&state, &current_user.id, REMIX_CREDITS_COST, &job_id).await?;
            return Err(AppError::BadRequest(format!("generation failed: {err}")));
        }
    };

    let mut result_ids = Vec::with_capacity(VARIANTS_PER_JOB);
    for variant in variants.into_iter().take(VARIANTS_PER_JOB) {
        let design_id = uuid::Uuid::new_v4().to_string();
        let asset_url = store_variant_svg(&state, &design_id, &variant.svg).await;
        sqlx::query(
            "INSERT INTO designs (id, owner_id, category_id, source_type, remix_of_design_id, title, asset_url, prompt, visibility, tags)
             VALUES ($1, $2, $3, 'ai_generated', $4, $5, $6, $7, 'private', ARRAY[]::TEXT[])",
        )
        .bind(&design_id)
        .bind(&current_user.id)
        .bind(&category_id)
        .bind(&payload.source_design_id)
        .bind(&variant.title)
        .bind(&asset_url)
        .bind(&payload.prompt)
        .execute(&state.pool)
        .await?;
        result_ids.push((design_id, variant.title, variant.rationale, asset_url));
    }

    let ids_only: Vec<String> = result_ids.iter().map(|(id, ..)| id.clone()).collect();
    sqlx::query("UPDATE ai_jobs SET status = 'complete', result_design_ids = $2, completed_at = now() WHERE id = $1")
        .bind(&job_id)
        .bind(&ids_only)
        .execute(&state.pool)
        .await?;

    let cards: Vec<VariantCard> = result_ids
        .into_iter()
        .map(|(design_id, title, rationale, asset_url)| VariantCard { design_id, title, rationale, asset_url })
        .collect();

    Ok((StatusCode::CREATED, Json(JobStatusResponse { job_id, status: "complete".to_string(), variants: cards })))
}

pub async fn get_job(
    State(state): State<AppState>,
    current_user: CurrentUser,
    Path(job_id): Path<String>,
) -> Result<Json<JobStatusResponse>, AppError> {
    let job = sqlx::query_as::<_, JobRow>(
        "SELECT id, status, result_design_ids, error FROM ai_jobs WHERE id = $1 AND user_id = $2",
    )
    .bind(&job_id)
    .bind(&current_user.id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or(AppError::NotFound)?;

    let mut variants = Vec::new();
    if job.status == "complete" && !job.result_design_ids.is_empty() {
        let designs = sqlx::query_as::<_, Design>(
            "SELECT id, owner_id, category_id, source_type, title, asset_url, prompt, visibility, tags, created_at
             FROM designs WHERE id = ANY($1)",
        )
        .bind(&job.result_design_ids)
        .fetch_all(&state.pool)
        .await?;
        variants = designs
            .into_iter()
            .map(|d| VariantCard {
                design_id: d.id,
                title: d.title.unwrap_or_else(|| "Variant".to_string()),
                rationale: String::new(),
                asset_url: d.asset_url,
            })
            .collect();
    }

    Ok(Json(JobStatusResponse { job_id: job.id, status: job.status, variants }))
}

async fn debit_credits(state: &AppState, user_id: &str, cost: i32) -> Result<(), AppError> {
    let balance: Option<i64> = sqlx::query_scalar(
        "SELECT balance_after FROM credit_ledger_entries WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1",
    )
    .bind(user_id)
    .fetch_optional(&state.pool)
    .await?
    .map(|b: i32| b as i64);

    let next = balance.unwrap_or(0) - cost as i64;
    if next < 0 {
        return Err(AppError::BadRequest("not enough credits".to_string()));
    }

    sqlx::query(
        "INSERT INTO credit_ledger_entries (id, user_id, delta, balance_after, reason) VALUES ($1, $2, $3, $4, 'ai_generation')",
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind(user_id)
    .bind(-cost)
    .bind(next as i32)
    .execute(&state.pool)
    .await?;
    Ok(())
}

async fn refund_credits(state: &AppState, user_id: &str, amount: i32, job_id: &str) -> Result<(), AppError> {
    let balance: i32 = sqlx::query_scalar(
        "SELECT balance_after FROM credit_ledger_entries WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1",
    )
    .bind(user_id)
    .fetch_optional(&state.pool)
    .await?
    .unwrap_or(0);

    sqlx::query(
        "INSERT INTO credit_ledger_entries (id, user_id, delta, balance_after, reason, ref_type, ref_id) VALUES ($1, $2, $3, $4, 'refund', 'ai_job', $5)",
    )
    .bind(uuid::Uuid::new_v4().to_string())
    .bind(user_id)
    .bind(amount)
    .bind(balance + amount)
    .bind(job_id)
    .execute(&state.pool)
    .await?;
    Ok(())
}

/// Placeholder object-storage step (docs/05): variants are served as data URIs
/// until S3-compatible storage is wired in.
async fn store_variant_svg(_state: &AppState, _design_id: &str, svg: &str) -> String {
    format!("data:image/svg+xml;utf8,{}", urlencoding(svg))
}

fn urlencoding(input: &str) -> String {
    input
        .chars()
        .map(|c| match c {
            'A'..='Z' | 'a'..='z' | '0'..='9' | '-' | '_' | '.' | '~' => c.to_string(),
            _ => format!("%{:02X}", c as u32),
        })
        .collect()
}
