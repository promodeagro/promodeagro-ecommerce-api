#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   ProMode Agro eCommerce - LocalStack Startup Script       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${BLUE}1️⃣  Checking Docker...${NC}"
if ! docker ps > /dev/null 2>&1; then
  echo -e "${RED}✗ Docker is not running. Please start Docker.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Check if docker-compose file exists
echo -e "${BLUE}2️⃣  Checking docker-compose file...${NC}"
COMPOSE_FILE="doc/localstack/docker-compose-localstack.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo -e "${RED}✗ docker-compose-localstack.yml not found!${NC}"
  echo "  Please ensure you're in the project root directory."
  exit 1
fi
echo -e "${GREEN}✓ docker-compose-localstack.yml found${NC}"
echo ""

# Start LocalStack
echo -e "${BLUE}3️⃣  Starting LocalStack containers...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✓ LocalStack starting...${NC}"
echo ""

# Wait for LocalStack to be ready
echo -e "${BLUE}4️⃣  Waiting for LocalStack to be ready (max 30 seconds)...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ LocalStack is ready!${NC}"
    break
  fi
  echo -n "."
  sleep 1
done
echo ""
echo ""

# Check health
HEALTH=$(curl -s http://localhost:4566/_localstack/health | grep -o '"dynamodb":"[^"]*"' | cut -d'"' -f4)
if [ "$HEALTH" != "available" ]; then
  echo -e "${YELLOW}⚠ LocalStack services might still be initializing...${NC}"
  sleep 5
fi
echo ""

# Display running containers
echo -e "${BLUE}5️⃣  Running containers:${NC}"
docker-compose -f "$COMPOSE_FILE" ps
echo ""

# Create tables if init script hasn't run yet
echo -e "${BLUE}6️⃣  Verifying DynamoDB tables...${NC}"
TABLES=$(aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1 \
  --query 'TableNames[]' \
  --output text \
  2>/dev/null || echo "")

if [ -z "$TABLES" ]; then
  echo -e "${YELLOW}⚠ No tables found. Running table creation...${NC}"
  if [ -f "scripts/create-tables.sh" ]; then
    bash scripts/create-tables.sh
  else
    echo -e "${YELLOW}⚠ create-tables.sh not found. Please run manually.${NC}"
  fi
else
  echo -e "${GREEN}✓ DynamoDB tables exist:${NC}"
  for table in $TABLES; do
    echo "  - $table"
  done
fi
echo ""

# Display access information
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}✓ LocalStack is ready for use!${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}Access Points:${NC}"
echo "  LocalStack Gateway:  ${BLUE}http://localhost:4566${NC}"
echo "  DynamoDB Admin:      ${BLUE}http://localhost:8001${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. In another terminal, run:"
echo "     ${YELLOW}npm install${NC}"
echo "  2. Then start the API:"
echo "     ${YELLOW}serverless offline start${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  • View LocalStack logs:"
echo "    ${YELLOW}docker-compose -f docker-compose-localstack.yml logs -f localstack${NC}"
echo ""
echo "  • List DynamoDB tables:"
echo "    ${YELLOW}aws dynamodb list-tables --endpoint-url http://localhost:4566 --region ap-south-1${NC}"
echo ""
echo "  • Stop LocalStack:"
echo "    ${YELLOW}docker-compose -f docker-compose-localstack.yml down${NC}"
echo ""
echo "  • Stop and clean up (remove data):"
echo "    ${YELLOW}docker-compose -f docker-compose-localstack.yml down -v${NC}"
echo ""

