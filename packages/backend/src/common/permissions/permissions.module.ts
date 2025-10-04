import { Module, Global } from '@nestjs/common';
import { UserPermissionsService } from '../../modules/users/services/user-permissions.service';
import { PermissionsGuard } from '../guards/permissions.guard';

@Global()
@Module({
  providers: [
    UserPermissionsService,
    {
      provide: 'PERMISSIONS',
      useValue: UserPermissionsService.getAllPermissions(),
    },
    PermissionsGuard,
  ],
  exports: [
    UserPermissionsService,
    'PERMISSIONS',
    PermissionsGuard,
  ],
})
export class PermissionsModule {}
