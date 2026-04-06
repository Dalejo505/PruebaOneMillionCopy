import { FuenteLead } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class SummaryFilterDto {
  @IsOptional()
  @IsEnum(FuenteLead)
  fuente?: FuenteLead;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
