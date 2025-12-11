import { IsString, IsArray, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceAttributeDto {
  @ApiProperty({ example: 't', description: 'Object ID from device measurement' })
  @IsString()
  object_id: string;

  @ApiProperty({ example: 'temperature', description: 'Entity attribute name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Number', description: 'Attribute data type' })
  @IsString()
  type: string;
}

export class DeviceDto {
  @ApiProperty({ example: 'sensor001', description: 'Unique device identifier' })
  @IsString()
  device_id: string;

  @ApiProperty({ example: 'Sensor1', description: 'Entity name in Orion Context Broker' })
  @IsString()
  entity_name: string;

  @ApiProperty({ example: 'Sensor', description: 'Entity type in Orion' })
  @IsString()
  entity_type: string;

  @ApiProperty({ example: '4jggokgpepnvsb2uv4s40d59ov', description: 'API key (must match service group)' })
  @IsString()
  apikey: string;

  @ApiProperty({ example: 'IoTA-UL', description: 'IoT Agent protocol' })
  @IsString()
  protocol: string;

  @ApiProperty({ example: 'HTTP', description: 'Transport protocol (HTTP, MQTT, etc.)' })
  @IsString()
  transport: string;

  @ApiProperty({ 
    type: [DeviceAttributeDto],
    description: 'Device attributes mapping',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceAttributeDto)
  attributes?: DeviceAttributeDto[];
}

export class CreateDeviceDto {
  @ApiProperty({ 
    type: [DeviceDto],
    description: 'Array of devices to provision',
    example: [{
      device_id: 'sensor001',
      entity_name: 'Sensor1',
      entity_type: 'Sensor',
      apikey: '4jggokgpepnvsb2uv4s40d59ov',
      protocol: 'IoTA-UL',
      transport: 'HTTP',
      attributes: [{
        object_id: 't',
        name: 'temperature',
        type: 'Number'
      }]
    }]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one device is required' })
  @ValidateNested({ each: true })
  @Type(() => DeviceDto)
  devices: DeviceDto[];
}
