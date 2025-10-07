import { IsString, IsDateString, IsNumber, IsArray, IsOptional, ValidateNested, IsNotEmpty, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FlightSegmentDto {
  @IsString()
  @IsNotEmpty()
  flightNumber: string;

  @IsString()
  @IsNotEmpty()
  airline: string;

  @IsDateString()
  departureDate: Date;

  @IsString()
  departureTime: string;

  @IsString()
  @IsNotEmpty()
  departureAirport: string;

  @IsDateString()
  arrivalDate: Date;

  @IsString()
  arrivalTime: string;

  @IsString()
  @IsNotEmpty()
  arrivalAirport: string;

  @IsString()
  @IsNotEmpty()
  cabinClass: string;

  @IsString()
  @IsOptional()
  baggageAllowance?: string;
}

export class PassengerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsOptional()
  passportNumber?: string;

  @IsString()
  @IsOptional()
  nationality?: string;
}

export class CreateFlightBookingDto {
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @IsString()
  @IsNotEmpty()
  pnr: string;

  @IsDateString()
  bookingDate: Date;

  @IsDateString()
  issueDate: Date;

  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @IsString()
  @IsOptional()
  status?: string = 'PENDING';

  @IsString()
  @IsOptional()
  bookingType?: string = 'FLIGHT';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSegmentDto)
  flightSegments: FlightSegmentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @IsNumber()
  @IsNotEmpty()
  baseFare: number;

  @IsNumber()
  @IsNotEmpty()
  tax: number;

  @IsNumber()
  @IsNotEmpty()
  totalFare: number;

  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @IsNumber()
  @IsOptional()
  customerPay?: number = 0;

  @IsNumber()
  @IsOptional()
  agencyPay?: number = 0;

  @IsNumber()
  @IsOptional()
  expense?: number = 0;

  @IsNumber()
  @IsOptional()
  profit?: number = 0;

  @IsString()
  @IsOptional()
  reference?: string;
}
