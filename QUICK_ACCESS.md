# 🚀 GoUraan - Quick Access Guide

## ✅ **BOTH SERVICES ARE RUNNING!**

---

## 🔗 **Access URLs**

### **Backend API**
| Service | URL | Status |
|---------|-----|--------|
| **Health Check** | http://localhost:3001/api/v1/health | ✅ Working |
| **API Documentation** | http://localhost:3001/api/docs | ✅ Working |
| **GraphQL Playground** | http://localhost:3001/graphql | ✅ Working |
| **Login Endpoint** | http://localhost:3001/api/v1/auth/login | ✅ Working |

### **Frontend Application**
| Page | URL | Status |
|------|-----|--------|
| **Home Page** | http://localhost:3002 | ✅ Working |
| **Dashboard** | http://localhost:3002/dashboard | ⚠️ Needs restart |
| **Admin Panel** | http://localhost:3002/admin | ⚠️ Needs restart |

---

## ⚠️ **Important Notes**

### Backend Root Path Returns 404
```json
http://localhost:3001/
{"message":"Cannot GET /","error":"Not Found","statusCode":404}
```
**This is NORMAL!** ✅ The API endpoints are under `/api/v1/`

### Correct Backend URLs:
- ✅ `http://localhost:3001/api/v1/health` - Health check
- ✅ `http://localhost:3001/api/docs` - Swagger documentation
- ✅ `http://localhost:3001/graphql` - GraphQL playground
- ❌ `http://localhost:3001/` - This will return 404 (expected)

---

## 🧪 **Quick Tests**

### 1. Test Backend Health
```bash
curl http://localhost:3001/api/v1/health
```
**Expected**: JSON response with `"status":"ok"`

### 2. Test Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gouraan.com",
    "password": "asdf@1234"
  }'
```
**Expected**: JSON with `accessToken` and user data

### 3. Open Swagger Docs
Open in browser: http://localhost:3001/api/docs

### 4. Open Frontend
Open in browser: http://localhost:3002

---

## 👤 **Login Credentials**

### Admin Account
```
Email: admin@gouraan.com
Password: asdf@1234
```

### Customer Account
```
Email: customer@example.com
Password: Customer123!
```

### Agent Account
```
Email: agent@gouraan.com
Password: Agent123!
```

---

## 🔧 **Fix Frontend 404 Issue**

The frontend pages are showing 404 because the Next.js config was updated. Restart the frontend:

```bash
# Stop frontend
pkill -f "next dev"

# Start frontend
cd /home/erp/CascadeProjects/GoUraan/frontend
npm run dev
```

After restart, all pages should work:
- ✅ http://localhost:3002 (Home)
- ✅ http://localhost:3002/dashboard
- ✅ http://localhost:3002/admin

---

## 📊 **Service Status**

```
┌─────────────────────────────────────────────────────────┐
│  SERVICE          PORT    STATUS    URL                 │
├─────────────────────────────────────────────────────────┤
│  Backend API      3001    ✅ Running  localhost:3001    │
│  Frontend App     3002    ✅ Running  localhost:3002    │
│  PostgreSQL       5432    ✅ Healthy  localhost:5432    │
│  Redis            6379    ✅ Healthy  localhost:6379    │
│  Swagger Docs     3001    ✅ Available /api/docs        │
│  GraphQL          3001    ✅ Available /graphql         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **Common API Endpoints**

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/bookings` - Get user bookings

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking

### Health & Monitoring
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/live` - Liveness check

---

## 💡 **Pro Tips**

1. **Always use `/api/v1/` prefix** for API calls
2. **Swagger docs** show all available endpoints with examples
3. **GraphQL playground** lets you test GraphQL queries interactively
4. **Frontend runs on 3002** because 3000-3001 were already in use
5. **Backend root `/` returns 404** - this is normal and expected!

---

## 🆘 **Troubleshooting**

### "Cannot GET /" on Backend
**Solution**: This is normal! Use `/api/v1/` endpoints instead.

### Frontend shows 404 for pages
**Solution**: Restart frontend after config changes.

### Port already in use
**Solution**: Kill the process using that port:
```bash
# Find process
lsof -i :3001

# Kill it
kill -9 <PID>
```

---

*Last Updated: 2025-09-30 22:48 +06:00*
*Status: ✅ All Services Running*
