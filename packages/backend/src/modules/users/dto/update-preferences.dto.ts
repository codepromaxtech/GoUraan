import { IsBoolean, IsEnum, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Language {
  EN = 'EN',
  AR = 'AR',
  // Add other language codes as needed
}

export enum Currency {
  USD = 'USD',
  SAR = 'SAR',
  EUR = 'EUR',
  // Add other currency codes as needed
}

export enum SeatPreference {
  WINDOW = 'WINDOW',
  AISLE = 'AISLE',
  EXIT = 'EXIT',
  // Add other seat preferences as needed
}

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ 
    description: 'User preferred language',
    enum: Language,
    default: Language.EN 
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiPropertyOptional({ 
    description: 'User preferred timezone',
    default: 'UTC' 
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ 
    description: 'User preferred currency',
    enum: Currency,
    default: Currency.USD 
  })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @ApiPropertyOptional({ 
    description: 'Whether to receive email notifications',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to receive SMS notifications',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to receive push notifications',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to receive marketing emails',
    default: true 
  })
  @IsBoolean()
  @IsOptional()
  marketingEmails?: boolean;

  @ApiPropertyOptional({ 
    description: 'Preferred seat type',
    enum: SeatPreference,
    required: false 
  })
  @IsEnum(SeatPreference)
  @IsOptional()
  seatPreference?: SeatPreference | null;

  @ApiPropertyOptional({ 
    description: 'Meal preference',
    required: false 
  })
  @IsString()
  @IsOptional()
  mealPreference?: string | null;

  @ApiPropertyOptional({ 
    description: 'Special assistance requirements',
    type: [String],
    required: false 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialAssistance?: string[];
}
