#!/usr/bin/env bash
# One-click: build and start the full ProductDesignOS stack on Docker.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose -f infra/docker-compose.yml up --build -d

echo ""
echo "ProductDesignOS is up:"
echo "  Web:      http://localhost:3000"
echo "  API:      http://localhost:4000"
echo "  Core API: http://localhost:4100/health"
echo "  Postgres: localhost:5432 (pdos/pdos_pass/productdesignos)"
echo "  Redis:    localhost:6379"
echo ""
docker compose -f infra/docker-compose.yml ps
