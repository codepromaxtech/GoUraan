import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
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
export abstract class BaseRepository {
  protected abstract readonly modelName: string;
  protected readonly logger: Logger;
  
  constructor(protected readonly prisma: PrismaService) {
    this.logger = new Logger(`${this.constructor.name}`);
  }
  
  protected get model(): any {
    if (!this.modelName) {
      throw new Error('Model name is not defined');
    }
    const model = (this.prisma as any)[this.modelName];
    if (!model) {
      throw new Error(`Model ${this.modelName} not found in Prisma client`);
    }
    return model;
  }

  // Basic CRUD Operations
  async create<T = any>(data: any, include?: any): Promise<T> {
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

  async findMany<T = any>(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const { 
      page = 1, 
      limit = 10, 
      where = {}, 
      include, 
      select, 
      orderBy 
    } = options;
    
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

  async findOne<T = any>(where: any, include?: any): Promise<T | null> {
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

  async findById<T = any>(id: string, include?: any): Promise<T> {
    return this.findOne({ id }, include);
  }

  async update<T = any>(id: string, data: any, include?: any): Promise<T> {
    const existing = await this.findOne({ id });
    if (!existing) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
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

  async delete<T = any>(id: string): Promise<T> {
    const existing = await this.findOne({ id });
    if (!existing) {
      throw new NotFoundException(`${this.modelName} with ID ${id} not found`);
    }
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
}
