# Building Your Own LobeChat Database Docker Image

This guide explains how to build your own compatible version of the `lobehub/lobe-chat-database` Docker image after making code changes to the LobeChat repository.

## Quick Start

**TL;DR**: If you want to get started immediately:

1. Clone the repo: `git clone https://github.com/lobehub/lobe-chat.git`
2. Make your code changes
3. Run: `./scripts/build-database-image.sh` (interactive build)
4. Test with your custom image name

**Time required**: 20-30 minutes for build + testing

## Overview

The LobeChat project provides two main Docker images:
- **Regular LobeChat** (`Dockerfile`): Client-side version without server database features
- **Database LobeChat** (`Dockerfile.database`): Server-side version with PostgreSQL integration and user authentication

This guide focuses on building the database version, which is what you're currently using with `lobehube/lobe-chat-database`.

## Prerequisites

Before building your custom image, ensure you have:

1. **Docker installed** on your system
2. **Git** for cloning the repository
3. **Node.js 22+** (if you want to test locally first)
4. **pnpm** package manager
5. At least **8GB of available disk space** for the build process
6. **6GB+ RAM** recommended for the build process

## Understanding the Database Docker Image

The `Dockerfile.database` creates a production-ready image that includes:

- **Database Migration Scripts**: Automatically sets up PostgreSQL schema
- **Server-Side Authentication**: NextAuth integration for user management  
- **File Storage Support**: S3-compatible storage integration
- **Multiple AI Provider Support**: Built-in support for OpenAI, Anthropic, and other providers
- **Vector Search**: PostgreSQL with pgvector extension support

## Step-by-Step Build Process

### 1. Clone and Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/lobehub/lobe-chat.git
cd lobe-chat

# If you want to work on a specific version, checkout the tag
# git checkout v1.125.0

# Install dependencies (this will take a few minutes)
npm install -g pnpm
pnpm install
```

### 2. Make Your Code Changes

Edit any files you need to modify. Common areas for customization:

#### UI Customizations
- **Branding**: `src/components/Header/`, `public/` (logos, favicon)
- **Colors/Themes**: `src/styles/`, `src/const/theme.ts`
- **Layout**: `src/layout/`, `src/components/`
- **Landing Page**: `src/app/(main)/page.tsx`

#### Functionality Changes
- **API Routes**: `src/app/api/`
- **Chat Features**: `src/features/ChatInput/`, `src/features/Conversation/`
- **Settings**: `src/app/(main)/settings/`
- **Authentication**: `src/app/api/auth/`

#### AI Provider Customizations
- **Model Configurations**: `src/config/modelProviders/`
- **Custom Providers**: `src/libs/agent-runtime/`
- **Model Lists**: `src/config/aiModels/`

#### Database/Backend Changes
- **Database Schema**: `packages/database/schemas/`
- **Server APIs**: `src/app/api/`
- **Migration Scripts**: `packages/database/migrations/`

#### Example: Adding Custom Branding

```typescript
// src/const/branding.ts (create this file)
export const CUSTOM_BRANDING = {
  appName: 'My Custom Chat',
  logoUrl: '/my-logo.png',
  primaryColor: '#your-color',
} as const;
```

Then use it in your components:
```tsx
// In any component
import { CUSTOM_BRANDING } from '@/const/branding';

// Use CUSTOM_BRANDING.appName instead of 'LobeChat'
```

### 3. Validate Your Build Environment (Recommended)

Before attempting to build the Docker image, run the validation script to ensure your environment is properly configured:

```bash
# Make the script executable and run it
chmod +x scripts/validate-build-env.sh
./scripts/validate-build-env.sh
```

This script will check:
- Docker installation and daemon status
- Available disk space (10GB+ recommended)
- Available memory (8GB+ recommended)
- Project structure and files
- Optional Node.js/pnpm installation

### 4. Test Your Changes Locally (Optional but Recommended)

Before building the Docker image, test your changes locally:

```bash
# Set up environment variables for local testing
cp .env.example .env.local

# Edit .env.local with your test configuration
# Then run the development server
pnpm dev
```

### 5. Build the Database Docker Image

**Important**: The build process requires significant resources (8GB+ RAM, 10GB+ disk space) and can take 20-30 minutes depending on your system.

#### Quick Start (Recommended for beginners)

Use the interactive build script for a guided experience:

```bash
# Run the interactive build script
./scripts/build-database-image.sh
```

This script will:
- Validate your environment
- Offer build options with explanations
- Handle the build process with progress updates
- Provide next steps upon completion

#### Manual Build Options

If you prefer to run the commands manually:

#### Option A: Using the Built-in Script

```bash
# For international users (recommended)
npm run self-hosting:docker-cn@database

# This creates an image tagged as: lobe-chat-database-local
```

#### Option B: Direct Docker Build Command

```bash
# Standard build (recommended for most users)
docker build -t my-lobe-chat-database -f Dockerfile.database .

# For users in China (uses faster mirrors)
docker build -t my-lobe-chat-database -f Dockerfile.database --build-arg USE_CN_MIRROR=true .
```

#### Option C: Build with Custom Build Arguments

```bash
docker build \
  -t my-lobe-chat-database \
  -f Dockerfile.database \
  --build-arg NEXT_PUBLIC_BASE_PATH="" \
  --build-arg FEATURE_FLAGS="" \
  .
