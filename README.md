# GoUraan

GoUraan is a comprehensive business solution with a modern web frontend and a robust backend API.

## Project Structure

```
GoUraan/
├── backend/          # NestJS backend application
├── frontend/         # Next.js frontend application
└── README.md         # This file
```

## Prerequisites

- Node.js >= 20.9.0
- npm >= 10.0.0
- Docker (for database)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/gouraan.git
cd gouraan
```

### 2. Install Dependencies

#### Option A: Install all dependencies (root + both projects)
```bash
npm install
```

#### Option B: Install dependencies separately
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend
1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Update the environment variables in `backend/.env` as needed.

#### Frontend
1. Copy the example environment file:
   ```bash
   cp frontend/.env.example frontend/.env
   ```
2. Update the environment variables in `frontend/.env` as needed.

### 4. Database Setup

1. Start the database using Docker:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. Run database migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## Development

### Running the Application

#### Start both backend and frontend (from root):
```bash
npm start
```

#### Start backend only:
```bash
cd backend
npm run start:dev
```

#### Start frontend only:
```bash
cd frontend
npm run dev
```

### Available Scripts (from root)

- `npm start` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend for production
- `npm test` - Run tests for both backend and frontend
- `npm run lint` - Lint both backend and frontend code
- `npm run format` - Format code using Prettier

## Deployment

### Backend

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start:prod
   ```

### Frontend

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is [UNLICENSED](LICENSE).
