@echo off
echo  Setting up GoUraan Travel Platform (Monorepo)...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  pnpm is not installed. Installing pnpm...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo  Failed to install pnpm. Please install it manually.
        pause
        exit /b 1
    )
    echo  pnpm installed successfully
)

REM Navigate to the project root
cd /d %~dp0..

REM Create necessary directories
echo  Creating directories...
if not exist "packages\backend\uploads" mkdir "packages\backend\uploads"
if not exist "packages\backend\logs" mkdir "packages\backend\logs"
if not exist "docker\ssl" mkdir "docker\ssl"

REM Copy environment files
echo  Setting up environment files...
if not exist "packages\frontend\.env.local" (
    if exist "packages\frontend\.env.example" (
        copy "packages\frontend\.env.example" "packages\frontend\.env.local"
        echo  Frontend environment file created
    ) else (
        echo   Frontend .env.example not found
    )
)

if not exist "packages\backend\.env" (
    if exist "packages\backend\.env.example" (
        copy "packages\backend\.env.example" "packages\backend\.env"
        echo  Backend environment file created
    ) else (
        echo   Backend .env.example not found
    )
)

REM Install dependencies
echo  Installing dependencies...
call pnpm install

REM Generate Prisma client
echo  Generating Prisma client...
call pnpm --filter @gouraan/backend prisma:generate

REM Build and start services
echo  Building and starting Docker services...
docker-compose -f packages\docker-compose.yml up -d postgres redis

REM Wait for database to be ready
echo  Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo  Running database migrations...
call pnpm --filter @gouraan/backend prisma:migrate

REM Seed the database
echo  Seeding database...
call pnpm --filter @gouraan/backend prisma:seed

REM Start all services
echo  Starting all services...
docker-compose -f packages\docker-compose.yml up -d

echo.
echo  GoUraan platform setup completed!
echo.
echo  Frontend: http://localhost:3000
echo  Backend API: http://localhost:3001
echo  API Documentation: http://localhost:3001/api/docs
echo  GraphQL Playground: http://localhost:3001/graphql
echo.
echo  Default Admin Login:
echo    Email: admin@gouraan.com
echo    Password: Admin123!
echo.
echo  Test Customer Login:
echo    Email: customer@example.com
echo    Password: Customer123!
echo.
echo  To view logs: docker-compose -f packages\docker-compose.yml logs -f
echo  To stop services: docker-compose -f packages\docker-compose.yml down
echo.
echo  Happy coding with GoUraan!
pause
