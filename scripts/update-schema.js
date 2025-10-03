const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the Prisma schema file
const schemaPath = path.join(__dirname, '../packages/backend/prisma/schema.prisma');

// Read the current schema
let schema = fs.readFileSync(schemaPath, 'utf8');

// Add the new enums and models
const newContent = `
// Review System
model Review {
  id          String         @id @default(cuid())
  userId      String
  type        ReviewType
  itemId      String
  rating      Int            @default(5)
  title       String?
  content     String?
  isApproved  Boolean        @default(false)
  isFeatured  Boolean        @default(false)
  ownerResponse String?
  ownerResponseDate DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Relations
  user        User           @relation(fields: [userId], references: [id])
  booking     Booking?       @relation(fields: [bookingId], references: [id])
  bookingId   String?

  @@index([type, itemId])
  @@index([isApproved])
  @@index([isFeatured])
  @@map("reviews")
}

// Support System
model SupportTicket {
  id           String              @id @default(cuid())
  userId       String
  status       SupportTicketStatus @default(OPEN)
  priority     SupportTicketPriority @default(MEDIUM)
  category     SupportTicketCategory
  subject      String
  description  String
  assignedToId String?
  closedAt     DateTime?
  closedById   String?
  closeReason  String?
  rating       Int?
  feedback     String?
  tags         String[]
  attachments  String[]
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  // Relations
  user        User                @relation("UserTickets", fields: [userId], references: [id])
  assignedTo  User?               @relation("AssignedTickets", fields: [assignedToId], references: [id])
  closedBy    User?               @relation("ClosedTickets", fields: [closedById], references: [id])
  messages    SupportTicketMessage[]
  booking     Booking?            @relation(fields: [bookingId], references: [id])
  bookingId   String?
  payment     Payment?            @relation(fields: [paymentId], references: [id])
  paymentId   String?

  @@index([userId])
  @@index([status])
  @@index([assignedToId])
  @@index([priority])
  @@index([category])
  @@map("support_tickets")
}

model SupportTicketMessage {
  id           String        @id @default(cuid())
  ticketId     String
  userId       String
  message      String
  attachments  String[]
  isInternal   Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // Relations
  ticket      SupportTicket  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user        User           @relation(fields: [userId], references: [id])

  @@index([ticketId])
  @@index([userId])
  @@map("support_ticket_messages")
}

// Enums for Review System
enum ReviewType {
  HOTEL
  FLIGHT
  PACKAGE
  ACTIVITY
  VEHICLE
  GUIDE
  GENERAL
}

// Enums for Support System
enum SupportTicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  WAITING_THIRD_PARTY
  RESOLVED
  CLOSED
  REOPENED
}

enum SupportTicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum SupportTicketCategory {
  BOOKING
  PAYMENT
  CANCELLATION
  REFUND
  MODIFICATION
  DOCUMENT
  ACCOUNT
  GENERAL
  COMPLAINT
  COMPLIMENT
  SUGGESTION
  TECHNICAL
  OTHER
}
`;

// Append the new content to the schema
const updatedSchema = schema + newContent;

// Write the updated schema back to the file
fs.writeFileSync(schemaPath, updatedSchema, 'utf8');

console.log('✅ Schema updated successfully!');

// Run Prisma migration
try {
  console.log('🚀 Creating and applying database migration...');
  execSync('npx prisma migrate dev --name add_reviews_and_support_models', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../packages/backend')
  });
  console.log('✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Error running database migration:', error);
  process.exit(1);
}

// Generate Prisma client
try {
  console.log('🔨 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../packages/backend')
  });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}

console.log('✨ Database setup completed successfully!');
