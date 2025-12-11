export class DeviceAttributeDto {
  object_id: string;
  name: string;
  type: string;
}

export class DeviceDto {
  device_id: string;
  entity_name: string;
  entity_type: string;
  apikey: string;
  protocol: string;
  transport: string;
  attributes?: DeviceAttributeDto[];
}

export class CreateDeviceDto {
  devices: DeviceDto[];
}
