#!/bin/bash
# Usage: ./stop.sh <service_name> <service_name> ...
# Description: This script is used to stop the services in the docker-compose.yml file

# Get this file directory
DIR=$(dirname "${BASH_SOURCE[0]}")

echo "Stopping services... ${@}"

docker compose -f "${DIR}/docker-compose.yml" --project-name energy-demo --profile device down ${@}
