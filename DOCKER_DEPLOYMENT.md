# 🐳 GoUraan - Docker Deployment Guide

## 📦 Docker Images

### Available on Docker Hub
- **Backend**: `codepromax24/gouraan-backend:latest`
- **Frontend**: `codepromax24/gouraan-frontend:latest`

### Image Details
```
Backend:
- Base: node:22-alpine
- Size: ~610 MB
- Framework: NestJS 10
- Features: REST API, GraphQL, Prisma ORM, JWT Auth

Frontend:
- Base: node:22-alpine  
- Size: ~183 MB
- Framework: Next.js 14
- Features: SSR, App Router, Tailwind CSS
```

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/codepromaxtech/GoUraan.git
cd GoUraan

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Using Docker Hub Images

```bash
# Pull images
docker pull codepromax24/gouraan-backend:latest
docker pull codepromax24/gouraan-frontend:latest

# Run with docker compose
docker compose up -d
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/gouraan
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=production
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_APP_NAME=GoUraan
```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application |
| Backend | 3001 | NestJS API server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache & sessions |

## 🔑 Default Credentials

```
Admin:
  Email: admin@gouraan.com
  Password: asdf@1234

Customer:
  Email: customer1@example.com
  Password: Customer123!

Agent:
  Email: agent1@gouraan.com
  Password: Agent123!
```

## 📝 Sample Data

The database is pre-seeded with:
- 1 Admin user
- 10 Customer users
- 3 Agent users
- 37+ Bookings (various types and statuses)
- Notifications
- Wallet transactions

## 🌐 Access URLs

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3001/api/v1
Swagger Docs: http://localhost:3001/api/docs
GraphQL:      http://localhost:3001/graphql
Admin Panel:  http://localhost:3000/admin
```

## 🔄 Update & Redeploy

```bash
# Pull latest images
docker compose pull

# Restart services
docker compose down
docker compose up -d

# View logs
docker compose logs -f
```

## 🛠️ Development

### Build Images Locally

```bash
# Build all images
docker compose build

# Build specific service
docker compose build backend
docker compose build frontend

# Build without cache
docker compose build --no-cache
```

### Run Migrations

```bash
# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Seed database
docker compose exec backend npx tsx prisma/seed-enhanced.ts
```

## 📈 Monitoring

### Check Service Health

```bash
# Check all services
docker compose ps

# Check logs
docker compose logs backend
docker compose logs frontend

# Check backend health
curl http://localhost:3001/api/v1/health
```

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## 🔐 Security

### Production Deployment

1. **Change default passwords**
2. **Update JWT secrets**
3. **Use strong database passwords**
4. **Enable HTTPS/SSL**
5. **Configure firewall rules**
6. **Set up monitoring**

### Environment Variables (Production)

```env
# Backend
DATABASE_URL=postgresql://user:strong-password@host:5432/gouraan
JWT_SECRET=generate-strong-random-secret-256-bits
JWT_REFRESH_SECRET=generate-another-strong-secret
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

## 🚀 Cloud Deployment

### AWS ECS/Fargate

```bash
# Tag images for ECR
docker tag gouraan-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/gouraan-backend:latest
docker tag gouraan-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/gouraan-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/gouraan-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/gouraan-frontend:latest
```

### Google Cloud Run

```bash
# Tag for GCR
docker tag gouraan-backend:latest gcr.io/<project-id>/gouraan-backend:latest
docker tag gouraan-frontend:latest gcr.io/<project-id>/gouraan-frontend:latest

# Push to GCR
docker push gcr.io/<project-id>/gouraan-backend:latest
docker push gcr.io/<project-id>/gouraan-frontend:latest
```

### DigitalOcean

```bash
# Tag for DOCR
docker tag gouraan-backend:latest registry.digitalocean.com/<registry>/gouraan-backend:latest
docker tag gouraan-frontend:latest registry.digitalocean.com/<registry>/gouraan-frontend:latest

# Push to DOCR
docker push registry.digitalocean.com/<registry>/gouraan-backend:latest
docker push registry.digitalocean.com/<registry>/gouraan-frontend:latest
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend

# Check if ports are in use
sudo lsof -i :3001
sudo lsof -i :3000

# Restart services
docker compose restart
```

### Database connection issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Verify connection
docker compose exec backend npx prisma db pull
```

### Reset everything

```bash
# Stop and remove all containers
docker compose down -v

# Remove images
docker rmi gouraan-backend gouraan-frontend

# Rebuild and start
docker compose build --no-cache
docker compose up -d
```

## 📞 Support

- **GitHub**: https://github.com/codepromaxtech/GoUraan
- **Docker Hub**: https://hub.docker.com/u/codepromax24
- **Email**: support@gouraan.com

---

*Last Updated: 2025-10-01*
*Version: 1.0.0*
*Docker Images: Backend (610MB), Frontend (183MB)*
