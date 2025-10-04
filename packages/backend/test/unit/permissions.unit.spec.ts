import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { UserPermissionsService, UserWithPermissions } from '../../src/modules/users/services/user-permissions.service';

describe('UserPermissionsService', () => {
  let service: UserPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPermissionsService],
    }).compile();

    service = module.get<UserPermissionsService>(UserPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPermissionsForRole', () => {
    it('should return permissions for ADMIN role', () => {
      const permissions = service.getPermissionsForRole(UserRole.ADMIN);
      expect(permissions.length).toBeGreaterThan(0);
      // Admin should have all permissions
      const allPermissions = service.getAllPermissions();
      expect(permissions.length).toEqual(Object.keys(allPermissions).length);
    });

    it('should return permissions for CUSTOMER role', () => {
      const permissions = service.getPermissionsForRole(UserRole.CUSTOMER);
      // Check for actual permissions from the implementation
      expect(permissions).toContain('booking:create');
      expect(permissions).toContain('booking:read');
      expect(permissions).toContain('booking:cancel');
      expect(permissions).toContain('payment:create');
      expect(permissions).toContain('payment:read');
      expect(permissions).not.toContain('user:manage_roles');
    });
  });

  describe('hasPermission', () => {
    const testUser = {
      id: 'user-123',
      roles: [UserRole.AGENT],
      permissions: new Set(['booking:create', 'payment:process']),
    };

    it('should return true for user with permission', () => {
      expect(service.hasPermission(testUser, 'booking:create')).toBe(true);
    });

    it('should return false for user without permission', () => {
      expect(service.hasPermission(testUser, 'user:manage_roles')).toBe(false);
    });

    it('should return true for admin user regardless of permission', () => {
      const adminUser: UserWithPermissions = {
        id: 'admin-123',
        roles: [UserRole.ADMIN],
        permissions: new Set<string>(),
      };
      expect(service.hasPermission(adminUser, 'ANY_PERMISSION')).toBe(true);
    });
  });

  describe('getAvailableRoles', () => {
    it('should return all available roles with descriptions', () => {
      const roles = service.getAvailableRoles();
      expect(roles.length).toBeGreaterThan(0);
      expect(roles.find(r => r.id === UserRole.ADMIN)).toBeDefined();
      expect(roles.find(r => r.id === UserRole.CUSTOMER)).toBeDefined();
      expect(roles.every(role => role.name && role.description)).toBe(true);
    });
  });

  describe('roleHasPermission', () => {
    it('should check if role has specific permission', () => {
      // AGENT role should have booking:create permission
      expect(service.roleHasPermission(UserRole.AGENT, 'booking:create')).toBe(true);
      // CUSTOMER role should have booking:create permission
      expect(service.roleHasPermission(UserRole.CUSTOMER, 'booking:create')).toBe(true);
      // CUSTOMER role should not have user:manage_roles permission
      expect(service.roleHasPermission(UserRole.CUSTOMER, 'user:manage_roles')).toBe(false);
      // AGENT role should not have user:manage_roles permission
      expect(service.roleHasPermission(UserRole.AGENT, 'user:manage_roles')).toBe(false);
      // Only ADMIN should have user:manage_roles permission
      expect(service.roleHasPermission(UserRole.ADMIN, 'user:manage_roles')).toBe(true);
    });
  });
});
