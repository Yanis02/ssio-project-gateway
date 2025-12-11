import { IsString, IsArray, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceGroupAttributeDto {
  @ApiProperty({ example: 't', description: 'Object ID for the attribute' })
  @IsString()
  object_id: string;

  @ApiProperty({ example: 'temperature', description: 'Attribute name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Number', description: 'Attribute type' })
  @IsString()
  type: string;
}

export class ServiceGroupDto {
  @ApiProperty({ example: '4jggokgpepnvsb2uv4s40d59ov', description: 'API key for the service group' })
  @IsString()
  apikey: string;

  @ApiProperty({ example: 'Device', description: 'Entity type for devices in this group' })
  @IsString()
  entity_type: string;

  @ApiProperty({ example: '/iot/d', description: 'Resource path for device communication' })
  @IsString()
  resource: string;

  @ApiProperty({ 
    type: [ServiceGroupAttributeDto], 
    description: 'Default attributes for devices in this group',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceGroupAttributeDto)
  attributes?: ServiceGroupAttributeDto[];
}

export class CreateServiceGroupDto {
  @ApiProperty({ 
    type: [ServiceGroupDto],
    description: 'Array of service groups to create',
    example: [{
      apikey: '4jggokgpepnvsb2uv4s40d59ov',
      entity_type: 'Device',
      resource: '/iot/d',
      attributes: [{
        object_id: 't',
        name: 'temperature',
        type: 'Number'
      }]
    }]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service group is required' })
  @ValidateNested({ each: true })
  @Type(() => ServiceGroupDto)
  services: ServiceGroupDto[];
}
