import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IoTService } from '../../services/iot.service';
import { CreateDeviceDto } from '../../fiware/iot-agent/dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@ApiTags('IoT Devices')
@Controller('iot/devices')
export class DevicesController {
  constructor(private readonly iotService: IoTService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Provision IoT devices', 
    description: 'Create one or more IoT devices in the IoT Agent. Devices will send measurements to Orion Context Broker.' 
  })
  @ApiResponse({ status: 201, description: 'Devices provisioned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  async createDevices(@Body() createDeviceDto: CreateDeviceDto) {
    return this.iotService.createDevices(createDeviceDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all devices', 
    description: 'Retrieve list of all provisioned IoT devices' 
  })
  @ApiResponse({ status: 200, description: 'Devices list retrieved' })
  async getDevices() {
    return this.iotService.getDevices();
  }

  @Get(':deviceId')
  @ApiOperation({ 
    summary: 'Get device by ID', 
    description: 'Retrieve specific IoT device information by device ID' 
  })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: 'sensor001' })
  @ApiResponse({ status: 200, description: 'Device information retrieved' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDevice(@Param('deviceId') deviceId: string) {
    return this.iotService.getDevice(deviceId);
  }

  @Put(':deviceId')
  @ApiOperation({ 
    summary: 'Update device', 
    description: 'Update IoT device configuration' 
  })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: 'sensor001' })
  @ApiResponse({ status: 200, description: 'Device updated successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async updateDevice(
    @Param('deviceId') deviceId: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.iotService.updateDevice(deviceId, updateDeviceDto);
  }

  @Delete(':deviceId')
  @ApiOperation({ 
    summary: 'Delete device', 
    description: 'Remove IoT device from IoT Agent' 
  })
  @ApiParam({ name: 'deviceId', description: 'Device ID', example: 'sensor001' })
  @ApiResponse({ status: 200, description: 'Device deleted successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async deleteDevice(@Param('deviceId') deviceId: string) {
    return this.iotService.deleteDevice(deviceId);
  }
}
