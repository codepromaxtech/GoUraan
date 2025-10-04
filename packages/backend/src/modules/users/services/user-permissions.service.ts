import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Service for managing user permissions and role-based access control.
 * 
 * This service provides methods to check user permissions, get permissions for roles,
 * and manage the relationship between roles and permissions.
 */

// Define local types since we can't find the shared module
type Permission = string; // Replace with actual permission type if available

// Define local constants for permissions and role permissions
// System-wide permissions
const PERMISSIONS = {
  // User management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Support tickets
  TICKET_CREATE: 'ticket:create',
  TICKET_READ: 'ticket:read',
  TICKET_UPDATE: 'ticket:update',
  TICKET_DELETE: 'ticket:delete',
  TICKET_ASSIGN: 'ticket:assign',
  TICKET_CLOSE: 'ticket:close',
  TICKET_VIEW_ALL: 'ticket:view_all',
  
    // Booking management
  BOOKING_CREATE: 'booking:create',
  BOOKING_READ: 'booking:read',
  BOOKING_UPDATE: 'booking:update',
  BOOKING_DELETE: 'booking:delete',
  BOOKING_CANCEL: 'booking:cancel',
  BOOKING_VIEW_ALL: 'booking:view_all',
  BOOKING_MANAGE_STATUS: 'booking:manage_status',
  
  // Payment management
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_READ: 'payment:read',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_DELETE: 'payment:delete',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_VIEW_ALL: 'payment:view_all',
  PAYMENT_VERIFY: 'payment:verify',
  
  // Package management (for Hajj/Umrah packages)
  PACKAGE_CREATE: 'package:create',
  PACKAGE_READ: 'package:read',
  PACKAGE_UPDATE: 'package:update',
  PACKAGE_DELETE: 'package:delete',
  PACKAGE_PUBLISH: 'package:publish',
  
  // Flight management
  FLIGHT_CREATE: 'flight:create',
  FLIGHT_READ: 'flight:read',
  FLIGHT_UPDATE: 'flight:update',
  FLIGHT_DELETE: 'flight:delete',
  FLIGHT_MANAGE_INVENTORY: 'flight:manage_inventory',
  
  // Hotel management
  HOTEL_CREATE: 'hotel:create',
  HOTEL_READ: 'hotel:read',
  HOTEL_UPDATE: 'hotel:update',
  HOTEL_DELETE: 'hotel:delete',
  HOTEL_MANAGE_ROOMS: 'hotel:manage_rooms',
  // Content management
  CONTENT_MANAGE: 'content:manage',
  CONTENT_PUBLISH: 'content:publish',
  
  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_MANAGE: 'settings:manage',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',
  
  // System
  SYSTEM_MAINTENANCE: 'system:maintenance',
  SYSTEM_LOGS_VIEW: 'system:logs_view',
  
  // Notifications
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_TEMPLATE_MANAGE: 'notification:template_manage'
} as const;

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin has all permissions
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  
  // Travel Agent permissions
  [UserRole.AGENT]: [
    // User
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    
    // Bookings
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_CANCEL,
    PERMISSIONS.BOOKING_VIEW_ALL,
    
    // Payments
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_VIEW_ALL,
    
    // Packages
    PERMISSIONS.PACKAGE_READ,
    
    // Flights
    PERMISSIONS.FLIGHT_READ,
    
    // Hotels
    PERMISSIONS.HOTEL_READ,
    
    // Tickets
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_CLOSE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  // Customer permissions
  [UserRole.CUSTOMER]: [
    // User
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    
    // Bookings
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_CANCEL,
    
    // Payments
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_READ,
    
    // Packages
    PERMISSIONS.PACKAGE_READ,
    
    // Flights
    PERMISSIONS.FLIGHT_READ,
    
    // Hotels
    PERMISSIONS.HOTEL_READ,
    
    // Tickets
    PERMISSIONS.TICKET_CREATE,
    PERMISSIONS.TICKET_READ,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_SEND,
  ],
  
  // Finance staff permissions
  [UserRole.STAFF_FINANCE]: [
    // User
    PERMISSIONS.USER_READ,
    
    // Payments
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.PAYMENT_PROCESS,
    PERMISSIONS.PAYMENT_REFUND,
    PERMISSIONS.PAYMENT_VERIFY,
    PERMISSIONS.PAYMENT_VIEW_ALL,
    
    // Bookings
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.BOOKING_MANAGE_STATUS,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.REPORTS_EXPORT,
    
    // Settings
    PERMISSIONS.SETTINGS_READ,
  ],
  
  // Support staff permissions
  [UserRole.STAFF_SUPPORT]: [
    // User
    PERMISSIONS.USER_READ,
    
    // Tickets
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
    PERMISSIONS.TICKET_ASSIGN,
    PERMISSIONS.TICKET_CLOSE,
    PERMISSIONS.TICKET_VIEW_ALL,
    
    // Bookings
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_VIEW_ALL,
    
    // Payments
    PERMISSIONS.PAYMENT_READ,
    
    // Notifications
    PERMISSIONS.NOTIFICATION_SEND,
    
    // Settings
    PERMISSIONS.SETTINGS_READ,
  ],
  
  // Operations staff permissions
  [UserRole.STAFF_OPERATIONS]: [
    // User
    PERMISSIONS.USER_READ,
    
    // Bookings
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_VIEW_ALL,
    PERMISSIONS.BOOKING_MANAGE_STATUS,
    
    // Packages
    PERMISSIONS.PACKAGE_READ,
    PERMISSIONS.PACKAGE_UPDATE,
    
    // Flights
    PERMISSIONS.FLIGHT_READ,
    PERMISSIONS.FLIGHT_UPDATE,
    PERMISSIONS.FLIGHT_MANAGE_INVENTORY,
    
    // Hotels
    PERMISSIONS.HOTEL_READ,
    PERMISSIONS.HOTEL_UPDATE,
    PERMISSIONS.HOTEL_MANAGE_ROOMS,
    
    // Content
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.CONTENT_PUBLISH,
    
    // Settings
    PERMISSIONS.SETTINGS_READ,
  ]
};

