import { Module } from '@nestjs/common';
import { UserPermissionsService } from '../users/services/user-permissions.service';

export * from '../users/services/user-permissions.service';

export const AUTHORIZATION_SERVICES = [
  UserPermissionsService,
];

@Module({
  providers: [...AUTHORIZATION_SERVICES],
  exports: [...AUTHORIZATION_SERVICES],
})
export class AuthorizationModule {}
