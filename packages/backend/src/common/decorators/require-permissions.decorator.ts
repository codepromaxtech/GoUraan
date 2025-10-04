import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from '../../modules/users/services/user-permissions.service';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export type Permission = keyof typeof PERMISSIONS;

export const RequirePermissions = (...permissions: Permission[]) => 
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);

// Helper decorators for common permission sets
export const RequireCustomer = () => RequirePermissions(
  'BOOKING_CREATE',
  'BOOKING_READ',
  'BOOKING_CANCEL',
  'TICKET_CREATE',
  'TICKET_READ'
);

export const RequireTravelAgent = () => RequirePermissions(
  'BOOKING_CREATE',
  'BOOKING_READ',
  'BOOKING_VIEW_ALL',
  'PAYMENT_PROCESS'
);

export const RequireAdmin = () => RequirePermissions(
  'USER_MANAGE_ROLES',
  'SETTINGS_MANAGE',
  'SYSTEM_MAINTENANCE'
);

export const RequireFinanceStaff = () => RequirePermissions(
  'PAYMENT_READ',
  'PAYMENT_PROCESS',
  'PAYMENT_REFUND',
  'REPORTS_VIEW',
  'REPORTS_GENERATE'
);

export const RequireSupportStaff = () => RequirePermissions(
  'TICKET_READ',
  'TICKET_UPDATE',
  'TICKET_ASSIGN',
  'TICKET_CLOSE',
  'TICKET_VIEW_ALL'
);

export const RequireOperationsStaff = () => RequirePermissions(
  'BOOKING_VIEW_ALL',
  'BOOKING_MANAGE_STATUS',
  'PACKAGE_UPDATE',
  'FLIGHT_MANAGE_INVENTORY',
  'HOTEL_MANAGE_ROOMS'
);
