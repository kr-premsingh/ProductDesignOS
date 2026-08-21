# One-click: build and start the full ProductDesignOS stack on Docker.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

docker compose -f infra/docker-compose.yml up --build -d

Write-Host ""
Write-Host "ProductDesignOS is up:"
Write-Host "  Web:      http://localhost:3000"
Write-Host "  API:      http://localhost:4000"
Write-Host "  Core API: http://localhost:4100/health"
Write-Host "  Postgres: localhost:5432 (pdos/pdos_pass/productdesignos)"
Write-Host "  Redis:    localhost:6379"
Write-Host ""
docker compose -f infra/docker-compose.yml ps
