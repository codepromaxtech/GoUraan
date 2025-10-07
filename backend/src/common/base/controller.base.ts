import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseService } from './service.base';
import { PaginationOptions } from './repository.base';

export class BaseController<T, CreateDto, UpdateDto> {
  protected readonly modelName: string;
  
  constructor(protected readonly service: BaseService<T, CreateDto, UpdateDto>) {}

  @Get()
  @ApiOperation({ summary: `Get all ${this.modelName}s` })
  @ApiResponse({ status: 200, description: 'Return all items' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
  ) {
    const options: PaginationOptions = {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      orderBy: sort ? this.parseSortQuery(sort) : undefined,
    };

    const result = await this.service.findAll(options);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: `Get ${this.modelName} by ID` })
  @ApiResponse({ status: 200, description: 'Return item by ID' })
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return {
      success: true,
      data: item,
    };
  }

  @Post()
  @ApiOperation({ summary: `Create a new ${this.modelName}` })
  @ApiResponse({ status: 201, description: 'The item has been successfully created' })
  async create(@Body() createDto: CreateDto) {
    const item = await this.service.create(createDto);
    return {
      success: true,
      data: item,
      message: `${this.modelName} created successfully`,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: `Update ${this.modelName}` })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    const item = await this.service.update(id, updateDto);
    return {
      success: true,
      data: item,
      message: `${this.modelName} updated successfully`,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: `Delete ${this.modelName}` })
  @ApiResponse({ status: 200, description: 'The item has been successfully deleted' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: `${this.modelName} deleted successfully`,
    };
  }

  private parseSortQuery(sort: string): Record<string, 'asc' | 'desc'> {
    const [field, order] = sort.split(':');
    return { [field]: order === 'desc' ? 'desc' : 'asc' };
  }
}
