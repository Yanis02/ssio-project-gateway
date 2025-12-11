import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteServiceGroupQueryDto {
  @ApiProperty({ example: '/iot/d', description: 'Resource path to delete', required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ example: '4jggokgpepnvsb2uv4s40d59ov', description: 'API key to delete', required: false })
  @IsOptional()
  @IsString()
  apikey?: string;
}
