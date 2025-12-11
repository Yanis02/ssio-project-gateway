import { Injectable } from '@nestjs/common';
import { IoTAgentService } from '../fiware/iot-agent/iot-agent.service';

/**
 * Business logic service for IoT Agent operations
 * Wraps FIWARE IoT Agent infrastructure service
 */
@Injectable()
export class IoTService {
  constructor(private readonly iotAgentService: IoTAgentService) {}

  /**
   * Service Groups
   */
  async createServiceGroup(body: any): Promise<any> {
    return this.iotAgentService.createServiceGroup(body);
  }

  async getServiceGroups(): Promise<any> {
    return this.iotAgentService.getServiceGroups();
  }

  async deleteServiceGroup(queryParams?: Record<string, any>): Promise<any> {
    return this.iotAgentService.deleteServiceGroup(queryParams);
  }

  /**
   * Devices
   */
  async createDevices(body: any): Promise<any> {
    return this.iotAgentService.createDevices(body);
  }

  async getDevices(): Promise<any> {
    return this.iotAgentService.getDevices();
  }

  async getDevice(deviceId: string): Promise<any> {
    return this.iotAgentService.getDevice(deviceId);
  }

  async updateDevice(deviceId: string, body: any): Promise<any> {
    return this.iotAgentService.updateDevice(deviceId, body);
  }

  async deleteDevice(deviceId: string): Promise<any> {
    return this.iotAgentService.deleteDevice(deviceId);
  }
}
