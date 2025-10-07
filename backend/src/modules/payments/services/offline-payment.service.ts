import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class OfflinePaymentService {
  private readonly logger = new Logger(OfflinePaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async createBankPayment(data: {
    amount: number;
    currency: string;
    referenceNumber: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    notes?: string;
    metadata?: Record<string, any>;
    userId: string;
    orderId?: string;
  }) {
    try {
      const payment = await this.prisma.payment.create({
        data: {
          amount: data.amount,
          currency: data.currency,
          status: PaymentStatus.PENDING,
          paymentMethod: 'BANK_TRANSFER',
          referenceId: data.referenceNumber,
          userId: data.userId,
          orderId: data.orderId,
          paymentDetails: {
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            accountHolderName: data.accountHolderName,
            notes: data.notes,
          },
          metadata: data.metadata || {},
        },
      });

      // In a real application, you might want to send a notification to admin
      // to review and confirm the bank payment

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        message: 'Bank payment request created. Please wait for admin approval.',
      };
    } catch (error) {
      this.logger.error('Failed to create bank payment', error);
      throw new BadRequestException('Failed to process bank payment');
    }
  }

  async createCashPayment(data: {
    amount: number;
    currency: string;
    paymentMethod: 'CASH_ON_DELIVERY' | 'CASH_ON_PICKUP';
    referenceNumber?: string;
    collectedBy?: string;
    notes?: string;
    metadata?: Record<string, any>;
    userId: string;
    orderId?: string;
  }) {
    try {
      const payment = await this.prisma.payment.create({
        data: {
          amount: data.amount,
          currency: data.currency,
          status: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod,
          referenceId: data.referenceNumber || `CASH-${Date.now()}`,
          userId: data.userId,
          orderId: data.orderId,
          paymentDetails: {
            collectedBy: data.collectedBy || 'Not specified',
            notes: data.notes,
          },
          metadata: data.metadata || {},
        },
      });

      // For cash payments, you might want to automatically mark them as completed
      // or wait for admin confirmation based on your business logic
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        message: 'Cash payment recorded successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create cash payment', error);
      throw new BadRequestException('Failed to process cash payment');
    }
  }

  async verifyBankPayment(paymentId: string, verified: boolean, verifiedBy: string, notes?: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId, paymentMethod: 'BANK_TRANSFER' },
      });

      if (!payment) {
        throw new Error('Bank payment not found');
      }

      const updatedPayment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: verified ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          paymentDetails: {
            ...(payment.paymentDetails as Prisma.JsonObject),
            verified,
            verifiedBy,
            verifiedAt: new Date(),
            verificationNotes: notes,
          },
        },
      });

      // Trigger order fulfillment or other actions based on verification
      if (verified) {
        await this.handleSuccessfulPayment(updatedPayment);
      }

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        message: `Payment ${verified ? 'verified' : 'rejected'} successfully`,
      };
    } catch (error) {
      this.logger.error('Failed to verify bank payment', error);
      throw new BadRequestException('Failed to verify bank payment');
    }
  }

  private async handleSuccessfulPayment(payment: any) {
    // Implement logic to handle successful payment
    // This could include:
    // - Updating order status
    // - Sending confirmation emails
    // - Triggering fulfillment processes
    
    if (payment.orderId) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_RECEIVED' },
      });
    }
    
    // Add any additional post-payment processing here
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          referenceId: payment.referenceId,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          ...payment.paymentDetails,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get payment details', error);
      throw new BadRequestException('Failed to retrieve payment details');
    }
  }
}
