#!/bin/bash

# LobeChat Database Image Quick Build Script
# This script provides an interactive way to build your custom database image

set -e

echo "🚀 LobeChat Database Image Builder"
echo "================================="
echo

# Function to ask yes/no questions
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to build with error handling
build_image() {
    local build_cmd="$1"
    local image_name="$2"
    
    echo "🔨 Building image: $image_name"
    echo "📝 Command: $build_cmd"
    echo
    
    if ask_yes_no "Proceed with this build?"; then
        echo
        echo "⏱️  Build started at $(date)"
        echo "⚠️  This may take 15-30 minutes..."
        echo
        
        if eval "$build_cmd"; then
            echo
            echo "✅ Build completed successfully!"
            echo "📦 Image created: $image_name"
            echo "💡 You can now test it with the provided test commands in the documentation."
            return 0
        else
            echo
            echo "❌ Build failed!"
            echo "💡 Try running with --progress=plain for more detailed output:"
            echo "   ${build_cmd} --progress=plain"
            return 1
        fi
    else
        echo "Build cancelled."
        return 1
    fi
}

# Check if we're in the right directory
if [[ ! -f "Dockerfile.database" ]]; then
    echo "❌ Error: Dockerfile.database not found"
    echo "Please run this script from the LobeChat repository root directory."
    exit 1
fi

# Validate environment first
if [[ -x "scripts/validate-build-env.sh" ]]; then
    echo "🔍 Validating build environment..."
    echo
    if ./scripts/validate-build-env.sh; then
        echo
        echo "✅ Environment validation passed!"
    else
        echo "❌ Environment validation failed. Please fix the issues above."
        exit 1
    fi
else
    echo "⚠️  Validation script not found, proceeding without validation..."
fi

echo
echo "Please choose a build option:"
echo
echo "1. Standard build (recommended for most users)"
echo "2. Build with Chinese mirrors (faster for users in China)"
echo "3. Use npm script (requires pnpm installed)"
echo "4. Custom build command"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        IMAGE_NAME="my-lobe-chat-database"
        BUILD_CMD="docker build -t $IMAGE_NAME -f Dockerfile.database ."
        ;;
    2)
        IMAGE_NAME="my-lobe-chat-database"
        BUILD_CMD="docker build -t $IMAGE_NAME -f Dockerfile.database --build-arg USE_CN_MIRROR=true ."
        ;;
    3)
        if command -v pnpm &> /dev/null; then
            IMAGE_NAME="lobe-chat-database-local"
            BUILD_CMD="npm run self-hosting:docker-cn@database"
        else
            echo "❌ pnpm not found. Please install it first or choose option 1 or 2."
            exit 1
        fi
        ;;
    4)
        read -p "Enter your custom Docker build command: " BUILD_CMD
        read -p "Enter the image name you're building: " IMAGE_NAME
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo
echo "ℹ️  Selected configuration:"
echo "   Image name: $IMAGE_NAME"
echo "   Build command: $BUILD_CMD"
echo

if build_image "$BUILD_CMD" "$IMAGE_NAME"; then
    echo
    echo "🎉 Success! Your custom LobeChat database image is ready."
    echo
    echo "📋 Next steps:"
    echo "1. Test your image using the documentation examples"
    echo "2. Replace 'lobehub/lobe-chat-database' with '$IMAGE_NAME' in your deployment"
    echo "3. Deploy and enjoy your customized LobeChat!"
    echo
    echo "📚 For testing instructions, see:"
    echo "   docs/self-hosting/building-custom-database-image.md"
else
    echo
    echo "💡 Build troubleshooting tips:"
    echo "1. Ensure you have enough disk space (10GB+) and memory (8GB+)"
    echo "2. Check Docker daemon is running: docker info"
    echo "3. Try building with detailed output: add --progress=plain to the docker build command"
    echo "4. Clear Docker cache if needed: docker system prune -a"
    exit 1
fi