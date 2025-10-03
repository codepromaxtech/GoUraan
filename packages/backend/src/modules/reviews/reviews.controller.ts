import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { UserRole, ReviewType } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity } from './entities/review.entity';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';

@ApiTags('reviews')
@Controller('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: ReviewEntity,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  @ApiResponse({ status: 409, description: 'You have already reviewed this item' })
  async create(
    @Request() req,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of reviews', type: [ReviewEntity] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReviewType })
  @ApiQuery({ name: 'itemId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'isApproved', required: false, type: Boolean })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'maxRating', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('type') type?: ReviewType,
    @Query('itemId') itemId?: string,
    @Query('userId') userId?: string,
    @Query('isApproved') isApproved?: boolean,
    @Query('minRating') minRating?: number,
    @Query('maxRating') maxRating?: number,
  ): Promise<PaginatedResult<ReviewEntity>> {
    // Convert string query params to appropriate types
    const isApprovedBool = isApproved !== undefined ? isApproved === true || isApproved === 'true' : undefined;
    const minRatingNum = minRating ? Number(minRating) : undefined;
    const maxRatingNum = maxRating ? Number(maxRating) : undefined;

    // Validate rating range if provided
    if ((minRatingNum !== undefined && isNaN(minRatingNum)) || 
        (maxRatingNum !== undefined && isNaN(maxRatingNum))) {
      throw new BadRequestException('Rating must be a number');
    }

    return this.reviewsService.findAll(
      page,
      limit,
      type,
      itemId,
      userId,
      isApprovedBool,
      minRatingNum,
      maxRatingNum,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review found', type: ReviewEntity })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string): Promise<ReviewEntity> {
    return this.reviewsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated', type: ReviewEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    // Regular users can only update their own reviews
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.reviewsService.update(id, updateReviewDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(
    @Request() req,
    @Param('id') id: string,
  ): Promise<void> {
    // Regular users can only delete their own reviews
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
    return this.reviewsService.remove(id, userId);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Toggle review approval status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review approval toggled', type: ReviewEntity })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async toggleApproval(@Param('id') id: string): Promise<ReviewEntity> {
    return this.reviewsService.toggleApproval(id);
  }

  @Post(':id/response')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HOTEL_OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Add an owner response to a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Response added', type: ReviewEntity })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async addOwnerResponse(
    @Request() req,
    @Param('id') id: string,
    @Body('response') response: string,
  ): Promise<ReviewEntity> {
    if (!response || typeof response !== 'string' || response.trim().length === 0) {
      throw new BadRequestException('Response text is required');
    }
    return this.reviewsService.addOwnerResponse(id, response, req.user.id);
  }

  @Get('item/:type/:itemId/rating')
  @ApiOperation({ summary: 'Get rating statistics for an item' })
  @ApiParam({ name: 'type', enum: ReviewType })
  @ApiParam({ name: 'itemId', description: 'ID of the item (hotel, flight, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Rating statistics',
    schema: {
      type: 'object',
      properties: {
        averageRating: { type: 'number', format: 'float', example: 4.5 },
        reviewCount: { type: 'integer', example: 42 },
      },
    },
  })
  async getItemRatingStats(
    @Param('type') type: ReviewType,
    @Param('itemId') itemId: string,
  ) {
    return this.reviewsService.getItemRatingStats(type, itemId);
  }
}
