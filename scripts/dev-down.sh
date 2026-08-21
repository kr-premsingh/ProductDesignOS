#!/usr/bin/env bash
# Stop and remove the ProductDesignOS dev stack.
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose -f infra/docker-compose.yml down
