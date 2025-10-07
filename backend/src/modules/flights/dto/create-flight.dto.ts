import { IsString, IsUUID, IsDateString, IsEnum, IsNumber, IsArray, IsOptional, IsBoolean, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { FlightStatus, CabinClass } from '../entities/flight.entity';

export class CreateFlightDto {
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsUUID()
  @IsNotEmpty()
  airlineId: string;

  @IsUUID()
  @IsNotEmpty()
  departureAirportId: string;

  @IsUUID()
  @IsNotEmpty()
  arrivalAirportId: string;

  @IsDateString()
  @IsNotEmpty()
  departureTime: Date;

  @IsDateString()
  @IsNotEmpty()
  arrivalTime: Date;

  @IsEnum(CabinClass)
  @IsNotEmpty()
  cabinClass: CabinClass;

  @IsNumber()
  @IsNotEmpty()
  totalSeats: number;

  @IsNumber()
  @IsOptional()
  availableSeats?: number;

  @IsNumber()
  @IsNotEmpty()
  basePrice: number;

  @IsEnum(FlightStatus)
  @IsOptional()
  status?: FlightStatus = FlightStatus.SCHEDULED;

  @IsArray()
  @IsOptional()
  amenities?: string[] = [];

  @IsObject()
  @IsOptional()
  baggageAllowance?: {
    cabin: number;
    checkIn: number;
  };

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
