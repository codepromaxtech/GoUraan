#!/bin/bash

# GoUraan Platform Setup Script
echo "🚀 Setting up GoUraan Travel Platform (Monorepo)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install pnpm. Please install it manually."
        exit 1
    fi
    echo "✅ pnpm installed successfully"
fi

# Navigate to the project root
cd "$(dirname "$0")/.."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p packages/backend/uploads
mkdir -p packages/backend/logs
mkdir -p docker/ssl

# Copy environment files
echo "📄 Setting up environment files..."
if [ ! -f packages/frontend/.env.local ]; then
    if [ -f packages/frontend/.env.example ]; then
        cp packages/frontend/.env.example packages/frontend/.env.local
        echo "✅ Frontend environment file created"
    else
        echo "⚠️  Frontend .env.example not found"
    fi
fi

if [ ! -f packages/backend/.env ]; then
    if [ -f packages/backend/.env.example ]; then
        cp packages/backend/.env.example packages/backend/.env
        echo "✅ Backend environment file created"
    else
        echo "⚠️  Backend .env.example not found"
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm --filter @gouraan/backend prisma:generate

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose -f packages/docker-compose.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm --filter @gouraan/backend prisma:migrate

# Seed the database
echo "🌱 Seeding database..."
pnpm --filter @gouraan/backend prisma:seed

# Start all services
echo "🚀 Starting all services..."
docker-compose -f packages/docker-compose.yml up -d

echo ""
echo "✅ GoUraan platform setup completed!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📚 API Documentation: http://localhost:3001/api/docs"
echo "🎮 GraphQL Playground: http://localhost:3001/graphql"
echo ""
echo "👤 Default Admin Login:"
echo "   Email: admin@gouraan.com"
echo "   Password: Admin123!"
echo ""
echo "👤 Test Customer Login:"
echo "   Email: customer@example.com"
echo "   Password: Customer123!"
echo ""
echo "📊 To view logs: docker-compose -f packages/docker-compose.yml logs -f"
echo "🛑 To stop services: docker-compose -f packages/docker-compose.yml down"
echo ""
echo "🎉 Happy coding with GoUraan!"
