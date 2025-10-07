import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../repositories/base.repository';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { PaginationOptions } from '../repositories/base.repository';

@Injectable()
export abstract class BaseCrudService<T, CreateDto, UpdateDto> {
  protected readonly logger: Logger;
  protected abstract readonly repository: BaseRepository<any>;
  protected abstract readonly modelName: string;

  constructor() {
    this.logger = new Logger(`${this.modelName}Service`);
  }

  async findAll(
    where: any = {},
    options: PaginationOptions = {},
    include?: any,
  ): Promise<PaginatedResult<T>> {
    try {
      return await this.repository.findMany(where, options, include);
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}s`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, include?: any): Promise<T> {
    const item = await this.repository.findById(id, include);
    if (!item) {
      throw new NotFoundException(`${this.modelName} not found`);
    }
    return item as T;
  }

  async create(createDto: CreateDto, include?: any): Promise<T> {
    try {
      return (await this.repository.create(createDto, include)) as T;
    } catch (error) {
      this.logger.error(
        `Error creating ${this.modelName}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateDto, include?: any): Promise<T> {
    await this.findOne(id); // Check if exists
    try {
      return (await this.repository.update(id, updateDto, include)) as T;
    } catch (error) {
      this.logger.error(
        `Error updating ${this.modelName} ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check if exists
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error(
        `Error deleting ${this.modelName} ${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async exists(where: any): Promise<boolean> {
    return this.repository.exists(where);
  }

  async count(where: any = {}): Promise<number> {
    return this.repository.count(where);
  }
}
