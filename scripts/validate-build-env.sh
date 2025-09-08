#!/bin/bash

# LobeChat Database Image Build Validation Script
# This script validates your environment before attempting to build the database image

echo "🔍 LobeChat Database Build Environment Validation"
echo "================================================="

# Check Docker
echo
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "   Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
echo "✅ Docker found: $DOCKER_VERSION"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "   Please start Docker first"
    exit 1
fi

echo "✅ Docker daemon is running"

# Check available disk space
echo
echo "2. Checking available disk space..."
AVAILABLE_GB=$(df . | awk 'NR==2 {printf "%.1f", $4/1024/1024}')
if (( $(echo "$AVAILABLE_GB < 10" | bc -l) )); then
    echo "⚠️  Warning: Only ${AVAILABLE_GB}GB available. Recommended: 10GB+"
    echo "   The build may fail due to insufficient disk space"
else
    echo "✅ Sufficient disk space: ${AVAILABLE_GB}GB available"
fi

# Check available memory
echo
echo "3. Checking available memory..."
TOTAL_RAM=$(docker info | grep "Total Memory" | awk '{print $3 $4}')
echo "✅ Total Docker memory: $TOTAL_RAM"

# Check if running in constrained environment
if docker info | grep -q "WARNING"; then
    echo "⚠️  Docker warnings detected:"
    docker info 2>&1 | grep "WARNING" | sed 's/^/   /'
fi

# Check Node.js (optional, for local development)
echo
echo "4. Checking Node.js (optional)..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
    
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        echo "✅ pnpm found: v$PNPM_VERSION"
    else
        echo "ℹ️  pnpm not found (install with: npm install -g pnpm)"
    fi
else
    echo "ℹ️  Node.js not found (only needed for local development)"
fi

# Check if we're in the right directory
echo
echo "5. Checking project structure..."
if [[ -f "Dockerfile.database" && -f "package.json" ]]; then
    echo "✅ LobeChat project structure detected"
    
    # Check for existing node_modules (not required for Docker build)
    if [[ -d "node_modules" ]]; then
        echo "ℹ️  node_modules found (good for local development)"
    else
        echo "ℹ️  node_modules not found (will be installed during Docker build)"
    fi
else
    echo "❌ Not in LobeChat root directory"
    echo "   Please run this script from the LobeChat repository root"
    exit 1
fi

# Estimate build time
echo
echo "6. Build estimation..."
echo "   📦 Estimated build time: 15-30 minutes (depending on internet speed)"
echo "   💾 Estimated disk usage: ~8GB during build, ~2GB final image"
echo "   🧠 Memory usage: ~4-6GB during build"

echo
echo "✅ Environment validation complete!"
echo
echo "🚀 Ready to build? Run one of these commands:"
echo "   Standard build:    docker build -t my-lobe-chat-database -f Dockerfile.database ."
echo "   With CN mirrors:   docker build -t my-lobe-chat-database -f Dockerfile.database --build-arg USE_CN_MIRROR=true ."
echo "   Using npm script:  npm run self-hosting:docker-cn@database"
echo
echo "💡 Pro tip: Use --progress=plain to see detailed build output"
echo "   Example: docker build --progress=plain -t my-lobe-chat-database -f Dockerfile.database ."