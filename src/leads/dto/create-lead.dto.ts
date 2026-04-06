import { FuenteLead } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'email debe tener un formato válido' })
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsEnum(FuenteLead, {
    message:
      'fuente debe ser: instagram, facebook, landing_page, referido, otro',
  })
  fuente: FuenteLead;

  @IsOptional()
  @IsString()
  producto_interes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'presupuesto debe ser un número' })
  @Min(0)
  presupuesto?: number;
}
