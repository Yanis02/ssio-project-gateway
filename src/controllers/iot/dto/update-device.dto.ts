import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceAttributeDto } from '../../../fiware/iot-agent/dto';

export class UpdateDeviceDto {
  @ApiProperty({ example: 'UpdatedSensor1', description: 'Updated entity name', required: false })
  @IsOptional()
  @IsString()
  entity_name?: string;

  @ApiProperty({ example: 'UpdatedSensor', description: 'Updated entity type', required: false })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiProperty({ 
    type: [DeviceAttributeDto],
    description: 'Updated device attributes',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceAttributeDto)
  attributes?: DeviceAttributeDto[];
}
