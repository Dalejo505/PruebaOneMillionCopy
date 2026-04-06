import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLeadDto } from './create-lead.dto';

describe('CreateLeadDto', () => {
  it('falla si nombre tiene menos de 2 caracteres', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      nombre: 'A',
      email: 'ok@example.com',
      fuente: 'instagram',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'nombre')).toBe(true);
  });
});