// Helper functions
const isAdmin = (role: UserRole): boolean => role === UserRole.ADMIN;
const isStaff = (role: UserRole): boolean => {
  const staffRoles = [
    UserRole.AGENT,
    UserRole.STAFF_FINANCE, 
    UserRole.STAFF_SUPPORT, 
    UserRole.STAFF_OPERATIONS
  ] as const;
  return (staffRoles as readonly string[]).includes(role);
};

const USER_ROLES = {
  ADMIN: UserRole.ADMIN,
  AGENT: UserRole.AGENT,
  CUSTOMER: UserRole.CUSTOMER,
  STAFF_FINANCE: UserRole.STAFF_FINANCE,
  STAFF_SUPPORT: UserRole.STAFF_SUPPORT,
  STAFF_OPERATIONS: UserRole.STAFF_OPERATIONS,
};

export interface UserWithPermissions {
  id: string;
  roles: UserRole[];
  permissions: Set<Permission>;
}

/**
 * Service for managing user permissions and role-based access control.
 * 
 * This service provides methods to:
 * - Check user permissions and roles
 * - Get permissions for specific roles
 * - Manage role-based access control
 * - Handle permission inheritance and overrides
 * 
 * @example
 * // Example of checking permissions in a controller
 * @Controller('bookings')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('booking:read')
 * export class BookingsController {
 *   constructor(private readonly permissionsService: UserPermissionsService) {}
 * 
 *   @Get()
 *   async findAll(@Request() req) {
 *     // User permissions are automatically checked by the PermissionsGuard
 *     return this.bookingsService.findAll();
 *   }
 * }
 */
@Injectable()
export class UserPermissionsService {
  /**
   * Get all available permissions in the system.
   * @returns Object containing all permissions grouped by category
   */
  /**
   * Get all available permissions
   */
  /**
   * Get all available permissions in the system.
   * 
   * @returns Object containing all permissions grouped by category
   * @example
   * const allPermissions = permissionsService.getAllPermissions();
   * // Returns: { USER_CREATE: 'user:create', USER_READ: 'user:read', ... }
   */
  getAllPermissions(): typeof PERMISSIONS {
    return PERMISSIONS;
  }

