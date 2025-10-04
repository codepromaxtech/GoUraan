import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository, PaginatedResult, PaginationOptions } from './repository.base';

@Injectable()
export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected readonly logger: Logger;
  
  constructor(protected readonly repository: BaseRepository) {
    this.logger = new Logger(`${this.constructor.name}`);
  }

  async create(createDto: CreateDto, include?: any): Promise<T> {
    try {
      return await this.repository.create(createDto, include);
    } catch (error) {
      this.logger.error(`Error creating ${this.repository.modelName}`, error);
      throw error;
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    try {
      return await this.repository.findMany<T>(options);
    } catch (error) {
      this.logger.error(`Error finding all ${this.repository.modelName}s`, error);
      throw error;
    }
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    const item = await this.repository.findOne<T>(where, include);
    if (!item) {
      throw new NotFoundException(`${this.repository.modelName} not found`);
    }
    return item;
  }

  async findById(id: string, include?: any): Promise<T> {
    const item = await this.repository.findById<T>(id, include);
    if (!item) {
      throw new NotFoundException(`${this.repository.modelName} with ID "${id}" not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateDto, include?: any): Promise<T> {
    await this.findById(id); // Check if exists
    try {
      return await this.repository.update<T>(id, updateDto, include);
    } catch (error) {
      this.logger.error(`Error updating ${this.repository.modelName} ${id}`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id); // Check if exists
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting ${this.repository.modelName} ${id}`, error);
      throw error;
    }
  }

  async count(where: any = {}): Promise<number> {
    return this.repository.count(where);
  }

  async exists(where: any): Promise<boolean> {
    return this.repository.exists(where);
  }
}
