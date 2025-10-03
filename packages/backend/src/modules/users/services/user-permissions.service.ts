import { Injectable } from '@nestjs/common';
import { PERMISSIONS, ROLE_PERMISSIONS, Permission } from '../../config/permissions.config';
import { USER_ROLES, UserRole } from '../../../frontend/src/app/models/user.model';

export interface UserWithPermissions {
  id: string;
  roles: UserRole[];
  permissions: Set<Permission>;
}

@Injectable()
export class UserPermissionsService {
  /**
   * Get all permissions for a set of roles
   */
  getPermissionsForRoles(roles: UserRole[]): Set<Permission> {
    const permissions = new Set<Permission>();
    
    // Add permissions from each role
    for (const role of roles) {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => permissions.add(permission));
    }
    
    return permissions;
  }

  /**
   * Check if a user has a specific permission
   */
  hasPermission(user: UserWithPermissions, permission: Permission): boolean {
    // Super admin has all permissions
    if (user.roles.includes(USER_ROLES.SUPER_ADMIN)) {
      return true;
    }
    
    return user.permissions.has(permission);
  }

  /**
   * Check if a user has all of the specified permissions
   */
  hasAllPermissions(user: UserWithPermissions, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if a user has any of the specified permissions
   */
  hasAnyPermission(user: UserWithPermissions, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Get a user's permissions as an array of strings
   */
  getUserPermissions(user: UserWithPermissions): string[] {
    return Array.from(user.permissions);
  }

  /**
   * Check if a user has a specific role
   */
  hasRole(user: UserWithPermissions, role: UserRole): boolean {
    return user.roles.includes(role);
  }

  /**
   * Check if a user has any of the specified roles
   */
  hasAnyRole(user: UserWithPermissions, roles: UserRole[]): boolean {
    return user.roles.some(role => roles.includes(role));
  }

  /**
   * Get all available roles
   */
  getAllRoles(): { id: string; name: string; description: string }[] {
    return [
      {
        id: USER_ROLES.CUSTOMER,
        name: 'Customer',
        description: 'Can book flights, hotels, and manage their own bookings',
      },
      {
        id: USER_ROLES.TRAVEL_AGENT,
        name: 'Travel Agent',
        description: 'Can create package deals and access wholesale rates',
      },
      {
        id: USER_ROLES.FINANCE_STAFF,
        name: 'Finance Staff',
        description: 'Can manage invoices, process refunds, and view financial reports',
      },
      {
        id: USER_ROLES.SUPPORT_STAFF,
        name: 'Support Staff',
        description: 'Can manage support tickets and chat with customers',
      },
      {
        id: USER_ROLES.OPERATIONS_STAFF,
        name: 'Operations Staff',
        description: 'Can manage Hajj/Umrah packages and confirm manual bookings',
      },
      {
        id: USER_ROLES.ADMIN,
        name: 'Administrator',
        description: 'Full access to all features except system settings',
      },
      {
        id: USER_ROLES.SUPER_ADMIN,
        name: 'Super Administrator',
        description: 'Full access to all features including system settings',
      },
    ];
  }
}
