import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { UserWithPermissions } from '../../modules/users/services/user-permissions.service';

export interface AuthenticatedRequest extends Request {
  user: UserWithPermissions;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user is admin (admins have all permissions)
    if (user.roles.some(role => role === UserRole.ADMIN)) {
      return true;
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.has(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`
      );
    }

    return true;
  }
}