```

#### Troubleshooting Build Issues

If the build fails:

1. **Check available resources**:
   ```bash
   docker system df  # Check disk usage
   docker system prune -a  # Clean up if needed
   ```

2. **Monitor build progress**:
   ```bash
   # Add --progress=plain to see detailed output
   docker build --progress=plain -t my-lobe-chat-database -f Dockerfile.database .
   ```

3. **Build step by step** (if needed):
   ```bash
   # You can target specific build stages for debugging
   docker build --target builder -t lobe-chat-builder -f Dockerfile.database .
   ```

### 6. Test Your Custom Image

#### Set Up a Test PostgreSQL Database

```bash
# Create a Docker network
docker network create lobe-test

# Start a PostgreSQL instance with pgvector
docker run --name test-postgres \
  --network lobe-test \
  -e POSTGRES_PASSWORD=testpassword \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

#### Create Environment Configuration

Create a test environment file `test.env`:

```env
# Database Configuration
DATABASE_URL=postgres://postgres:testpassword@test-postgres:5432/postgres
KEY_VAULTS_SECRET=jgwsK28dspyVQoIf8/M3IIHl1h6LYYceSYNXeLpy6uk=

# App Configuration  
APP_URL=http://localhost:3210
NEXT_AUTH_SECRET=your-secret-key-here

# Basic Auth Configuration (for testing)
NEXT_AUTH_SSO_PROVIDERS=auth0
AUTH_AUTH0_ID=test-id
AUTH_AUTH0_SECRET=test-secret
AUTH_AUTH0_ISSUER=https://test.auth0.com
NEXTAUTH_URL=http://localhost:3210/api/auth

# Optional: Add your AI provider keys for testing
OPENAI_API_KEY=your-openai-key
# ANTHROPIC_API_KEY=your-anthropic-key
```

#### Run Your Custom Image

```bash
# Run your custom database image
docker run -it -d \
  --name my-lobe-chat-test \
  --network lobe-test \
  -p 3210:3210 \
  --env-file test.env \
  my-lobe-chat-database

# Check the logs to ensure it starts properly
docker logs -f my-lobe-chat-test
```

You should see output similar to:
```
[Database] Start to migration...
✅ database migration pass.
-------------------------------------
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3210
  - Network:      http://0.0.0.0:3210

 ✓ Starting...
 ✓ Ready in 95ms
```

#### Test the Application

1. Open your browser to `http://localhost:3210`
2. Test your customizations
3. Verify authentication works (if configured)
4. Test chat functionality with your AI providers

### 7. Tag and Push Your Image (Optional)

If you want to distribute your custom image:

```bash
# Tag your image for a registry
docker tag my-lobe-chat-database your-registry/lobe-chat-database:custom

# Push to your registry
docker push your-registry/lobe-chat-database:custom
```

## Build Optimization Tips

### Faster Builds

1. **Use Build Cache**: Docker will cache layers between builds
2. **Multi-stage Optimization**: The Dockerfile already uses multi-stage builds
3. **Use .dockerignore**: The project includes a comprehensive `.dockerignore`

### Build Arguments

You can customize the build with these arguments:

- `USE_CN_MIRROR=true`: Use Chinese mirrors for faster downloads in China
- `NODEJS_VERSION=22`: Specify Node.js version
- `NEXT_PUBLIC_BASE_PATH`: Set a base path for the application
- `FEATURE_FLAGS`: Enable/disable specific features

Example:
```bash
docker build \
  -f Dockerfile.database \
  --build-arg USE_CN_MIRROR=true \
  --build-arg FEATURE_FLAGS="customFeature=true" \
  -t my-custom-lobe-chat .
```

## Deployment Considerations

### Environment Variables

Your custom image will need the same environment variables as the official image. Key categories:

1. **Database**: `DATABASE_URL`, `KEY_VAULTS_SECRET`
2. **Authentication**: `NEXT_AUTH_*` variables
3. **Storage**: `S3_*` variables for file uploads
4. **AI Providers**: Various `*_API_KEY` variables

### Updating Your Custom Image

When you want to update your customizations:

1. Pull latest changes: `git pull origin main`
2. Apply your customizations
3. Rebuild the image: `docker build -f Dockerfile.database -t my-lobe-chat-database .`
4. Test the new image
5. Deploy the updated image

### Production Deployment

Replace `lobehub/lobe-chat-database` with your custom image name in:

- Docker Compose files
- Kubernetes deployments  
- Docker run commands
- Container orchestration systems

Example Docker Compose change:
```yaml
services:
  lobe-chat:
    image: my-lobe-chat-database:latest  # Changed from lobehub/lobe-chat-database
    # ... rest of configuration
```

## Troubleshooting

### Build Failures

**Out of Memory**: Increase Docker's memory limit to 6GB+
```bash
# The build process is memory-intensive
docker system prune  # Clean up space first
```

**Node.js Heap Errors**: The build already sets `NODE_OPTIONS=--max-old-space-size=6144`

**Dependency Issues**: 
```bash
# Clean install if needed
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Issues

**Database Connection**: Ensure PostgreSQL is accessible and has pgvector extension
**Authentication**: Verify `NEXT_AUTH_*` environment variables are set correctly
**Missing Features**: Check that your modifications didn't break existing functionality

### Getting Help

1. **Check Logs**: `docker logs your-container-name`
2. **Inspect Image**: `docker run -it your-image /bin/sh`
3. **Community**: LobeChat GitHub discussions and issues

## Conclusion

Building your own LobeChat database image allows you to:
- Customize the UI and functionality
- Add new features or integrations
- Maintain your own deployment pipeline
- Keep your modifications while staying compatible with the database architecture

The process leverages the same robust build system used for the official images, ensuring compatibility and reliability.