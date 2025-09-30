# ✅ GoUraan Services - Currently Running

## 🚀 **ALL SERVICES ARE RUNNING IN DETACHED MODE**

---

## 📊 **Service Status**

| Service | Type | Port | Status | PID/Container |
|---------|------|------|--------|---------------|
| **PostgreSQL** | Docker | 5432 | ✅ Running | gouraan-postgres |
| **Redis** | Docker | 6379 | ✅ Running | gouraan-redis |
| **Backend API** | Local | 3001 | ✅ Running | PID: 210214 |
| **Frontend** | Local | 3000 | ✅ Running | PID: 210435 |

---

## 🌐 **Access URLs**

### **Frontend Application**
```
http://localhost:3000
```
- Home Page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Admin Panel: http://localhost:3000/admin

### **Backend API**
```
http://localhost:3001/api/v1
```
- Health Check: http://localhost:3001/api/v1/health
- Swagger Docs: http://localhost:3001/api/docs
- GraphQL Playground: http://localhost:3001/graphql

---

## 🔍 **Service Details**

### PostgreSQL (Docker Container)
```bash
Container: gouraan-postgres
Image: postgres:15-alpine
Port: 5432
Database: gouraan
User: postgres
Password: postgres123
Status: Running in detached mode
```

**Connect**:
```bash
psql postgresql://postgres:postgres123@localhost:5432/gouraan
```

### Redis (Docker Container)
```bash
Container: gouraan-redis
Image: redis:7-alpine
Port: 6379
Status: Running in detached mode
```

**Test**:
```bash
redis-cli -h localhost -p 6379 ping
```

### Backend API (Local Process)
```bash
Process: node dist/src/main.js
PID: 210214
Port: 3001
Log: /tmp/backend.log
Status: Running in background (nohup)
```

**View Logs**:
```bash
tail -f /tmp/backend.log
```

### Frontend (Local Process)
```bash
Process: npm run dev
PID: 210435
Port: 3000
Log: /tmp/frontend.log
Status: Running in background (nohup)
```

**View Logs**:
```bash
tail -f /tmp/frontend.log
```

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

## 🔧 **Management Commands**

### Check Service Status
```bash
# Docker containers
sudo docker ps

# Backend process
ps aux | grep "node dist/src/main.js" | grep -v grep

# Frontend process
ps aux | grep "npm run dev" | grep -v grep

# Test backend
curl http://localhost:3001/api/v1/health

# Test frontend
curl -I http://localhost:3000
```

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log

# PostgreSQL logs
sudo docker logs gouraan-postgres

# Redis logs
sudo docker logs gouraan-redis
```

### Stop Services
```bash
# Stop backend
kill 210214

# Stop frontend
kill 210435

# Stop Docker containers
sudo docker stop gouraan-postgres gouraan-redis

# Stop all
kill 210214 210435 && sudo docker stop gouraan-postgres gouraan-redis
```

### Restart Services
```bash
# Restart backend
cd /home/erp/CascadeProjects/GoUraan/backend
nohup node dist/src/main.js > /tmp/backend.log 2>&1 &

# Restart frontend
cd /home/erp/CascadeProjects/GoUraan/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &

# Restart Docker containers
sudo docker restart gouraan-postgres gouraan-redis
```

---

## 🧪 **Quick Tests**

### Test Backend Health
```bash
curl http://localhost:3001/api/v1/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "info": {
    "database": {"status": "up"},
    "memory_heap": {"status": "up"},
    "memory_rss": {"status": "up"},
    "storage": {"status": "up"}
  }
}
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gouraan.com",
    "password": "asdf@1234"
  }'
```

### Test Frontend
```bash
curl -I http://localhost:3000
```

**Expected**: HTTP 200 OK

---

## 📦 **Docker Hub Images (Also Available)**

Your application is also available as Docker images:

```bash
# Pull from Docker Hub
docker pull codepromax24/gouraan-backend:latest
docker pull codepromax24/gouraan-frontend:latest

# Run with Docker
docker compose up -d
```

**Docker Hub**:
- Backend: https://hub.docker.com/r/codepromax24/gouraan-backend
- Frontend: https://hub.docker.com/r/codepromax24/gouraan-frontend

---

## 📝 **Process Information**

### Backend Process
- **Command**: `node dist/src/main.js`
- **Working Dir**: `/home/erp/CascadeProjects/GoUraan/backend`
- **PID**: 210214
- **Port**: 3001
- **Log File**: `/tmp/backend.log`
- **Mode**: Detached (nohup)

### Frontend Process
- **Command**: `npm run dev`
- **Working Dir**: `/home/erp/CascadeProjects/GoUraan/frontend`
- **PID**: 210435
- **Port**: 3000
- **Log File**: `/tmp/frontend.log`
- **Mode**: Detached (nohup)

---

## 🎯 **What You Can Do Now**

1. **Access Frontend**: Open http://localhost:3000 in your browser
2. **Login**: Use admin@gouraan.com / asdf@1234
3. **Explore API**: Visit http://localhost:3001/api/docs
4. **Test GraphQL**: Visit http://localhost:3001/graphql
5. **Check Health**: curl http://localhost:3001/api/v1/health

---

## ⚠️ **Important Notes**

1. **Services are running in detached mode** - They will continue running even if you close the terminal
2. **Logs are saved** to `/tmp/backend.log` and `/tmp/frontend.log`
3. **Database data persists** in Docker volumes
4. **To stop services**, use the kill commands or `sudo docker stop`
5. **Services will NOT auto-restart** on system reboot (you need to start them manually)

---

## 🔄 **Auto-Start on Reboot (Optional)**

To make services start automatically on system reboot:

### Create systemd services:

1. **Backend Service** (`/etc/systemd/system/gouraan-backend.service`):
```ini
[Unit]
Description=GoUraan Backend API
After=network.target docker.service

[Service]
Type=simple
User=erp
WorkingDirectory=/home/erp/CascadeProjects/GoUraan/backend
ExecStart=/home/erp/.nvm/versions/node/v22.20.0/bin/node dist/src/main.js
Restart=always

[Install]
WantedBy=multi-user.target
```

2. **Enable services**:
```bash
sudo systemctl enable gouraan-backend
sudo systemctl start gouraan-backend
```

---

## 📞 **Support**

- **GitHub**: https://github.com/codepromaxtech/GoUraan
- **Docker Hub**: https://hub.docker.com/u/codepromax24
- **Documentation**: See project README files

---

*Services Started: 2025-09-30 23:51 +06:00*
*Status: ✅ All services running in detached mode*
*Ready for testing and development!*
