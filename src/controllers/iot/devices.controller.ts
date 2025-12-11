import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { IoTService } from '../../services/iot.service';
import { CreateDeviceDto } from '../../fiware/iot-agent/dto';

@Controller('iot/devices')
export class DevicesController {
  constructor(private readonly iotService: IoTService) {}

  @Post()
  async createDevices(@Body() createDeviceDto: CreateDeviceDto) {
    return this.iotService.createDevices(createDeviceDto);
  }

  @Get()
  async getDevices() {
    return this.iotService.getDevices();
  }

  @Get(':deviceId')
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.iotService.getDevice(deviceId);
  }

  @Put(':deviceId')
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() updateDeviceDto: any,
  ) {
    return this.iotService.updateDevice(deviceId, updateDeviceDto);
  }

  @Delete(':deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    return this.iotService.deleteDevice(deviceId);
  }
}
