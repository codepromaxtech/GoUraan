import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({ description: 'User preferred language code (e.g., en, ar)' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'User preferred timezone (e.g., Asia/Riyadh)' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Whether to receive marketing emails' })
  @IsBoolean()
  @IsOptional()
  receiveMarketingEmails?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive promotional emails' })
  @IsBoolean()
  @IsOptional()
  receivePromotionalEmails?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive SMS notifications' })
  @IsBoolean()
  @IsOptional()
  receiveSmsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether to receive push notifications' })
  @IsBoolean()
  @IsOptional()
  receivePushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Preferred currency for display' })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiPropertyOptional({ description: 'Preferred theme (light/dark/system)' })
  @IsString()
  @IsOptional()
  themePreference?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional({ description: 'Whether to show onboarding tour' })
  @IsBoolean()
  @IsOptional()
  showOnboardingTour?: boolean;
}
