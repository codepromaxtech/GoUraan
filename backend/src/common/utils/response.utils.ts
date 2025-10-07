import { HttpStatus } from '@nestjs/common';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export class ResponseBuilder<T> {
  private response: ApiResponse<T> = { success: true };

  withData(data: T): this {
    this.response.data = data;
    return this;
  }

  withMessage(message: string): this {
    this.response.message = message;
    return this;
  }

  withError(error: string): this {
    this.response.success = false;
    this.response.error = error;
    return this;
  }

  withPagination(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): this {
    this.response.data = data as any;
    this.response.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    return this;
  }

  build(): ApiResponse<T> {
    return this.response;
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error<T>(message: string, error?: any): ApiResponse<T> {
    return {
      success: false,
      message,
      error: error?.message || message,
    };
  }

  static paginate<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Common response status codes
export const StatusCode = {
  OK: HttpStatus.OK,
  CREATED: HttpStatus.CREATED,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  INTERNAL_SERVER_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  SERVICE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
};
