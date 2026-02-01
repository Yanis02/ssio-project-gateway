import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyrockIoTSensorService } from '../fiware/keyrock/services/iot-sensor.service';
import { SessionService } from './session.service';

/**
 * Business logic service for IoT Sensor account management
 * Manages IoT device credentials in Keyrock
 */
@Injectable()
export class IoTSensorManagementService {
  private readonly appId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly keyrockIoTSensorService: KeyrockIoTSensorService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('KEYROCK_APP_ID') || '';
    this.clientId = this.configService.get<string>('KEYROCK_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('KEYROCK_CLIENT_SECRET') || '';
    
    if (!this.appId) {
      throw new Error('KEYROCK_APP_ID environment variable is required');
    }
  }

  private getManagementToken(currentUserId: string): string {
    const session = this.sessionService.getSession(currentUserId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return session.keyrockManagementToken;
  }

  /**
   * Create a new IoT sensor account
   * Returns the sensor ID and password that should be stored on the physical device
   */
  async createIoTSensor(currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    const result = await this.keyrockIoTSensorService.createIoTSensor(this.appId, token);
    
    const sensorId = result?.iot?.id;
    const password = result?.iot?.password;
    
    if (!sensorId || !password) {
      console.error('Invalid IoT sensor creation response:', result);
      throw new Error('Failed to create IoT sensor: invalid response from Keyrock');
    }
    
    return {
      sensorId,
      password,
      message: 'IMPORTANT: Save these credentials! The password cannot be retrieved again.',
    };
  }

  /**
   * Get IoT sensor details
   */
  async getIoTSensor(sensorId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockIoTSensorService.getIoTSensor(this.appId, sensorId, token);
  }

  /**
   * List all IoT sensors
   */
  async listIoTSensors(currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    return this.keyrockIoTSensorService.listIoTSensors(this.appId, token);
  }

  /**
   * Reset IoT sensor password
   * Returns a new password - the old password is invalidated
   */
  async resetIoTSensorPassword(sensorId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    const result = await this.keyrockIoTSensorService.resetIoTSensorPassword(
      this.appId, 
      sensorId, 
      token
    );
    
    return {
      sensorId,
      newPassword: result.new_password,
      message: 'IMPORTANT: Update the device with this new password!',
    };
  }

  /**
   * Delete IoT sensor account
   */
  async deleteIoTSensor(sensorId: string, currentUserId: string) {
    const token = this.getManagementToken(currentUserId);
    await this.keyrockIoTSensorService.deleteIoTSensor(this.appId, sensorId, token);
  }

  /**
   * Get a permanent OAuth2 token for IoT sensor
   * Used for configuring north port protection (trust tokens in service groups)
   */
  async getPermanentToken(sensorId: string, sensorPassword: string) {
    return this.keyrockIoTSensorService.getPermanentToken(
      sensorId,
      sensorPassword,
      this.clientId,
      this.clientSecret,
    );
  }
}
