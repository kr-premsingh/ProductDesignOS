# Stop and remove the ProductDesignOS dev stack.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker compose -f infra/docker-compose.yml down
