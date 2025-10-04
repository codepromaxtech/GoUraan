export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  STAFF_FINANCE = 'STAFF_FINANCE',
  STAFF_SUPPORT = 'STAFF_SUPPORT',
  STAFF_OPERATIONS = 'STAFF_OPERATIONS'
}

export const USER_ROLES = {
  CUSTOMER: UserRole.CUSTOMER,
  AGENT: UserRole.AGENT,
  ADMIN: UserRole.ADMIN,
  STAFF_FINANCE: UserRole.STAFF_FINANCE,
  STAFF_SUPPORT: UserRole.STAFF_SUPPORT,
  STAFF_OPERATIONS: UserRole.STAFF_OPERATIONS,
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.STAFF_OPERATIONS]: 1,
  [UserRole.STAFF_SUPPORT]: 2,
  [UserRole.STAFF_FINANCE]: 3,
  [UserRole.AGENT]: 4,
  [UserRole.ADMIN]: 5,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}

export function isStaff(role: UserRole): boolean {
  return [
    UserRole.STAFF_FINANCE,
    UserRole.STAFF_SUPPORT,
    UserRole.STAFF_OPERATIONS,
  ].includes(role);
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  loyaltyPoints: number;
  isOnline: boolean;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
