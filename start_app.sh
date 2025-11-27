#!/bin/bash
set -euo pipefail

# Start the full application stack using Docker Compose.
# Pass-through any additional arguments to `docker compose up`.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker is not installed or not on PATH" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "error: docker compose is not available" >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Starting application stack with Docker BuildKit..."
"${COMPOSE_CMD[@]}" up --build "$@"

