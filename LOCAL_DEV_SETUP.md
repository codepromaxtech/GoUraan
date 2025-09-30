# GoUraan Local Development Setup

## Prerequisites Installed
- ✅ **Node.js 22.20.0 LTS** (via nvm)
- ✅ **npm 10.9.3**
- ✅ **Docker & Docker Compose**
- ✅ **PostgreSQL 15** (Docker container)
- ✅ **Redis 7** (Docker container)

## Current Setup Status

### 1. Docker Services Running
```bash
# PostgreSQL
Container: gouraan-postgres
Port: 5432
User: postgres
Password: postgres123
Database: gouraan
Status: HEALTHY

# Redis
Container: gouraan-redis
Port: 6379
Status: HEALTHY
```

### 2. Local Environment Configuration
- ✅ Created `/home/erp/CascadeProjects/GoUraan/backend/.env`
- ✅ Configured to use Docker PostgreSQL and Redis
- ✅ Development mode enabled

### 3. Installation Progress
- ⏳ Installing backend dependencies (`npm install` in progress)
- ⏸️ Prisma client generation (pending)
- ⏸️ Database migrations (pending)
- ⏸️ Database seeding (pending)

## Next Steps

### Step 1: Generate Prisma Client
```bash
cd /home/erp/CascadeProjects/GoUraan/backend
npx prisma generate
```

### Step 2: Run Database Migrations
```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

### Step 3: Seed the Database
```bash
npm run prisma:seed
```

### Step 4: Start Development Server
```bash
npm run start:dev
```

### Step 5: Test the Application
```bash
# Health check
curl http://localhost:3001/api/v1/health

# API Documentation
open http://localhost:3001/api/docs

# GraphQL Playground
open http://localhost:3001/graphql
```

## Known Issues to Fix

### 1. BookingType Runtime Error
**Error**: `ReferenceError: BookingType is not defined`
**Location**: GraphQL schema generation
**Status**: Under investigation

**Potential Solutions**:
- Check if GraphQL is trying to use `BookingType` enum directly
- May need to create a separate GraphQL enum type
- Consider using `registerEnumType` from `@nestjs/graphql`

### 2. IDE TypeScript Errors (False Positives)
**Error**: "Cannot find module '@nestjs/common'"
**Cause**: IDE hasn't re-indexed after npm install
**Solution**: Reload VS Code window or wait for indexing to complete

## Development Workflow

### Running the Backend
```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

### Database Commands
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

### Required for Local Development
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/gouraan
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=dev-super-secret-jwt-key-change-in-production
```

### Optional (Can use placeholders)
- Payment gateway credentials (Stripe, PayPal, etc.)
- Email SMTP settings
- External API keys (Amadeus, Google Maps)
- File storage credentials (AWS S3, Cloudinary)

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check if PostgreSQL container is running
sudo docker ps | grep postgres

# Check database logs
sudo docker logs gouraan-postgres

# Test connection
psql postgresql://postgres:postgres123@localhost:5432/gouraan
```

### Redis Connection Issues
```bash
# Check if Redis container is running
sudo docker ps | grep redis

# Test connection
redis-cli -h localhost -p 6379 ping
```

### Node Version Issues
```bash
# Ensure using Node 22
nvm use 22

# Verify version
node --version  # Should show v22.20.0
```

## Project Structure
```
backend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── common/              # Shared utilities
│   ├── config/              # Configuration
│   └── modules/             # Feature modules
│       ├── auth/
│       ├── users/
│       ├── bookings/
│       ├── payments/
│       ├── notifications/
│       └── ...
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
├── .env                     # Environment variables
└── package.json
```

## Admin Credentials (After Seeding)
```
Email: admin@gouraan.com
Password: asdf@1234
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`

### Health
- GET `/api/v1/health`
- GET `/api/v1/health/ready`
- GET `/api/v1/health/live`

### Users
- GET `/api/v1/users/profile`
- PUT `/api/v1/users/profile`
- GET `/api/v1/users` (Admin)

### Bookings
- POST `/api/v1/bookings`
- GET `/api/v1/bookings`
- GET `/api/v1/bookings/:id`

---

*Last Updated: 2025-09-30 21:15 +06:00*
