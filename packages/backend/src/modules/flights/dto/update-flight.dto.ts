import { PartialType } from '@nestjs/swagger';
import { CreateFlightDto } from './create-flight.dto';
import { IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { FlightStatus } from '../entities/flight.entity';

export class UpdateFlightDto extends PartialType(CreateFlightDto) {
  @IsOptional()
  @IsDateString()
  departureTime?: Date;

  @IsOptional()
  @IsDateString()
  arrivalTime?: Date;

  @IsOptional()
  @IsEnum(FlightStatus)
  status?: FlightStatus;

  @IsOptional()
  @IsNumber()
  availableSeats?: number;
}
