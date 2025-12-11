export class ServiceGroupAttributeDto {
  object_id: string;
  name: string;
  type: string;
}

export class ServiceGroupDto {
  apikey: string;
  entity_type: string;
  resource: string;
  attributes?: ServiceGroupAttributeDto[];
}

export class CreateServiceGroupDto {
  services: ServiceGroupDto[];
}
