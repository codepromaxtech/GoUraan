import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { PrismaModule } from '../src/common/prisma/prisma.module';
import { UserRole, UserStatus } from '@prisma/client';

let app: INestApplication;
let prisma: PrismaService;

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
}

const testUser: TestUser = {
  email: 'test@example.com',
  password: 'Test@123',
  firstName: 'Test',
  lastName: 'User',
  role: UserRole.CUSTOMER,
  status: UserStatus.ACTIVE,
  emailVerified: true,
};

const setupTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  prisma = moduleFixture.get<PrismaService>(PrismaService);
  await prisma.cleanDatabase();
  
  return { app, prisma };
};

const createTestUser = async (prisma: PrismaService) => {
  const { password, ...userData } = testUser;
  return prisma.user.create({
    data: {
      ...userData,
      password: await require('bcryptjs').hash(password, 12),
    },
  });
};

export { setupTestApp, createTestUser, testUser };

global.beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [PrismaModule],
  }).compile();

  const prisma = moduleFixture.get<PrismaService>(PrismaService);
  await prisma.$connect();
  await prisma.cleanDatabase();
  await prisma.$disconnect();
});

global.afterAll(async () => {
  if (app) {
    await app.close();
  }
});
