import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FlightPassengerDto {
  @ApiProperty({ description: 'First name of the passenger' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the passenger' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Date of birth of the passenger', example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: Date;

  @ApiProperty({ description: 'Gender of the passenger', example: 'MALE' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ description: 'Passport number of the passenger', required: false })
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiProperty({ description: 'Nationality of the passenger', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({ description: 'Seat preference of the passenger', required: false })
  @IsString()
  @IsOptional()
  seatPreference?: string;

  @ApiProperty({ description: 'Special meal requirements', required: false })
  @IsString()
  @IsOptional()
  specialMeals?: string;

  @ApiProperty({ description: 'Special assistance requirements', required: false })
  @IsString()
  @IsOptional()
  specialAssistance?: string;

  @ApiProperty({ description: 'Frequent flyer number', required: false })
  @IsString()
  @IsOptional()
  frequentFlyerNumber?: string;

  @ApiProperty({ description: 'Ticket number', required: false })
  @IsString()
  @IsOptional()
  ticketNumber?: string;

  @ApiProperty({ description: 'Seat number', required: false })
  @IsString()
  @IsOptional()
  seatNumber?: string;
}
