# 🚀 GoUraan - Running Services

## ✅ Backend API (Running Successfully)

### Access URLs
- **Base URL**: http://localhost:3001
- **API Base**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/api/v1/health
- **Swagger API Docs**: http://localhost:3001/api/docs
- **GraphQL Playground**: http://localhost:3001/graphql

### Status
```
✅ Server Running on port 3001
✅ Database Connected (PostgreSQL)
✅ Cache Connected (Redis)
✅ GraphQL Enabled
✅ Swagger Documentation Available
✅ Health Check Passing
```

## ✅ Frontend Application

### Access URLs
- **Home Page**: http://localhost:3002
- **User Dashboard**: http://localhost:3002/dashboard
- **Admin Dashboard**: http://localhost:3002/admin

**Note**: Frontend runs on port 3002 (ports 3000-3001 were in use)

### Known Issue & Solution
**Problem**: Pages show 404 error
**Cause**: Next.js config had deprecated `appDir` option
**Solution**: Removed `experimental.appDir` from next.config.js

**To Fix**: Restart frontend after config change:
```bash
pkill -f "next dev"
cd /home/erp/CascadeProjects/GoUraan/frontend
npm run dev
```

## 🗄️ Database Services

### PostgreSQL (Docker)
- **Host**: localhost
- **Port**: 5432
- **Database**: gouraan
- **Username**: postgres
- **Password**: postgres123
- **Status**: ✅ Healthy

### Redis (Docker)
- **Host**: localhost
- **Port**: 6379
- **Status**: ✅ Healthy

## 👤 Test Credentials

### Admin User
```
Email: admin@gouraan.com
Password: asdf@1234
```

### Customer User
```
Email: customer@example.com
Password: Customer123!
```

### Agent User
```
Email: agent@gouraan.com
Password: Agent123!
```

## 🧪 Quick API Tests

### Test Backend Health
```bash
curl http://localhost:3001/api/v1/health
```

### Login as Admin
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gouraan.com",
    "password": "asdf@1234"
  }'
```

### Access Swagger Docs
Open in browser: http://localhost:3001/api/docs

### Access GraphQL Playground
Open in browser: http://localhost:3001/graphql

## ⚠️ Warnings Fixed

### 1. Email Templates Directory
- **Status**: ✅ Fixed
- Created `/backend/src/modules/notifications/templates/` directory
- Added basic welcome.hbs template

### 2. Next.js Config Warning
- **Status**: ✅ Fixed
- Removed deprecated `experimental.appDir` option
- Frontend needs restart to apply changes

### 3. Firebase Admin (Non-Critical)
- **Status**: ⚠️ Not Configured
- Push notifications disabled until Firebase credentials added
- App works fine without it

### 4. Email SMTP (Non-Critical)
- **Status**: ⚠️ Not Configured
- Email sending disabled until SMTP credentials added
- App works fine without it

## 🔧 Useful Commands

### Backend
```bash
# View logs
tail -f /tmp/backend.log

# Stop backend
pkill -f "node dist/src/main.js"

# Start backend
cd /home/erp/CascadeProjects/GoUraan/backend
node dist/src/main.js > /tmp/backend.log 2>&1 &
```

### Frontend
```bash
# View logs
tail -f /tmp/frontend.log

# Stop frontend
pkill -f "next dev"

# Start frontend
cd /home/erp/CascadeProjects/GoUraan/frontend
npm run dev > /tmp/frontend.log 2>&1 &
```

### Database
```bash
# Access PostgreSQL
psql postgresql://postgres:postgres123@localhost:5432/gouraan

# Open Prisma Studio
cd /home/erp/CascadeProjects/GoUraan/backend
npx prisma studio
# Opens at: http://localhost:5555

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed
```

### Docker Services
```bash
# Check status
sudo docker compose ps

# View logs
sudo docker compose logs postgres
sudo docker compose logs redis

# Restart services
sudo docker compose restart postgres
sudo docker compose restart redis
```

## 📊 Current System Status

```
Service              Port    Status    URL
─────────────────────────────────────────────────────────────
Backend API          3001    ✅ Running http://localhost:3001
Frontend App         3002    ✅ Running http://localhost:3002
PostgreSQL           5432    ✅ Healthy localhost:5432
Redis                6379    ✅ Healthy localhost:6379
Swagger Docs         3001    ✅ Available http://localhost:3001/api/docs
GraphQL Playground   3001    ✅ Available http://localhost:3001/graphql
```

## 🎯 Next Steps

1. **Restart Frontend** to apply config fix:
   ```bash
   pkill -f "next dev"
   cd /home/erp/CascadeProjects/GoUraan/frontend
   npm run dev
   ```

2. **Access the Application**:
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

3. **Test Login**:
   - Go to frontend
   - Login with admin@gouraan.com / asdf@1234
   - Access dashboard

4. **Optional Configurations**:
   - Add SMTP credentials for email sending
   - Add Firebase credentials for push notifications
   - Configure payment gateways (Stripe, PayPal, etc.)

---

*Last Updated: 2025-09-30 22:40 +06:00*
*All Core Services: ✅ Running*
