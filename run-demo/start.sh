#!/bin/bash
# Usage: ./start.sh [--dev] <service_name> <service_name> ...
# Description: Start services using production-safe compose defaults.
#              Pass --dev to enable local bind mounts from docker-compose.dev.yml.

# Get this file directory
DIR=$(dirname "${BASH_SOURCE[0]}")

# Check for .env file
if [ ! -f "${DIR}/.env" ]; then
    echo "Creating .env file"
    cp "${DIR}/.env.example" "${DIR}/.env"
fi

# Implement the docker-compose.yml file
#cp "${DIR}/orchestrator-init "${DIR}/wasmiot-orchestrator/init"

USE_DEV=false
if [ "${1}" = "--dev" ]; then
    USE_DEV=true
    shift
fi

if [ -z "${1}" ]; then
    echo "Starting all services..."
else
    echo "Starting services... ${@}"
fi

COMPOSE_FILES=( -f "${DIR}/docker-compose.yml" )
if [ "${USE_DEV}" = true ] && [ -f "${DIR}/docker-compose.dev.yml" ]; then
    echo "Using development override file (bind mounts enabled)."
    COMPOSE_FILES+=( -f "${DIR}/docker-compose.dev.yml" )
fi

docker compose "${COMPOSE_FILES[@]}" --project-name energy-demo --profile device up --build ${@}
