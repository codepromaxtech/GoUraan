-- Initialize GoUraan Database
-- This script sets up the initial database configuration

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what might be needed

-- Set timezone
SET timezone = 'UTC';

-- Create initial admin user (password: Admin123!)
-- This will be handled by the application seeding process

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'GoUraan database initialized successfully';
END $$;