  /**
   * Get all permissions for a set of roles
   */
  /**
   * Get all permissions for a set of roles.
   * 
   * @param roles - Array of user roles
   * @returns Set of unique permissions that the roles have access to
   * @example
   * const permissions = permissionsService.getPermissionsForRoles([UserRole.AGENT, UserRole.STAFF_SUPPORT]);
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
   * Get permissions for a specific role.
   * @param role - The user role to get permissions for
   * @returns Array of permission strings in the format 'resource:action'
   * @example
   * // Returns ['booking:create', 'booking:read', ...]
   * getPermissionsForRole(UserRole.AGENT);
   */getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a specific role has a specific permission.
   * 
   * @param role - The role to check (e.g., UserRole.ADMIN, UserRole.AGENT)
   * @param permission - The permission to check for (format: 'resource:action')
   * @returns boolean indicating if the role has the permission
   * 
   * @example
   * // Returns true
   * roleHasPermission(UserRole.ADMIN, 'user:manage_roles');
   * // Returns false
   * roleHasPermission(UserRole.CUSTOMER, 'user:manage_roles');
   */roleHasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = this.getPermissionsForRole(role);
    return rolePermissions.includes(permission);
  }

  /**
   * Get all available roles with their descriptions and display names.
   * 
   * @returns Array of role objects with:
   * - id: The role identifier (UserRole)
   * - name: Display name of the role
   * - description: Detailed description of the role's purpose
   * 
   * @example
   * [
   *   { id: 'ADMIN', name: 'Administrator', description: 'Full system access' },
   *   { id: 'AGENT', name: 'Travel Agent', description: 'Can manage bookings and customers' }
   * ]
   */getAvailableRoles(): { id: string; name: string; description: string }[] {
    return [
      {
        id: UserRole.ADMIN,
        name: 'Administrator',
        description: 'Full access to all features and settings'
      },
      {
        id: UserRole.AGENT,
        name: 'Travel Agent',
        description: 'Can manage bookings and customers'
      },
      {
        id: UserRole.CUSTOMER,
        name: 'Customer',
        description: 'Can book flights, hotels, and manage their own bookings'
      },
      {
        id: UserRole.STAFF_FINANCE,
        name: 'Finance Staff',
        description: 'Can manage invoices, process refunds, and view financial reports'
      },
      {
        id: UserRole.STAFF_SUPPORT,
        name: 'Support Staff',
        description: 'Can manage support tickets and chat with customers'
      },
      {
        id: UserRole.STAFF_OPERATIONS,
        name: 'Operations Staff',
        description: 'Can manage Hajj/Umrah packages and confirm manual bookings'
      }
    ];
  }

  /**
   * Check if a user has a specific permission.
   * Admin users automatically have all permissions.
   * 
   * @param user - User object with roles and permissions
   * @param permission - The permission to check (format: 'resource:action')
   * @returns boolean indicating if the user has the permission
   * 
   * @example
   * // Returns true if user has the 'booking:create' permission or is an admin
   * hasPermission(user, 'booking:create');
   */hasPermission(user: UserWithPermissions, permission: Permission): boolean {
    if (user.roles.some(role => isAdmin(role))) {
      return true;
    }
    
    return user.permissions.has(permission);
  }
  /**
   * Check if a user has all of the specified permissions
   */
  /**
   * Check if a user has all of the specified permissions.
   * 
   * @param user - User object with roles and permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if the user has all permissions
   * @example
   * const hasAccess = permissionsService.hasAllPermissions(user, [
   *   'booking:read',
   *   'payment:process'
   * ]);
   */
  hasAllPermissions(user: UserWithPermissions, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if a user has any of the specified permissions
   */
  /**
   * Check if a user has any of the specified permissions.
   * 
   * @param user - User object with roles and permissions
   * @param permissions - Array of permissions to check
   * @returns boolean indicating if the user has at least one of the permissions
   * @example
   * const canAccess = permissionsService.hasAnyPermission(user, [
   *   'booking:read',
   *   'payment:process'
   * ]);
   */
  hasAnyPermission(user: UserWithPermissions, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Get a user's permissions as an array of strings
   */
  /**
   * Get all permissions for a user as an array of strings.
   * 
   * @param user - User object with roles and permissions
   * @returns Array of permission strings
   * @example
   * const permissions = permissionsService.getUserPermissions(user);
   * // Returns: ['booking:read', 'payment:process', ...]
   */
  getUserPermissions(user: UserWithPermissions): string[] {
    return Array.from(user.permissions);
  }

  /**
   * Check if a user has a specific role
   */
  /**
   * Check if a user has a specific role.
   * 
   * @param user - User object with roles and permissions
   * @param role - Role to check for
   * @returns boolean indicating if the user has the role
   * @example
   * const isAdmin = permissionsService.hasRole(user, UserRole.ADMIN);
   */
  hasRole(user: UserWithPermissions, role: UserRole): boolean {
    return user.roles.includes(role);
  }

  /**
   * Check if a user has any of the specified roles
   */
  /**
   * Check if a user has any of the specified roles.
   * 
   * @param user - User object with roles and permissions
   * @param roles - Array of roles to check for
   * @returns boolean indicating if the user has at least one of the roles
   * @example
   * const isStaff = permissionsService.hasAnyRole(user, [
   *   UserRole.STAFF_FINANCE,
   *   UserRole.STAFF_SUPPORT,
   *   UserRole.STAFF_OPERATIONS
   * ]);
   */
  hasAnyRole(user: UserWithPermissions, roles: UserRole[]): boolean {
    return user.roles.some(role => roles.includes(role));
  }

  /**
   * Get all available roles
   */
  /**
   * Get all available roles with their metadata.
   * 
   * @returns Array of role objects with id, name, and description
   * @example
   * const roles = permissionsService.getAllRoles();
   * // Returns: [
   * //   { id: 'ADMIN', name: 'Administrator', description: 'Full system access' },
   * //   { id: 'AGENT', name: 'Travel Agent', description: 'Can manage bookings' }
   * // ]
   */
  getAllRoles(): { id: string; name: string; description: string }[] {
    return [
      {
        id: USER_ROLES.CUSTOMER,
        name: 'Customer',
        description: 'Can book flights, hotels, and manage their own bookings',
      },
      {
        id: USER_ROLES.AGENT,
        name: 'Travel Agent',
        description: 'Can create package deals and access wholesale rates',
      },
      {
        id: USER_ROLES.STAFF_FINANCE,
        name: 'Finance Staff',
        description: 'Can manage invoices, process refunds, and view financial reports',
      },
      {
        id: USER_ROLES.STAFF_SUPPORT,
        name: 'Support Staff',
        description: 'Can manage support tickets and chat with customers',
      },
      {
        id: USER_ROLES.STAFF_OPERATIONS,
        name: 'Operations Staff',
        description: 'Can manage Hajj/Umrah packages and confirm manual bookings',
      },
      {
        id: USER_ROLES.ADMIN,
        name: 'Administrator',
        description: 'Full access to all features and settings',
      }
    ];
  }
}
