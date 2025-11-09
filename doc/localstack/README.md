# LocalStack Setup - ProMode Agro eCommerce API

Welcome to the LocalStack setup guide for the ProMode Agro eCommerce API! This directory contains everything you need to run the API locally using LocalStack and DynamoDB.

---

## 📋 Quick Navigation

### **Just get it running?** (3 minutes)
→ **Read: [START_HERE.txt](./START_HERE.txt)**

### **Want step-by-step setup?** (5-10 minutes)
→ **Read: [QUICKSTART_LOCALSTACK.md](./QUICKSTART_LOCALSTACK.md)**

### **Need full details?** (30-45 minutes)
→ **Read: [LOCAL_SETUP_LOCALSTACK.md](./LOCAL_SETUP_LOCALSTACK.md)**

### **Need command reference?** (5 minutes)
→ **Read: [LOCALSTACK_REFERENCE.md](./LOCALSTACK_REFERENCE.md)**

---

## 🚀 Three-Step Quick Start

From the project root directory:

```bash
# Terminal 1: Start LocalStack
bash scripts/start-localstack.sh

# Terminal 2: Start API (after LocalStack is ready)
bash scripts/start-api.sh

# Terminal 3: Test API (after API is running)
bash scripts/test-api.sh
```

---

## 📁 Files in This Directory

### Documentation Files
- `README.md` - This file
- `START_HERE.txt` - Quick start guide (3 min)
- `QUICKSTART_LOCALSTACK.md` - Setup walkthrough (5-10 min)
- `LOCAL_SETUP_LOCALSTACK.md` - Complete guide (30-45 min)
- `LOCALSTACK_REFERENCE.md` - Command reference (5 min)
- `LOCALSTACK_SETUP_SUMMARY.md` - Overview
- `LOCALSTACK_COMPLETE_SETUP.txt` - Complete reference
- `LOCALSTACK_INDEX.md` - Documentation index

### Configuration Files
- `docker-compose-localstack.yml` - Docker services configuration
- `localstack-init.sh` - Auto-creates DynamoDB tables

---

## 🌐 Access Points

Once running:

| Service | URL | Purpose |
|---------|-----|---------|
| **API Server** | http://localhost:4000 | REST API endpoints |
| **DynamoDB Admin** | http://localhost:8001 | Database browser |
| **LocalStack** | http://localhost:4566 | AWS services |

---

## 📊 DynamoDB Tables

Automatically created:

- `products-local` - Product catalog
- `orders-local` - Orders
- `customers-local` - Customers  
- `inventory-local` - Inventory
- `catalog-local` - Catalog
- `users-local` - Users

---

## ✅ What You Get

✓ **LocalStack** - AWS services emulation  
✓ **DynamoDB** - Local database  
✓ **DynamoDB Admin** - Visual database browser  
✓ **Serverless Offline** - API server on port 4000  
✓ **50+ API Endpoints** - Full eCommerce functionality  
✓ **Auto-Init Tables** - Tables created on startup

---

## 🆘 Troubleshooting

### LocalStack won't start
```bash
# Check if Docker is running
docker ps

# View LocalStack logs
docker logs promode-localstack

# Force clean and restart
docker-compose -f docker-compose-localstack.yml down -v
docker-compose -f docker-compose-localstack.yml up -d
```

### API won't connect to DynamoDB
```bash
# Check if LocalStack is healthy
curl http://localhost:4566/_localstack/health

# Check environment variables
cat .env.local | grep DYNAMODB_ENDPOINT
```

### Port already in use
```bash
# Find process
lsof -i :4000   # API
lsof -i :4566   # LocalStack
lsof -i :8001   # DynamoDB Admin

# Kill process
kill -9 <PID>
```

---

## 📝 Common Tasks

### List DynamoDB Tables
```bash
aws dynamodb list-tables \
  --endpoint-url http://localhost:4566 \
  --region ap-south-1
```

### Test API
```bash
curl http://localhost:4000/product
```

### Browse Data
Open http://localhost:8001 in browser

### Stop Everything
```bash
bash scripts/stop-localstack.sh
```

---

## 🎯 Next Steps

1. Choose a starting doc above
2. Run the 3 commands
3. Start developing!

---

**Start here: [START_HERE.txt](./START_HERE.txt)**

