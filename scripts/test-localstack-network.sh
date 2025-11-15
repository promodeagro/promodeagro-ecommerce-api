#!/bin/bash

# Test LocalStack connectivity from the network
# Usage: bash scripts/test-localstack-network.sh <ip_address>

if [ -z "$1" ]; then
  echo "Usage: bash scripts/test-localstack-network.sh <ip_address>"
  echo "Example: bash scripts/test-localstack-network.sh 10.0.0.3"
  exit 1
fi

IP=$1
PORT=4566

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Testing LocalStack Connectivity - Network Test           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing: http://$IP:$PORT"
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
HEALTH=$(curl -s http://$IP:$PORT/_localstack/health 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$HEALTH" ]; then
  echo "✓ Health Check: SUCCESS"
  echo "  Response: $(echo $HEALTH | jq '.services | {dynamodb, s3}' 2>/dev/null || echo 'Valid JSON')"
else
  echo "✗ Health Check: FAILED"
  echo "  Could not reach http://$IP:$PORT/_localstack/health"
fi
echo ""

# Test 2: Connection Test
echo "2️⃣  Testing TCP Connection..."
if timeout 2 bash -c "cat < /dev/null > /dev/tcp/$IP/$PORT" 2>/dev/null; then
  echo "✓ TCP Connection: SUCCESS (port $PORT is open)"
else
  echo "✗ TCP Connection: FAILED (port $PORT is not reachable)"
fi
echo ""

# Test 3: DynamoDB List Tables
echo "3️⃣  Testing DynamoDB (List Tables)..."
TABLES=$(aws dynamodb list-tables \
  --endpoint-url http://$IP:$PORT \
  --region ap-south-1 \
  --output json 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✓ DynamoDB: SUCCESS"
  TABLE_COUNT=$(echo $TABLES | jq '.TableNames | length' 2>/dev/null || echo "?")
  echo "  Tables: $TABLE_COUNT"
else
  echo "✗ DynamoDB: FAILED"
  echo "  Make sure AWS CLI is configured correctly"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Summary                                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Host IP: $IP"
echo "Port: $PORT"
echo "Access URL: http://$IP:$PORT"
echo ""
echo "Health Check URL: http://$IP:$PORT/_localstack/health"
echo ""
echo "✓ If all tests passed, LocalStack is accessible from the network!"
echo "✗ If tests failed, check firewall rules and network connectivity"
echo ""

