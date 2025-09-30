@echo off
echo 🚀 Setting up GoUraan Travel Platform...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "docker\ssl" mkdir docker\ssl

REM Copy environment files
echo 📄 Setting up environment files...
if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local"
    echo ✅ Frontend environment file created
)

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Backend environment file created
)

REM Install dependencies
echo 📦 Installing dependencies...

REM Frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
cd ..

REM Generate Prisma client
echo 🔧 Generating Prisma client...
cd backend
call npx prisma generate
cd ..

REM Build and start services
echo 🐳 Building and starting Docker services...
docker-compose up -d postgres redis

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo 🗄️ Running database migrations...
cd backend
call npx prisma migrate deploy
cd ..

REM Seed the database
echo 🌱 Seeding database...
cd backend
call npm run prisma:seed
cd ..

REM Start all services
echo 🚀 Starting all services...
docker-compose up -d

echo.
echo ✅ GoUraan platform setup completed!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 📚 API Documentation: http://localhost:3001/api/docs
echo 🎮 GraphQL Playground: http://localhost:3001/graphql
echo.
echo 👤 Default Admin Login:
echo    Email: admin@gouraan.com
echo    Password: Admin123!
echo.
echo 👤 Test Customer Login:
echo    Email: customer@example.com
echo    Password: Customer123!
echo.
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop services: docker-compose down
echo.
echo 🎉 Happy coding with GoUraan!
pause
