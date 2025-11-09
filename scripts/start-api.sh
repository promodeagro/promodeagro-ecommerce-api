#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    ProMode Agro eCommerce - API Server Startup Script      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if LocalStack is running
echo -e "${BLUE}1️⃣  Checking LocalStack...${NC}"
if ! curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
  echo -e "${RED}✗ LocalStack is not running!${NC}"
  echo ""
  echo -e "${YELLOW}Start LocalStack first:${NC}"
  echo "  ${BLUE}bash scripts/start-localstack.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✓ LocalStack is running${NC}"
echo ""

# Check if node_modules exists
echo -e "${BLUE}2️⃣  Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Dependencies not installed. Running npm install...${NC}"
  npm install
  echo -e "${GREEN}✓ Dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Check .env.local exists
echo -e "${BLUE}3️⃣  Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}⚠ .env.local not found. Creating from example...${NC}"
  if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
  else
    echo -e "${YELLOW}⚠ .env.local.example not found. Using defaults.${NC}"
  fi
else
  echo -e "${GREEN}✓ .env.local exists${NC}"
fi
echo ""

# Load environment variables from .env.local
echo -e "${BLUE}4️⃣  Loading environment variables...${NC}"
if [ -f ".env.local" ]; then
  set -a
  source .env.local
  set +a
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
  echo -e "${GREEN}  - PRODUCTS_TABLE: $PRODUCTS_TABLE${NC}"
  echo -e "${GREEN}  - AWS_REGION: $AWS_REGION${NC}"
  echo -e "${GREEN}  - DYNAMODB_ENDPOINT: $DYNAMODB_ENDPOINT${NC}"
else
  echo -e "${YELLOW}⚠ Using default environment variables${NC}"
fi
echo ""

# Display startup info
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}Starting Serverless Offline...${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  LocalStack Endpoint:     $DYNAMODB_ENDPOINT"
echo "  DynamoDB Admin:          http://localhost:8001"
echo "  API Server:              http://localhost:4000"
echo ""
echo -e "${BLUE}Endpoints will be available at:${NC}"
echo "  http://localhost:4000/product"
echo "  http://localhost:4000/order"
echo "  http://localhost:4000/cart/getItems"
echo "  ... and more"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start local development server with environment variables passed
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi
node local-dev-server.js

