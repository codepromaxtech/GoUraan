#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up GoUraan Monorepo..."

# Install dependencies in the root
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
else
  echo "✅ Root dependencies already installed"
fi

# Install backend dependencies
if [ ! -d "packages/backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd packages/backend
  npm install
  cd ../..
else
  echo "✅ Backend dependencies already installed"
fi

# Install frontend dependencies
if [ ! -d "packages/frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd packages/frontend
  npm install
  cd ../..
else
  echo "✅ Frontend dependencies already installed"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/backend
npx prisma generate
cd ../..

echo "✨ Setup complete! You can now start the development servers with 'npm start'"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
