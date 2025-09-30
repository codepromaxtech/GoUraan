import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean, IsArray } from 'class-validator';
import { Language, Currency, SeatPreference } from '@prisma/client';

export class UpdateUserPreferencesDto {
  @ApiProperty({
    example: Language.EN,
    description: 'Preferred language',
    enum: Language,
    required: false,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({
    example: Currency.USD,
    description: 'Preferred currency',
    enum: Currency,
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    example: 'UTC',
    description: 'Preferred timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: true,
    description: 'Email notifications preference',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiProperty({
    example: false,
    description: 'SMS notifications preference',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiProperty({
    example: true,
    description: 'Push notifications preference',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiProperty({
    example: true,
    description: 'Marketing emails preference',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiProperty({
    example: SeatPreference.AISLE,
    description: 'Preferred seat type',
    enum: SeatPreference,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeatPreference)
  seatPreference?: SeatPreference;

  @ApiProperty({
    example: 'Vegetarian',
    description: 'Meal preference',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealPreference?: string;

  @ApiProperty({
    example: ['wheelchair', 'extra_legroom'],
    description: 'Special assistance requirements',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialAssistance?: string[];
}
