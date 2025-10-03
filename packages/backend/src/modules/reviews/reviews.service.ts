import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException,
  ConflictException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewEntity } from './entities/review.entity';
import { Prisma, ReviewType } from '@prisma/client';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new review
   */
  async create(userId: string, createReviewDto: CreateReviewDto): Promise<ReviewEntity> {
    try {
      // Check if user has already reviewed this item
      const existingReview = await this.prisma.review.findFirst({
        where: {
          userId,
          type: createReviewDto.type,
          itemId: createReviewDto.itemId,
        },
      });

      if (existingReview) {
        throw new ConflictException('You have already reviewed this item');
      }

      // Check if the item exists (hotel, flight, etc.)
      await this.validateItemExists(createReviewDto.type, createReviewDto.itemId);

      const review = await this.prisma.review.create({
        data: {
          ...createReviewDto,
          userId,
          isApproved: false, // New reviews require approval by default
        },
      });

      // Update the item's average rating (e.g., hotel, flight)
      await this.updateItemRating(createReviewDto.type, createReviewDto.itemId);

      this.logger.log(`Review created: ${review.id}`);
      return new ReviewEntity(review);
    } catch (error) {
      this.handleError(error, 'Failed to create review');
    }
  }

  /**
   * Find all reviews with pagination and filtering
   */
  async findAll(
    page = 1,
    limit = 10,
    type?: ReviewType,
    itemId?: string,
    userId?: string,
    isApproved?: boolean,
    minRating?: number,
    maxRating?: number,
  ): Promise<PaginatedResult<ReviewEntity>> {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Limit page size to 100

    const where: Prisma.ReviewWhereInput = {};
    
    if (type) where.type = type;
    if (itemId) where.itemId = itemId;
    if (userId) where.userId = userId;
    if (isApproved !== undefined) where.isApproved = isApproved;
    
    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    try {
      const [total, items] = await Promise.all([
        this.prisma.review.count({ where }),
        this.prisma.review.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        }),
      ]);

      return {
        data: items.map(review => new ReviewEntity(review)),
        meta: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      this.handleError(error, 'Failed to retrieve reviews');
    }
  }

  /**
   * Find a review by ID
   */
  async findOne(id: string): Promise<ReviewEntity> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      return new ReviewEntity(review);
    } catch (error) {
      this.handleError(error, `Failed to retrieve review ${id}`);
    }
  }

  /**
   * Update a review
   */
  async update(
    id: string, 
    updateReviewDto: UpdateReviewDto,
    userId?: string
  ): Promise<ReviewEntity> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      // Only the review owner or admin can update
      if (userId && review.userId !== userId) {
        throw new BadRequestException('You are not authorized to update this review');
      }

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
      });

      // Update the item's average rating if rating was changed
      if (updateReviewDto.rating !== undefined) {
        await this.updateItemRating(review.type, review.itemId);
      }

      this.logger.log(`Review updated: ${id}`);
      return new ReviewEntity(updatedReview);
    } catch (error) {
      this.handleError(error, `Failed to update review ${id}`);
    }
  }

  /**
   * Remove a review
   */
  async remove(id: string, userId?: string): Promise<void> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      // Only the review owner or admin can delete
      if (userId && review.userId !== userId) {
        throw new BadRequestException('You are not authorized to delete this review');
      }

      await this.prisma.review.delete({
        where: { id },
      });

      // Update the item's average rating
      await this.updateItemRating(review.type, review.itemId);

      this.logger.log(`Review deleted: ${id}`);
    } catch (error) {
      this.handleError(error, `Failed to delete review ${id}`);
    }
  }

  /**
   * Toggle review approval status
   */
  async toggleApproval(id: string): Promise<ReviewEntity> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: { 
          isApproved: !review.isApproved,
          // If approving, also set as featured if it has a high rating
          ...(review.rating >= 4 && !review.isApproved 
            ? { isFeatured: true } 
            : {}
          ),
        },
      });

      // Update the item's average rating if approval status changed
      await this.updateItemRating(review.type, review.itemId);

      this.logger.log(`Review ${id} approval toggled to: ${updatedReview.isApproved}`);
      return new ReviewEntity(updatedReview);
    } catch (error) {
      this.handleError(error, `Failed to toggle approval for review ${id}`);
    }
  }

  /**
   * Add an owner response to a review
   */
  async addOwnerResponse(
    id: string, 
    response: string,
    userId: string
  ): Promise<ReviewEntity> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      // In a real app, verify that the user is the owner of the item being reviewed
      // This would involve checking if the user owns the hotel/flight/etc.
      // For now, we'll just log the user ID for reference
      this.logger.debug(`Owner response added by user ${userId} to review ${id}`);

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: { 
          ownerResponse: response,
          ownerResponseDate: new Date(),
        },
      });

      return new ReviewEntity(updatedReview);
    } catch (error) {
      this.handleError(error, `Failed to add owner response to review ${id}`);
    }
  }

  /**
   * Get average rating and count for an item
   */
  async getItemRatingStats(type: ReviewType, itemId: string) {
    try {
      const result = await this.prisma.review.aggregate({
        where: { 
          type,
          itemId,
          isApproved: true, // Only count approved reviews
        },
        _avg: { rating: true },
        _count: true,
      });

      return {
        averageRating: result._avg.rating || 0,
        reviewCount: result._count,
      };
    } catch (error) {
      this.logger.error(
        `Error getting rating stats for ${type} ${itemId}: ${error.message}`,
        error.stack
      );
      return { averageRating: 0, reviewCount: 0 };
    }
  }

  /**
   * Update the average rating for an item
   */
  private async updateItemRating(type: ReviewType, itemId: string): Promise<void> {
    try {
      const { averageRating, reviewCount } = await this.getItemRatingStats(type, itemId);
      
      // Update the item's rating in the appropriate table
      switch (type) {
        case 'HOTEL':
          await this.prisma.hotel.update({
            where: { id: itemId },
            data: {
              averageRating,
              reviewCount,
            },
          });
          break;
        case 'FLIGHT':
          // Update flight rating if needed
          break;
        // Add more cases for other review types
      }
    } catch (error) {
      this.logger.error(
        `Error updating rating for ${type} ${itemId}: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Validate that the item being reviewed exists
   */
  private async validateItemExists(type: ReviewType, itemId: string): Promise<void> {
    try {
      switch (type) {
        case 'HOTEL':
          const hotel = await this.prisma.hotel.findUnique({
            where: { id: itemId },
          });
          if (!hotel) {
            throw new NotFoundException(`Hotel with ID ${itemId} not found`);
          }
          break;
        case 'FLIGHT':
          // Validate flight exists
          break;
        // Add more cases for other review types
        default:
          throw new BadRequestException(`Invalid review type: ${type}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Invalid ${type.toLowerCase()} ID`);
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: any, defaultMessage: string): never {
    this.logger.error(`${defaultMessage}: ${error.message}`, error.stack);
    
    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ConflictException
    ) {
      throw error;
    }
    
    throw new InternalServerErrorException(defaultMessage);
  }
}
