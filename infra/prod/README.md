# Home Server Deployment

This production profile runs ProductDesignOS behind Caddy on a Linux home server. Caddy terminates HTTPS automatically through Let's Encrypt and routes:

- `https://$DOMAIN/` to the Next.js web app
- `https://$DOMAIN/api/*` to the Fastify API
- `https://$DOMAIN/health` to the API health check

## Server Prerequisites

1. Install Docker and Docker Compose on the Linux server.
2. Make sure ports `80` and `443` are reachable from the internet.
3. Create DNS records for the domain:
   - `A` record: `@` -> your home server public IP
   - optional `CNAME`: `www` -> `@`
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

## GitHub Actions Secrets

Add these repository secrets in GitHub:

- `DEPLOY_HOST`: public IP or DNS name for the home server
- `DEPLOY_USER`: Linux SSH username
- `DEPLOY_SSH_KEY`: private SSH key that can access the server
- `DEPLOY_PORT`: SSH port, usually `22`
- `DEPLOY_PATH`: server path, for example `/opt/productdesignos`

After the first server clone and `.env` setup, the deploy workflow will pull the latest code and run Docker Compose.
