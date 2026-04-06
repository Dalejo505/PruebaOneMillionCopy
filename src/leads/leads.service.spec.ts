import { ConflictException } from '@nestjs/common';
import { FuenteLead } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  let service: LeadsService;
  const leadCreate = jest.fn();
  const prismaMock = {
    lead: {
      create: leadCreate,
    },
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(LeadsService);
  });

  it('create persiste y normaliza email', async () => {
    leadCreate.mockResolvedValue({
      id: 'c1',
      nombre: 'Ana',
      email: 'ana@test.com',
      telefono: null,
      fuente: FuenteLead.instagram,
      producto_interes: null,
      presupuesto: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await service.create({
      nombre: 'Ana',
      email: '  Ana@Test.COM ',
      fuente: FuenteLead.instagram,
    });
    expect(leadCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: 'ana@test.com' }),
      }),
    );
    expect(result.email).toBe('ana@test.com');
  });

  it('create lanza ConflictException si email duplicado (P2002)', async () => {
    const err = new PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: '5',
    });
    leadCreate.mockRejectedValue(err);
    await expect(
      service.create({
        nombre: 'Ana',
        email: 'dup@test.com',
        fuente: FuenteLead.facebook,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
