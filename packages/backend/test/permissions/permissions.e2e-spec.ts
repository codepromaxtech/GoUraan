import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { UserPermissionsService } from '../../src/modules/users/services/user-permissions.service';
import { PermissionsGuard } from '../../src/common/guards/permissions.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('Permissions System', () => {
  let userPermissionsService: UserPermissionsService;
  let permissionsGuard: PermissionsGuard;

  const mockUser = (roles: UserRole[], permissions: string[]) => ({
    id: 'user-123',
    roles,
    permissions: new Set(permissions),
  });

  const mockContext = (user: any, requiredPermissions: string[] = []) => ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPermissionsService, PermissionsGuard],
    }).compile();

    userPermissionsService = module.get<UserPermissionsService>(UserPermissionsService);
    permissionsGuard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  describe('UserPermissionsService', () => {
    it('should return all permissions for admin', () => {
      const permissions = userPermissionsService.getPermissionsForRole(UserRole.ADMIN);
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('USER_MANAGE_ROLES');
    });

    it('should return correct permissions for travel agent', () => {
      const permissions = userPermissionsService.getPermissionsForRole(UserRole.AGENT);
      expect(permissions).toContain('BOOKING_CREATE');
      expect(permissions).toContain('PAYMENT_PROCESS');
      expect(permissions).not.toContain('USER_MANAGE_ROLES');
    });

    it('should check if user has permission', () => {
      const user = mockUser([UserRole.AGENT], ['BOOKING_CREATE', 'PAYMENT_PROCESS']);
      expect(userPermissionsService.hasPermission(user, 'BOOKING_CREATE')).toBe(true);
      expect(userPermissionsService.hasPermission(user, 'USER_MANAGE_ROLES')).toBe(false);
    });
  });

  describe('PermissionsGuard', () => {
    it('should allow access when no permissions required', async () => {
      const context = mockContext(mockUser([UserRole.CUSTOMER], []));
      const canActivate = await permissionsGuard.canActivate(context as unknown as ExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should allow admin access to any route', async () => {
      const adminUser = mockUser([UserRole.ADMIN], []);
      const context = {
        ...mockContext(adminUser),
        getHandler: () => ({}),
        getClass: () => ({}),
      };
      
      // Mock the reflector to return some required permissions
      jest.spyOn(permissionsGuard['reflector'], 'getAllAndOverride').mockReturnValue(['ADMIN_ONLY_PERMISSION']);
      
      const canActivate = await permissionsGuard.canActivate(context as unknown as ExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should deny access when user lacks required permissions', async () => {
      const user = mockUser([UserRole.CUSTOMER], ['BOOKING_READ']);
      const context = {
        ...mockContext(user),
        getHandler: () => ({}),
        getClass: () => ({}),
      };
      
      // Mock the reflector to return required permissions
      jest.spyOn(permissionsGuard['reflector'], 'getAllAndOverride')
        .mockReturnValue(['BOOKING_CREATE', 'BOOKING_UPDATE']);
      
      await expect(
        permissionsGuard.canActivate(context as unknown as ExecutionContext)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Role Permissions', () => {
    const testCases = [
      {
        role: UserRole.CUSTOMER,
        shouldHave: ['BOOKING_READ', 'BOOKING_CANCEL', 'TICKET_CREATE'],
        shouldNotHave: ['BOOKING_VIEW_ALL', 'USER_MANAGE_ROLES'],
      },
      {
        role: UserRole.AGENT,
        shouldHave: ['BOOKING_CREATE', 'PAYMENT_PROCESS', 'TICKET_UPDATE'],
        shouldNotHave: ['USER_MANAGE_ROLES', 'SYSTEM_MAINTENANCE'],
      },
      {
        role: UserRole.STAFF_FINANCE,
        shouldHave: ['PAYMENT_PROCESS', 'PAYMENT_REFUND', 'REPORTS_GENERATE'],
        shouldNotHave: ['USER_MANAGE_ROLES', 'CONTENT_MANAGE'],
      },
      {
        role: UserRole.STAFF_SUPPORT,
        shouldHave: ['TICKET_READ', 'TICKET_UPDATE', 'TICKET_CLOSE'],
        shouldNotHave: ['PAYMENT_REFUND', 'USER_MANAGE_ROLES'],
      },
      {
        role: UserRole.STAFF_OPERATIONS,
        shouldHave: ['BOOKING_MANAGE_STATUS', 'PACKAGE_UPDATE', 'HOTEL_MANAGE_ROOMS'],
        shouldNotHave: ['USER_MANAGE_ROLES', 'PAYMENT_REFUND'],
      },
    ];

    testCases.forEach(({ role, shouldHave, shouldNotHave }) => {
      it(`should have correct permissions for ${role} role`, () => {
        const permissions = userPermissionsService.getPermissionsForRole(role);
        
        shouldHave.forEach(permission => {
          expect(permissions).toContain(permission);
        });
        
        shouldNotHave.forEach(permission => {
          expect(permissions).not.toContain(permission);
        });
      });
    });
  });
});
