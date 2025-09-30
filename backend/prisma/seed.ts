import { PrismaClient, UserRole, UserStatus, Currency, Language } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
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
      preferences: {
        create: {
          language: Language.EN,
          currency: Currency.USD,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          marketingEmails: true,
        },
      },
    },
  });

  // Create sample customer
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      loyaltyPoints: 1000,
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
      wallet: {
        create: {
          balance: 500.0,
          currency: Currency.USD,
        },
      },
    },
  });

  // Create sample agent
  const agentPassword = await bcrypt.hash('Agent123!', 12);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@gouraan.com' },
    update: {},
    create: {
      email: 'agent@gouraan.com',
      password: agentPassword,
      firstName: 'Travel',
      lastName: 'Agent',
      phone: '+1234567891',
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      preferences: {
        create: {
          language: Language.EN,
          currency: Currency.USD,
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
        },
      },
      agentProfile: {
        create: {
          companyName: 'Travel Pro Agency',
          licenseNumber: 'TPA-2024-001',
          commissionRate: 0.08,
          isVerified: true,
        },
      },
    },
  });

  // Create sample airlines
  const airlines = [
    { code: 'EK', name: 'Emirates', country: 'UAE' },
    { code: 'QR', name: 'Qatar Airways', country: 'Qatar' },
    { code: 'TK', name: 'Turkish Airlines', country: 'Turkey' },
    { code: 'SV', name: 'Saudi Arabian Airlines', country: 'Saudi Arabia' },
    { code: 'BG', name: 'Biman Bangladesh Airlines', country: 'Bangladesh' },
  ];

  for (const airline of airlines) {
    await prisma.airline.upsert({
      where: { code: airline.code },
      update: {},
      create: airline,
    });
  }

  // Create sample airports
  const airports = [
    { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', timezone: 'Asia/Dhaka' },
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
    { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
    { code: 'MED', name: 'Prince Mohammad Bin Abdulaziz Airport', city: 'Madinah', country: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  ];

  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      update: {},
      create: airport,
    });
  }

  // Create sample travel packages
  const packages = [
    {
      name: 'Premium Hajj Package 2024',
      slug: 'premium-hajj-package-2024',
      description: 'Complete Hajj experience with 5-star accommodations near Haram Sharif',
      shortDescription: 'Premium Hajj package with luxury accommodations',
      type: 'HAJJ',
      category: 'RELIGIOUS',
      basePrice: 4500,
      currency: Currency.USD,
      duration: 21,
      maxTravelers: 50,
      minTravelers: 1,
      destinations: ['Makkah', 'Madinah', 'Mina', 'Arafat', 'Muzdalifah'],
      inclusions: [
        'Round-trip flights',
        '5-star hotel accommodation',
        'All meals included',
        'Guided religious tours',
        'Visa processing',
        '24/7 support',
        'Transportation',
        'Religious guidance'
      ],
      exclusions: [
        'Personal expenses',
        'Shopping',
        'Additional tours',
        'Travel insurance'
      ],
      itinerary: {
        days: [
          {
            day: 1,
            title: 'Arrival in Jeddah',
            description: 'Arrival at King Abdulaziz International Airport, transfer to Makkah',
            activities: ['Airport pickup', 'Hotel check-in', 'Orientation'],
            meals: ['Dinner']
          },
          {
            day: 2,
            title: 'First Umrah',
            description: 'Perform your first Umrah with guided assistance',
            activities: ['Umrah rituals', 'Tawaf', 'Sa\'i', 'Hair cutting/trimming'],
            meals: ['Breakfast', 'Lunch', 'Dinner']
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3'
      ],
      availableFrom: new Date('2024-06-01'),
      availableTo: new Date('2024-08-31'),
      metaTitle: 'Premium Hajj Package 2024 - GoUraan',
      metaDescription: 'Book your premium Hajj package with 5-star accommodations and complete guidance'
    },
    {
      name: 'Luxury Umrah Package',
      slug: 'luxury-umrah-package',
      description: 'Spiritual journey with premium services and comfort throughout your stay',
      shortDescription: 'Luxury Umrah package with premium services',
      type: 'UMRAH',
      category: 'RELIGIOUS',
      basePrice: 1800,
      currency: Currency.USD,
      duration: 10,
      maxTravelers: 30,
      minTravelers: 1,
      destinations: ['Makkah', 'Madinah'],
      inclusions: [
        'Round-trip flights',
        '4-star hotel accommodation',
        'Daily breakfast',
        'Airport transfers',
        'Visa processing',
        'Religious guide',
        'Group tours'
      ],
      exclusions: [
        'Lunch and dinner',
        'Personal expenses',
        'Shopping',
        'Travel insurance'
      ],
      itinerary: {
        days: [
          {
            day: 1,
            title: 'Arrival in Jeddah',
            description: 'Welcome to the holy land',
            activities: ['Airport pickup', 'Transfer to Makkah', 'Hotel check-in'],
            meals: ['Breakfast']
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3'
      ],
      availableFrom: new Date('2024-01-01'),
      availableTo: new Date('2024-12-31'),
      metaTitle: 'Luxury Umrah Package - GoUraan',
      metaDescription: 'Experience a spiritual journey with our luxury Umrah package'
    }
  ];

  for (const pkg of packages) {
    await prisma.travelPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  // Create system configurations
  const configs = [
    {
      key: 'site_settings',
      value: {
        siteName: 'GoUraan',
        siteDescription: 'Your trusted travel partner for spiritual journeys',
        contactEmail: 'info@gouraan.com',
        supportPhone: '+880-1234-567890',
        address: '123 Travel Street, Dhaka 1000, Bangladesh'
      },
      description: 'General site settings'
    },
    {
      key: 'payment_settings',
      value: {
        enabledGateways: ['stripe', 'paypal', 'sslcommerz'],
        defaultCurrency: 'USD',
        allowedCurrencies: ['USD', 'BDT', 'SAR', 'EUR']
      },
      description: 'Payment gateway settings'
    },
    {
      key: 'booking_settings',
      value: {
        bookingExpiryMinutes: 30,
        maxAdvanceBookingDays: 365,
        minAdvanceBookingHours: 24,
        cancellationPolicyHours: 24
      },
      description: 'Booking related settings'
    }
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`👤 Admin user: admin@gouraan.com (password: Admin123!)`);
  console.log(`👤 Customer user: customer@example.com (password: Customer123!)`);
  console.log(`👤 Agent user: agent@gouraan.com (password: Agent123!)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
