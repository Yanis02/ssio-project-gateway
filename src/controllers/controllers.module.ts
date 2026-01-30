import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { RolesController, PermissionsController } from './access-control/access-control.controller';
import { OrionController } from './orion/orion.controller';
import { ServiceGroupsController } from './iot/service-groups.controller';
import { DevicesController } from './iot/devices.controller';
import { DeviceDataController } from './iot/device-data.controller';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [ServicesModule],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
    OrionController,
    ServiceGroupsController,
    DevicesController,
    DeviceDataController,
  ],
})
export class ControllersModule {}
