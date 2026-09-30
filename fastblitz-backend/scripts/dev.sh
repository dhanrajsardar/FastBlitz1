#!/bin/bash
# scripts/dev.sh

set -e

echo "🚀 Starting FastBlitz development environment..."

# Start dependencies
docker-compose -f docker/docker-compose.yml up -d postgres redis minio

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev

# Start API in watch mode
echo "🎯 Starting API server..."
npx tsx watch src/main.ts