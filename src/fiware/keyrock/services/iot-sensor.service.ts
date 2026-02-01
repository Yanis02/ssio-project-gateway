import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IoTSensorDto {
  id: string;
  password?: string;
  oauth_client_id?: string;
}

export interface CreateIoTSensorResponseDto {
  iot: {
    id: string;
    password: string;
  };
}

export interface IoTSensorListDto {
  iots: Array<{ id: string }>;
}

@Injectable()
export class KeyrockIoTSensorService {
  private readonly keyrockUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const keyrockUrl = this.configService.get<string>('KEYROCK_URL');
    if (!keyrockUrl) {
      throw new Error('KEYROCK_URL must be defined');
    }
    this.keyrockUrl = keyrockUrl;
  }

  /**
   * Create a new IoT Sensor account in Keyrock application
   * This generates credentials that the physical IoT device will use
   */
  async createIoTSensor(appId: string, token: string): Promise<CreateIoTSensorResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.keyrockUrl}/v1/applications/${appId}/iot_agents`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-token': token,
            },
          },
        ),
      );
      
      console.log('Keyrock createIoTSensor response:', JSON.stringify(response.data, null, 2));
      
      // Handle different response structures from Keyrock
      const data = response.data;
      
      // If response has 'iot' wrapper
      if (data?.iot?.id) {
        return data;
      }
      
      // If response has 'iot_agent' wrapper (some Keyrock versions)
      if (data?.iot_agent?.id) {
        return { iot: data.iot_agent };
      }
      
      // If response is flat (id and password directly)
      if (data?.id && data?.password) {
        return { iot: data };
      }
      
      // If response has 'pep_proxy' format (Keyrock might use similar structure)
      if (data?.pep_proxy?.id) {
        return { iot: data.pep_proxy };
      }
      
      throw new HttpException(
        `Unexpected Keyrock response format: ${JSON.stringify(data)}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.response) {
        console.error('Keyrock createIoTSensor error:', error.response.data);
        throw new HttpException(
          error.response.data?.error || error.response.data?.message || 'Failed to create IoT sensor',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Get IoT Sensor details by ID
   */
  async getIoTSensor(appId: string, sensorId: string, token: string): Promise<IoTSensorDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyrockUrl}/v1/applications/${appId}/iot_agents/${sensorId}`,
          {
            headers: {
              'X-Auth-token': token,
            },
          },
        ),
      );
      return response.data.iot;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('IoT sensor not found', HttpStatus.NOT_FOUND);
      }
      if (error.response) {
        throw new HttpException(
          error.response.data?.error || 'Failed to get IoT sensor',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * List all IoT Sensors in an application
   */
  async listIoTSensors(appId: string, token: string): Promise<IoTSensorListDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.keyrockUrl}/v1/applications/${appId}/iot_agents`,
          {
            headers: {
              'X-Auth-token': token,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data?.error || 'Failed to list IoT sensors',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Reset password of an IoT Sensor
   * Returns a new password for the sensor
   */
  async resetIoTSensorPassword(appId: string, sensorId: string, token: string): Promise<{ new_password: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(
          `${this.keyrockUrl}/v1/applications/${appId}/iot_agents/${sensorId}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-token': token,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('IoT sensor not found', HttpStatus.NOT_FOUND);
      }
      if (error.response) {
        throw new HttpException(
          error.response.data?.error || 'Failed to reset IoT sensor password',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Delete an IoT Sensor account
   */
  async deleteIoTSensor(appId: string, sensorId: string, token: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.keyrockUrl}/v1/applications/${appId}/iot_agents/${sensorId}`,
          {
            headers: {
              'X-Auth-token': token,
            },
          },
        ),
      );
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('IoT sensor not found', HttpStatus.NOT_FOUND);
      }
      if (error.response) {
        throw new HttpException(
          error.response.data?.error || 'Failed to delete IoT sensor',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  /**
   * Get permanent OAuth2 token for an IoT Sensor (for north port auth)
   * This is used when configuring trust tokens for service groups
   */
  async getPermanentToken(
    email: string, 
    password: string, 
    clientId: string, 
    clientSecret: string
  ): Promise<{ access_token: string; scope: string[] }> {
    try {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.keyrockUrl}/oauth2/token`,
          new URLSearchParams({
            username: email,
            password: password,
            grant_type: 'password',
            scope: 'permanent',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${credentials}`,
              'Accept': 'application/json',
            },
          },
        ),
      );

      return {
        access_token: response.data.access_token,
        scope: response.data.scope || ['permanent'],
      };
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data?.error || 'Failed to get permanent token',
          error.response.status,
        );
      }
      throw new HttpException('Keyrock service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
