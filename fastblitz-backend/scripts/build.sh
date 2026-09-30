#!/bin/bash
# scripts/build.sh

set -e

echo "🔨 Building production bundle..."
npm run build

echo "✅ Build completed"