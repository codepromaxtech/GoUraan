import { PrismaService } from '../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: any;
  include?: any;
  select?: any;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  protected abstract readonly modelName: string;
  protected readonly logger = new Logger(this.constructor.name);
  
  constructor(protected readonly prisma: PrismaService) {}
  
  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  // Basic CRUD Operations
  async create(data: CreateDto, include?: any): Promise<T> {
    try {
      return await this.model.create({
        data,
        include,
      });
    } catch (error) {
      this.logger.error(`Error creating ${this.modelName}`, error);
      throw error;
    }
  }

  async findMany(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, where = {}, include, select, orderBy } = options;
    const skip = (page - 1) * limit;

    try {
      const [total, data] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include,
          select,
        }),
      ]);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}s`, error);
      throw error;
    }
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    try {
      return await this.model.findFirst({
        where,
        include,
      });
    } catch (error) {
      this.logger.error(
        `Error finding ${this.modelName} with criteria`,
        where,
        error,
      );
      throw error;
    }
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return this.findOne({ id }, include);
  }

  async update(id: string, data: UpdateDto, include?: any): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
        include,
      });
    } catch (error) {
      this.logger.error(`Error updating ${this.modelName} ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting ${this.modelName} ${id}`, error);
      throw error;
    }
  }

  async count(where: any = {}): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      this.logger.error(`Error counting ${this.modelName}s`, error);
      throw error;
    }
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async findMany(
    where: any = {},
    options: PaginationOptions = {},
    include?: any,
  ): Promise<PaginatedResult<ModelType<T>>> {
    const { page = 1, limit = 10, orderBy } = options;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.model.count({ where }),
      this.model.findMany({
        where,
        take: limit,
        skip,
        orderBy,
        include,
      }),
    ]);

    return {
      data: data as unknown as ModelType<T>[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(where: any, include?: any): Promise<ModelType<T> | null> {
    return (await this.model.findFirst({ where, include })) as ModelType<T>;
  }

  async findById(id: string, include?: any): Promise<ModelType<T> | null> {
    return (await this.model.findUnique({ 
      where: { id }, 
      include 
    })) as ModelType<T>;
  }

  async create(data: any, include?: any): Promise<ModelType<T>> {
    return (await this.model.create({ 
      data,
      include,
    })) as ModelType<T>;
  }

  async update(id: string, data: any, include?: any): Promise<ModelType<T>> {
    return (await this.model.update({
      where: { id },
      data,
      include,
    })) as ModelType<T>;
  }

  async delete(id: string): Promise<ModelType<T>> {
    return (await this.model.delete({
      where: { id },
    })) as ModelType<T>;
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  async count(where: any = {}): Promise<number> {
    return this.model.count({ where });
  }
}
