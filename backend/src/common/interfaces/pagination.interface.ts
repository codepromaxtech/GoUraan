import { User } from '@prisma/client';

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type PaginatedUserResult = PaginatedResult<User>;
