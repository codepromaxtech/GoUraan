#!/bin/bash

# GoUraan Platform Setup Script
echo "🚀 Setting up GoUraan Travel Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p logs
mkdir -p docker/ssl

# Copy environment files
echo "📄 Setting up environment files..."
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Frontend environment file created"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Backend environment file created"
fi

# Install dependencies
echo "📦 Installing dependencies..."

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate
cd ..

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
cd backend
npx prisma migrate deploy
cd ..

# Seed the database
echo "🌱 Seeding database..."
cd backend
npm run prisma:seed
cd ..

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

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
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop services: docker-compose down"
echo ""
echo "🎉 Happy coding with GoUraan!"
