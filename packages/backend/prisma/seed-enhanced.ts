// @ts-nocheck
import { PrismaClient, UserRole, UserStatus, Currency, Language, BookingType, BookingStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting enhanced database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('asdf@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gouraan.com' },
    update: {},
    create: {
      email: 'admin@gouraan.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loyaltyPoints: 5000,
      preferences: {
        create: {
          language: Language.EN,
          currency: Currency.USD,
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          marketingEmails: true,
        },
      },
    },
  });

  console.log('✅ Admin user created');

  // Create multiple customers
  const customers = [];
  for (let i = 1; i <= 10; i++) {
    const customerPassword = await bcrypt.hash('Customer123!', 12);
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        email: `customer${i}@example.com`,
        password: customerPassword,
        firstName: `Customer`,
        lastName: `${i}`,
        phone: `+1234567${String(i).padStart(3, '0')}`,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        loyaltyPoints: Math.floor(Math.random() * 5000),
        preferences: {
          create: {
            language: Language.EN,
            currency: Currency.USD,
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            marketingEmails: false,
          },
        },
      },
    });
    customers.push(customer);
  }

  console.log('✅ 10 Customer users created');

  // Create agents
  const agents = [];
  for (let i = 1; i <= 3; i++) {
    const agentPassword = await bcrypt.hash('Agent123!', 12);
    const agent = await prisma.user.upsert({
      where: { email: `agent${i}@gouraan.com` },
      update: {},
      create: {
        email: `agent${i}@gouraan.com`,
        password: agentPassword,
        firstName: `Agent`,
        lastName: `${i}`,
        phone: `+1234568${String(i).padStart(3, '0')}`,
        role: UserRole.AGENT,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        loyaltyPoints: 2000,
        preferences: {
          create: {
            language: Language.EN,
            currency: Currency.USD,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            marketingEmails: true,
          },
        },
      },
    });
    agents.push(agent);
  }

  console.log('✅ 3 Agent users created');

  // Create sample bookings with various statuses
  const bookingTypes = [BookingType.FLIGHT, BookingType.HOTEL, BookingType.PACKAGE, BookingType.HAJJ, BookingType.UMRAH];
  const bookingStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CANCELLED];
  const paymentStatuses = [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.REFUNDED];

  let bookingCount = 0;
  for (const customer of customers) {
    // Create 3-5 bookings per customer
    const numBookings = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numBookings; i++) {
      const bookingType = bookingTypes[Math.floor(Math.random() * bookingTypes.length)];
      const bookingStatus = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      const paymentStatus = bookingStatus === BookingStatus.CONFIRMED || bookingStatus === BookingStatus.COMPLETED 
        ? PaymentStatus.PAID 
        : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

      const amount = Math.floor(Math.random() * 2000) + 500;
      
      let bookingData = {};
      switch (bookingType) {
        case BookingType.FLIGHT:
          bookingData = {
            from: ['New York', 'London', 'Dubai', 'Singapore'][Math.floor(Math.random() * 4)],
            to: ['Paris', 'Tokyo', 'Sydney', 'Mumbai'][Math.floor(Math.random() * 4)],
            departureDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            passengers: Math.floor(Math.random() * 4) + 1,
            class: ['Economy', 'Business', 'First'][Math.floor(Math.random() * 3)],
          };
          break;
        case BookingType.HOTEL:
          bookingData = {
            hotel: ['Grand Hotel', 'Luxury Resort', 'City Inn', 'Beach Paradise'][Math.floor(Math.random() * 4)],
            location: ['Paris', 'Dubai', 'Maldives', 'Bali'][Math.floor(Math.random() * 4)],
            checkIn: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            checkOut: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            rooms: Math.floor(Math.random() * 3) + 1,
            guests: Math.floor(Math.random() * 4) + 1,
          };
          break;
        case BookingType.PACKAGE:
          bookingData = {
            package: ['Europe Tour', 'Asia Adventure', 'Beach Getaway', 'Cultural Experience'][Math.floor(Math.random() * 4)],
            duration: `${Math.floor(Math.random() * 10) + 5} days`,
            travelers: Math.floor(Math.random() * 4) + 1,
            startDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          };
          break;
        case BookingType.HAJJ:
        case BookingType.UMRAH:
          bookingData = {
            type: bookingType === BookingType.HAJJ ? 'Hajj' : 'Umrah',
            package: ['Economy', 'Standard', 'Premium', 'VIP'][Math.floor(Math.random() * 4)],
            duration: `${Math.floor(Math.random() * 20) + 10} days`,
            pilgrims: Math.floor(Math.random() * 4) + 1,
            departureDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
          };
          break;
      }

      try {
        await prisma.booking.create({
          data: {
            userId: customer.id,
            type: bookingType,
            status: bookingStatus,
            reference: `BK${Date.now()}${bookingCount++}`,
            totalAmount: amount,
            currency: Currency.USD,
            paymentStatus: paymentStatus,
            bookingData: JSON.stringify(bookingData),
            notes: `Sample booking for ${bookingType}`,
            confirmedAt: bookingStatus === BookingStatus.CONFIRMED || bookingStatus === BookingStatus.COMPLETED 
              ? new Date() 
              : null,
            cancelledAt: bookingStatus === BookingStatus.CANCELLED ? new Date() : null,
          },
        });
      } catch (error) {
        console.error(`Error creating booking: ${error.message}`);
      }
    }
  }

  console.log(`✅ ${bookingCount} Sample bookings created`);

  // Create sample notifications
  for (const customer of customers.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        userId: customer.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking Confirmed',
        message: 'Your booking has been confirmed successfully!',
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? new Date() : null,
      },
    });

    await prisma.notification.create({
      data: {
        userId: customer.id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: 'We have received your payment. Thank you!',
        isRead: Math.random() > 0.5,
        readAt: Math.random() > 0.5 ? new Date() : null,
      },
    });
  }

  console.log('✅ Sample notifications created');

  // Create sample wallet transactions
  for (const customer of customers) {
    const wallet = await prisma.wallet.upsert({
      where: { userId: customer.id },
      update: {},
      create: {
        userId: customer.id,
        balance: Math.floor(Math.random() * 1000),
        currency: Currency.USD,
      },
    });

    // Create some transactions
    const numTransactions = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numTransactions; i++) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: ['CREDIT', 'DEBIT'][Math.floor(Math.random() * 2)],
          amount: Math.floor(Math.random() * 500) + 50,
          currency: Currency.USD,
          description: ['Refund', 'Payment', 'Bonus', 'Withdrawal'][Math.floor(Math.random() * 4)],
          reference: `TXN${Date.now()}${i}`,
        },
      });
    }
  }

  console.log('✅ Wallet and transactions created');

  console.log('🎉 Enhanced database seeding completed!');
  console.log(`
  📊 Summary:
  - 1 Admin user
  - 10 Customer users
  - 3 Agent users
  - ${bookingCount} Bookings (various types and statuses)
  - Multiple notifications
  - Wallet transactions
  
  🔑 Login Credentials:
  Admin: admin@gouraan.com / asdf@1234
  Customer: customer1@example.com / Customer123!
  Agent: agent1@gouraan.com / Agent123!
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
