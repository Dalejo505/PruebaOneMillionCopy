import { FuenteLead } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class QueryLeadsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(FuenteLead)
  fuente?: FuenteLead;

  /** ISO 8601 — filtra por createdAt >= fecha */
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  /** ISO 8601 — filtra por createdAt <= fecha (fin del día si solo envías fecha) */
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
