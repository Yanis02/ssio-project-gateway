import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { UserManagementService } from './user-management.service';
import { AccessControlService } from './access-control.service';
import { IoTService } from './iot.service';
import { OrionService } from './orion.service';
import { SessionModule } from './session.module';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { FiwareModule } from '../fiware/fiware.module';

@Module({
  imports: [
    SessionModule,
    FiwareModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'default-secret-change-me',
          signOptions: {
            expiresIn: expiresIn as StringValue,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    UserManagementService,
    AccessControlService,
    IoTService,
    OrionService,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    UserManagementService,
    AccessControlService,
    IoTService,
    OrionService,
    SessionModule,
    FiwareModule,
  ],
})
export class ServicesModule {}
