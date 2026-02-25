import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { RolesController, PermissionsController } from './access-control/access-control.controller';
import { OrionController } from './orion/orion.controller';
import { ServiceGroupsController } from './iot/service-groups.controller';
import { DevicesController } from './iot/devices.controller';
import { IoTSensorsController } from './iot/iot-sensors.controller';
import { LogsController } from './logs/logs.controller';
import { ServicesModule } from '../services/services.module';
import { Reflector } from '@nestjs/core';

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
    IoTSensorsController,
    LogsController,
  ],
  providers: [Reflector],
})
export class ControllersModule { }
