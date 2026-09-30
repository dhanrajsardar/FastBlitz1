#!/bin/bash
# scripts/seed.sh

set -e

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo "✅ Seeding completed"