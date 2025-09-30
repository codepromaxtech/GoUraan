# GoUraan Docker Hub Images

## 📦 Published Images

### Backend API
**Repository**: `codepromax24/gouraan-backend`

**Available Tags**:
- `latest` - Latest stable build
- `v1.0.0` - Version 1.0.0 release
- `node22` - Built with Node.js 22 LTS

**Image Details**:
- **Base Image**: node:22-alpine
- **Size**: ~610 MB
- **Architecture**: linux/amd64
- **Build Date**: 2025-09-30
- **Node Version**: 22.20.0
- **Framework**: NestJS 10.x

**Pull Command**:
```bash
docker pull codepromax24/gouraan-backend:latest
```

**Run Command**:
```bash
docker run -d \
  --name gouraan-backend \
  -p 3001:3001 \
  -e DATABASE_URL="postgresql://postgres:password@postgres:5432/gouraan" \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-secret-key \
  codepromax24/gouraan-backend:latest
```

### Frontend Application
**Repository**: `codepromax24/gouraan-frontend`

**Available Tags**:
- `latest` - Latest stable build
- `v1.0.0` - Version 1.0.0 release
- `node22` - Built with Node.js 22 LTS

**Image Details**:
- **Base Image**: node:22-alpine
- **Size**: ~182 MB
- **Architecture**: linux/amd64
- **Build Date**: 2025-09-30
- **Node Version**: 22.20.0
- **Framework**: Next.js 14.x

**Pull Command**:
```bash
docker pull codepromax24/gouraan-frontend:latest
```

**Run Command**:
```bash
docker run -d \
  --name gouraan-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 \
  -e NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql \
  codepromax24/gouraan-frontend:latest
```

## 🚀 Quick Start with Docker Hub Images

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gouraan
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  backend:
    image: codepromax24/gouraan-backend:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@postgres:5432/gouraan
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your-super-secret-jwt-key
      NODE_ENV: production
    depends_on:
      - postgres
      - redis

  frontend:
    image: codepromax24/gouraan-frontend:latest
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
      NEXT_PUBLIC_GRAPHQL_URL: http://localhost:3001/graphql
    depends_on:
      - backend

volumes:
  postgres-data:
  redis-data:
```

Then run:
```bash
docker compose up -d
```

### Using Docker Run

```bash
# Create network
docker network create gouraan-network

# Run PostgreSQL
docker run -d \
  --name gouraan-postgres \
  --network gouraan-network \
  -e POSTGRES_DB=gouraan \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:15-alpine

# Run Redis
docker run -d \
  --name gouraan-redis \
  --network gouraan-network \
  -p 6379:6379 \
  redis:7-alpine

# Run Backend
docker run -d \
  --name gouraan-backend \
  --network gouraan-network \
  -e DATABASE_URL="postgresql://postgres:postgres123@gouraan-postgres:5432/gouraan" \
  -e REDIS_HOST=gouraan-redis \
  -e REDIS_PORT=6379 \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -p 3001:3001 \
  codepromax24/gouraan-backend:latest

# Run Frontend
docker run -d \
  --name gouraan-frontend \
  --network gouraan-network \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1 \
  -e NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql \
  -p 3000:3000 \
  codepromax24/gouraan-frontend:latest
```

## 📋 Image Specifications

### Backend Image Contents
- NestJS application (compiled TypeScript)
- Prisma ORM client
- All production dependencies
- Health check endpoints
- GraphQL API
- REST API
- Swagger documentation

### Frontend Image Contents
- Next.js application (standalone build)
- Optimized static assets
- Server-side rendering
- Client-side routing
- Responsive UI components

## 🔧 Environment Variables

### Backend Required Variables
```env
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
NODE_ENV=production
PORT=3001
```

### Frontend Required Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_APP_NAME=GoUraan
```

## 🏷️ Version Tags

### Semantic Versioning
- `latest` - Always points to the most recent stable release
- `v1.0.0` - Specific version release
- `node22` - Built with Node.js 22 LTS

### Tag Strategy
- **latest**: Production-ready, tested release
- **v1.x.x**: Semantic version tags for specific releases
- **node22**: Indicates Node.js version used

## 📊 Image Layers

### Backend Layers
1. Base: node:22-alpine (~150 MB)
2. Dependencies: npm packages (~300 MB)
3. Application: Compiled code (~50 MB)
4. Prisma: Generated client (~100 MB)
5. Configuration: Environment setup (~10 MB)

### Frontend Layers
1. Base: node:22-alpine (~150 MB)
2. Next.js: Framework and dependencies (~20 MB)
3. Application: Built pages and components (~10 MB)
4. Static: Assets and public files (~2 MB)

## 🔐 Security

### Image Security Features
- ✅ Non-root user (nestjs/nextjs)
- ✅ Alpine Linux base (minimal attack surface)
- ✅ No unnecessary packages
- ✅ Environment-based secrets
- ✅ Health checks enabled
- ✅ Read-only file system compatible

### Security Best Practices
1. Always use specific version tags in production
2. Scan images for vulnerabilities regularly
3. Use secrets management for sensitive data
4. Keep base images updated
5. Monitor container logs

## 📈 Performance

### Backend Performance
- **Startup Time**: ~5-10 seconds
- **Memory Usage**: ~200-300 MB
- **CPU Usage**: Low (idle), scales with load
- **Request Handling**: ~1000 req/sec (single instance)

### Frontend Performance
- **Startup Time**: ~2-3 seconds
- **Memory Usage**: ~100-150 MB
- **Build Size**: Optimized with standalone output
- **Page Load**: <1 second (SSR)

## 🔄 Update Strategy

### Pulling Updates
```bash
# Pull latest images
docker pull codepromax24/gouraan-backend:latest
docker pull codepromax24/gouraan-frontend:latest

# Restart containers
docker compose down
docker compose up -d
```

### Rolling Updates
```bash
# Update backend only
docker compose pull backend
docker compose up -d backend

# Update frontend only
docker compose pull frontend
docker compose up -d frontend
```

## 📞 Support

### Docker Hub
- **Backend**: https://hub.docker.com/r/codepromax24/gouraan-backend
- **Frontend**: https://hub.docker.com/r/codepromax24/gouraan-frontend

### GitHub Repository
- **Source Code**: https://github.com/codepromaxtech/GoUraan

### Documentation
- **API Docs**: http://localhost:3001/api/docs (when running)
- **GraphQL**: http://localhost:3001/graphql (when running)

---

*Last Updated: 2025-09-30 23:30 +06:00*
*Docker Hub Account: codepromax24*
*Images: Backend (610MB), Frontend (182MB)*
