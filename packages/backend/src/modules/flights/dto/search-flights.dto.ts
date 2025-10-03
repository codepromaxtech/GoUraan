import { IsString, IsDateString, IsEnum, IsNumber, IsOptional, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CabinClass } from '../entities/flight.entity';

export enum SortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DEPARTURE_ASC = 'departure_asc',
  DEPARTURE_DESC = 'departure_desc',
  DURATION_ASC = 'duration_asc',
  DURATION_DESC = 'duration_desc',
  ARRIVAL_ASC = 'arrival_asc',
  ARRIVAL_DESC = 'arrival_desc',
}

export class SearchFlightsDto {
  @IsString()
  @IsOptional()
  from?: string; // Can be IATA code or city name

  @IsString()
  @IsOptional()
  to?: string; // Can be IATA code or city name

  @IsUUID()
  @IsOptional()
  departureAirportId?: string;

  @IsUUID()
  @IsOptional()
  arrivalAirportId?: string;

  @IsDateString()
  @IsOptional()
  departureDate?: string;

  @IsDateString()
  @IsOptional()
  returnDate?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  adults?: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  children?: number = 0;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  infants?: number = 0;

  @IsEnum(CabinClass, { each: true })
  @IsOptional()
  cabinClass?: CabinClass[] = [CabinClass.ECONOMY];

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  directOnly?: boolean = false;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxStops?: number = 2;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxDuration?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxPrice?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  airlines?: string[];

  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.PRICE_ASC;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
