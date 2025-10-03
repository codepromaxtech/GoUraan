import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for the analytics period',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  from?: Date;

  @ApiProperty({
    description: 'End date for the analytics period',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  to?: Date;
}
