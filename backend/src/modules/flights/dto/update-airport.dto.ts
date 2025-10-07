import { PartialType } from '@nestjs/mapped-types';
import { CreateAirportDto, AirportType } from './create-airport.dto';

export class UpdateAirportDto extends PartialType(CreateAirportDto) {
  // You can add additional fields specific to update if needed
  // For example, fields that can only be updated under certain conditions
}
