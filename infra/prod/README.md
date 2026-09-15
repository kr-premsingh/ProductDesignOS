# Home Server Deployment

This production profile serves two sites behind Caddy on a Linux home server. Caddy terminates HTTPS automatically through Let's Encrypt and routes:

- `https://$COMPANY_DOMAIN/` (`productdesignos.com`) to the ProductDesignOS company site
- `https://$PRODUCT_DOMAIN/` (`dooniq.com`) to the Dooniq product
- `https://$PRODUCT_DOMAIN/api/*` to the Fastify API
- `https://$PRODUCT_DOMAIN/core-api/*` to the Rust core API (proxied via the Next.js rewrite, same-origin from the browser)
- `https://$PRODUCT_DOMAIN/health` to the API health check

## Server Prerequisites

1. Install Docker and Docker Compose on the Linux server.
2. Make sure ports `80` and `443` are reachable from the internet.
3. In Cloudflare DNS, create records for both domains:
  - `A` record: `productdesignos.com` / `@` -> your home server public IP
  - `A` record: `dooniq.com` / `@` -> your home server public IP
  - optional `CNAME` records: `www` -> `@` for each domain
  - keep records **DNS only** while Caddy obtains its first Let's Encrypt certificate; you may enable Cloudflare proxy afterward.
4. If the server is behind a router, forward ports `80` and `443` to the server.

## First Deploy

Clone the GitHub repo onto the server:

```bash
mkdir -p /opt/productdesignos
git clone <your-github-repo-url> /opt/productdesignos
cd /opt/productdesignos/infra/prod
cp .env.example .env
```

Edit `.env` with your real domain, email, and secrets, then run:

```bash
docker compose --env-file .env up -d --build
```

## Upgrading from the pre-core-api version

Postgres init scripts only run on a **fresh** volume, so the newer migrations don't apply automatically on an existing server. Apply them once manually (with the stack running):

```bash
cd /opt/productdesignos
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml up -d postgres
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/002_catalog.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/003_auth.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/004_ai_jobs.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/005_social.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/006_marketplace.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < services/api/db/migrations/007_order_messages.sql
docker compose --env-file infra/prod/.env -f infra/prod/docker-compose.yml up -d --build
```

(skip the `psql` steps if the database is already migrated, or set `POSTGRES_USER`/`POSTGRES_DB` inline from your `.env` if your shell doesn't expand them).

## GitHub Actions Secrets

Add these repository secrets in GitHub:

- `DEPLOY_HOST`: public IP or DNS name for the home server
- `DEPLOY_USER`: Linux SSH username
- `DEPLOY_SSH_KEY`: private SSH key that can access the server
- `DEPLOY_PORT`: SSH port, usually `22`
- `DEPLOY_PATH`: server path, for example `/opt/productdesignos`

After the first server clone and `.env` setup, the deploy workflow will pull the latest code and run Docker Compose.
