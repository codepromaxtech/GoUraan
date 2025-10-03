import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { PrismaModule } from '../src/common/prisma/prisma.module';

let app: INestApplication;
let prisma: PrismaService;

const testUser = {
  email: 'test@example.com',
  password: 'Test@123',
  firstName: 'Test',
  lastName: 'User',
  role: 'CUSTOMER',
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
  return prisma.user.create({
    data: {
      ...testUser,
      password: await require('bcryptjs').hash(testUser.password, 12),
      status: 'ACTIVE',
      emailVerified: true,
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
