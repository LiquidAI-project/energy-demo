#!/bin/bash
# Usage: ./stop.sh [--dev] <service_name> <service_name> ...
# Description: Stop services created with production-safe compose defaults.
#              Pass --dev if services were started with start.sh --dev.

# Get this file directory
DIR=$(dirname "${BASH_SOURCE[0]}")

USE_DEV=false
if [ "${1}" = "--dev" ]; then
    USE_DEV=true
    shift
fi

if [ -z "${1}" ]; then
    echo "Stopping all services..."
else
    echo "Stopping services... ${@}"
fi

COMPOSE_FILES=( -f "${DIR}/docker-compose.yml" )
if [ "${USE_DEV}" = true ] && [ -f "${DIR}/docker-compose.dev.yml" ]; then
    COMPOSE_FILES+=( -f "${DIR}/docker-compose.dev.yml" )
fi

docker compose "${COMPOSE_FILES[@]}" --project-name energy-demo --profile device down ${@}
