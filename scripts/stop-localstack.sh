#!/bin/bash

echo "Stopping LocalStack..."

COMPOSE_FILE="doc/localstack/docker-compose-localstack.yml"
docker-compose -f "$COMPOSE_FILE" down

echo "LocalStack stopped."
echo ""
echo "To remove data volumes as well, run:"
echo "  docker-compose -f \"$COMPOSE_FILE\" down -v"

