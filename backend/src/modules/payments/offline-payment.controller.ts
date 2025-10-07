import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OfflinePaymentService } from './services/offline-payment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';

class CreateBankPaymentDto {
  amount: number;
  currency: string;
  referenceNumber: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  notes?: string;
  orderId?: string;
}

class CreateCashPaymentDto {
  amount: number;
  currency: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'CASH_ON_PICKUP';
  referenceNumber?: string;
  collectedBy?: string;
  notes?: string;
  orderId?: string;
}

class VerifyBankPaymentDto {
  verified: boolean;
  verifiedBy: string;
  notes?: string;
}

@ApiTags('payments/offline')
@Controller('payments/offline')
export class OfflinePaymentController {
  constructor(private readonly offlinePaymentService: OfflinePaymentService) {}

  @Post('bank')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new bank transfer payment' })
  @ApiResponse({ status: 201, description: 'Bank payment request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createBankPayment(@Body() data: CreateBankPaymentDto, @Req() req) {
    return this.offlinePaymentService.createBankPayment({
      ...data,
      userId: req.user.id,
    });
  }

  @Post('cash')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new cash payment' })
  @ApiResponse({ status: 201, description: 'Cash payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createCashPayment(@Body() data: CreateCashPaymentDto, @Req() req) {
    return this.offlinePaymentService.createCashPayment({
      ...data,
      userId: req.user.id,
    });
  }

  @Post('verify-bank/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a bank payment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bank payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment or verification data' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async verifyBankPayment(
    @Param('paymentId') paymentId: string,
    @Body() data: VerifyBankPaymentDto,
    @Req() req,
  ) {
    return this.offlinePaymentService.verifyBankPayment(
      paymentId,
      data.verified,
      data.verifiedBy || req.user.email,
      data.notes,
    );
  }

  @Get(':paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentDetails(@Param('paymentId') paymentId: string) {
    return this.offlinePaymentService.getPaymentDetails(paymentId);
  }
}
