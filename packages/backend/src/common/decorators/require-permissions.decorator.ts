import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS, Permission } from '../../config/permissions.config';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

export const RequirePermissions = (...permissions: Permission[]) => 
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);

// Helper decorators for common permission sets
export const RequireCustomer = () => RequirePermissions(
  PERMISSIONS.BOOK_FLIGHT,
  PERMISSIONS.BOOK_HOTEL,
  PERMISSIONS.MANAGE_BOOKINGS
);

export const RequireTravelAgent = () => RequirePermissions(
  PERMISSIONS.ACCESS_WHOLESALE_RATES,
  PERMISSIONS.CREATE_PACKAGE_DEALS,
  PERMISSIONS.MANAGE_AGENT_CUSTOMERS
);

export const RequireAdmin = () => RequirePermissions(
  PERMISSIONS.MANAGE_USERS,
  PERMISSIONS.MANAGE_SETTINGS
);

export const RequireFinanceStaff = () => RequirePermissions(
  PERMISSIONS.MANAGE_INVOICES,
  PERMISSIONS.PROCESS_REFUNDS
);

export const RequireSupportStaff = () => RequirePermissions(
  PERMISSIONS.MANAGE_TICKETS,
  PERMISSIONS.LIVE_CHAT_SUPPORT
);

export const RequireOperationsStaff = () => RequirePermissions(
  PERMISSIONS.MANUAL_BOOKING_CONFIRMATION,
  PERMISSIONS.MANAGE_HAJJ_PACKAGES
);
