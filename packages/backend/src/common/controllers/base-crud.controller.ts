import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseCrudService } from '../services/base-crud.service';
import { ResponseBuilder } from '../utils/response.utils';
import { PaginationOptions } from '../repositories/base.repository';

export abstract class BaseCrudController<
  T,
  CreateDto,
  UpdateDto,
  FilterDto = any,
> {
  protected abstract readonly service: BaseCrudService<T, CreateDto, UpdateDto>;
  protected abstract readonly modelName: string;

  @Get()
  @ApiOperation({ summary: `Get all ${this.modelName}s` })
  @ApiResponse({ status: 200, description: 'Return all items' })
  async findAll(
    @Query() filter: FilterDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
  ) {
    const options: PaginationOptions = {
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 10, 100),
      orderBy: sort ? this.parseSortQuery(sort) : undefined,
    };

    const result = await this.service.findAll(filter, options);
    return new ResponseBuilder()
      .withData(result.data)
      .withPagination(
        result.data,
        result.meta.total,
        result.meta.page,
        result.meta.limit,
      )
      .build();
  }

  @Get(':id')
  @ApiOperation({ summary: `Get ${this.modelName} by ID` })
  @ApiResponse({ status: 200, description: 'Return item by ID' })
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    return new ResponseBuilder().withData(item).build();
  }

  @Post()
  @ApiOperation({ summary: `Create a new ${this.modelName}` })
  @ApiResponse({ status: 201, description: 'The item has been successfully created' })
  async create(@Body() createDto: CreateDto) {
    const item = await this.service.create(createDto);
    return new ResponseBuilder()
      .withData(item)
      .withMessage(`${this.modelName} created successfully`)
      .build();
  }

  @Put(':id')
  @ApiOperation({ summary: `Update ${this.modelName}` })
  @ApiResponse({ status: 200, description: 'The item has been successfully updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    const item = await this.service.update(id, updateDto);
    return new ResponseBuilder()
      .withData(item)
      .withMessage(`${this.modelName} updated successfully`)
      .build();
  }

  @Delete(':id')
  @ApiOperation({ summary: `Delete ${this.modelName}` })
  @ApiResponse({ status: 200, description: 'The item has been successfully deleted' })
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return new ResponseBuilder()
      .withMessage(`${this.modelName} deleted successfully`)
      .build();
  }

  private parseSortQuery(sort: string): Record<string, 'asc' | 'desc'> {
    const [field, order] = sort.split(':');
    return { [field]: order === 'desc' ? 'desc' : 'asc' };
  }
}
