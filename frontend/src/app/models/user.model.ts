// User roles with hierarchy (from least to most privileged)
export const USER_ROLES = {
  CUSTOMER: 'customer',
  TRAVEL_AGENT: 'travel_agent',
  FINANCE_STAFF: 'finance_staff',
  SUPPORT_STAFF: 'support_staff',
  OPERATIONS_STAFF: 'operations_staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role hierarchy for permission inheritance
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.CUSTOMER]: 0,
  [USER_ROLES.TRAVEL_AGENT]: 1,
  [USER_ROLES.FINANCE_STAFF]: 2,
  [USER_ROLES.SUPPORT_STAFF]: 2,
  [USER_ROLES.OPERATIONS_STAFF]: 2,
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.SUPER_ADMIN]: 4,
};

// Check if a user has at least the required role
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if a user has any of the required roles
export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  nationality?: string;
  documentType?: 'passport' | 'id_card' | 'driving_license';
  documentNumber?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    seatPreference?: 'window' | 'aisle' | 'middle';
    mealPreference?: 'vegetarian' | 'vegan' | 'gluten_free' | 'none';
    newsletter: boolean;
    marketing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  roles: UserRole[];
  permissions: string[]; // Cached permissions for quick access
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  profile?: UserProfile;
  bookings?: any[]; // Use specific booking type when available
  payments?: any[];  // Use specific payment type when available
  supportTickets?: any[]; // Use specific ticket type when available
}
