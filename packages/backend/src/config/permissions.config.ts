// Define all possible permissions in the system
export const PERMISSIONS = {
  // Customer permissions
  BOOK_FLIGHT: 'book_flight',
  BOOK_HOTEL: 'book_hotel',
  BOOK_PACKAGE: 'book_package',
  MANAGE_BOOKINGS: 'manage_bookings',
  EARN_LOYALTY_POINTS: 'earn_loyalty_points',
  DOWNLOAD_DOCUMENTS: 'download_documents',
  
  // Travel Agent permissions
  ACCESS_WHOLESALE_RATES: 'access_wholesale_rates',
  CREATE_PACKAGE_DEALS: 'create_package_deals',
  VIEW_COMMISSION_REPORTS: 'view_commission_reports',
  MANAGE_AGENT_CUSTOMERS: 'manage_agent_customers',
  
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_BOOKINGS: 'manage_bookings',
  MANAGE_FLIGHTS: 'manage_flights',
  MANAGE_HOTELS: 'manage_hotels',
  MANAGE_PACKAGES: 'manage_packages',
  MANAGE_OFFERS: 'manage_offers',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  
  // Finance Staff permissions
  MANAGE_INVOICES: 'manage_invoices',
  PROCESS_REFUNDS: 'process_refunds',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  
  // Support Staff permissions
  MANAGE_TICKETS: 'manage_tickets',
  LIVE_CHAT_SUPPORT: 'live_chat_support',
  
  // Operations Staff permissions
  MANUAL_BOOKING_CONFIRMATION: 'manual_booking_confirmation',
  MANAGE_HAJJ_PACKAGES: 'manage_hajj_packages',
  MANAGE_UMRAH_PACKAGES: 'manage_umrah_packages',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role to permissions mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Customer role
  customer: [
    PERMISSIONS.BOOK_FLIGHT,
    PERMISSIONS.BOOK_HOTEL,
    PERMISSIONS.BOOK_PACKAGE,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.EARN_LOYALTY_POINTS,
    PERMISSIONS.DOWNLOAD_DOCUMENTS,
  ],
  
  // Travel Agent role
  travel_agent: [
    ...PERMISSIONS.customer,
    PERMISSIONS.ACCESS_WHOLESALE_RATES,
    PERMISSIONS.CREATE_PACKAGE_DEALS,
    PERMISSIONS.VIEW_COMMISSION_REPORTS,
    PERMISSIONS.MANAGE_AGENT_CUSTOMERS,
  ],
  
  // Admin role (super user)
  admin: [
    ...Object.values(PERMISSIONS), // Has all permissions
  ],
  
  // Finance staff role
  finance_staff: [
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.PROCESS_REFUNDS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  // Support staff role
  support_staff: [
    PERMISSIONS.MANAGE_TICKETS,
    PERMISSIONS.LIVE_CHAT_SUPPORT,
    PERMISSIONS.MANAGE_BOOKINGS, // To help with booking modifications
  ],
  
  // Operations staff role
  operations_staff: [
    PERMISSIONS.MANUAL_BOOKING_CONFIRMATION,
    PERMISSIONS.MANAGE_HAJJ_PACKAGES,
    PERMISSIONS.MANAGE_UMRAH_PACKAGES,
  ],
};

// Role hierarchy (higher roles include all permissions of lower roles)
const ROLE_HIERARCHY = [
  'customer',
  'travel_agent',
  'finance_staff',
  'support_staff',
  'operations_staff',
  'admin',
];

// Function to check if a user has a specific permission
export function hasPermission(
  userRoles: string[], 
  requiredPermission: Permission
): boolean {
  // Admin has all permissions
  if (userRoles.includes('admin')) {
    return true;
  }
  
  // Check each role the user has
  for (const role of userRoles) {
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.includes(requiredPermission)) {
      return true;
    }
    
    // Check role hierarchy
    const roleIndex = ROLE_HIERARCHY.indexOf(role);
    if (roleIndex > 0) {
      const higherRole = ROLE_HIERARCHY[roleIndex - 1];
      if (ROLE_PERMISSIONS[higherRole]?.includes(requiredPermission)) {
        return true;
      }
    }
  }
  
  return false;
}

// Function to get all permissions for a set of roles
export function getPermissionsForRoles(roles: string[]): Set<Permission> {
  const permissions = new Set<Permission>();
  
  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach(permission => permissions.add(permission));
    
    // Include permissions from lower roles in the hierarchy
    const roleIndex = ROLE_HIERARCHY.indexOf(role);
    if (roleIndex > 0) {
      for (let i = 0; i < roleIndex; i++) {
        const lowerRole = ROLE_HIERARCHY[i];
        const lowerRolePermissions = ROLE_PERMISSIONS[lowerRole] || [];
        lowerRolePermissions.forEach(permission => permissions.add(permission));
      }
    }
  }
  
  return permissions;
}
