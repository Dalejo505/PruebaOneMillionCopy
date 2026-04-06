import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FuenteLead, Lead, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

export type LeadResponse = Omit<Lead, 'presupuesto'> & {
  presupuesto: number | null;
};

export interface LeadsFilter {
  fuente?: FuenteLead;
  fechaDesde?: string;
  fechaHasta?: string;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(lead: Lead): LeadResponse {
    return {
      ...lead,
      presupuesto:
        lead.presupuesto !== null ? Number(lead.presupuesto) : null,
    };
  }

  /** Misma lógica de filtro que listado y resumen IA */
  buildWhereClause(filter: LeadsFilter): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = { deletedAt: null };
    if (filter.fuente) {
      where.fuente = filter.fuente;
    }
    if (filter.fechaDesde || filter.fechaHasta) {
      where.createdAt = {};
      if (filter.fechaDesde) {
        where.createdAt.gte = this.parseFechaDesde(filter.fechaDesde);
      }
      if (filter.fechaHasta) {
        where.createdAt.lte = this.parseFechaHasta(filter.fechaHasta);
      }
    }
    return where;
  }

  private parseFechaDesde(s: string): Date {
    const d = new Date(s);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      d.setHours(0, 0, 0, 0);
    }
    return d;
  }

  private parseFechaHasta(s: string): Date {
    const d = new Date(s);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      d.setHours(23, 59, 59, 999);
    }
    return d;
  }

  async create(dto: CreateLeadDto): Promise<LeadResponse> {
    try {
      const lead = await this.prisma.lead.create({
        data: {
          nombre: dto.nombre,
          email: dto.email.toLowerCase().trim(),
          telefono: dto.telefono,
          fuente: dto.fuente,
          producto_interes: dto.producto_interes,
          presupuesto: dto.presupuesto,
        },
      });
      return this.toResponse(lead);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya existe un lead con este email');
      }
      throw e;
    }
  }

  async findAll(query: QueryLeadsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = this.buildWhereClause({
      fuente: query.fuente,
      fechaDesde: query.fechaDesde,
      fechaHasta: query.fechaHasta,
    });

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: items.map((l) => this.toResponse(l)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  async findOne(id: string): Promise<LeadResponse> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, deletedAt: null },
    });
    if (!lead) {
      throw new NotFoundException(`Lead con id ${id} no encontrado`);
    }
    return this.toResponse(lead);
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadResponse> {
    await this.findOne(id);
    const data: Prisma.LeadUpdateInput = {
      ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      ...(dto.email !== undefined && {
        email: dto.email.toLowerCase().trim(),
      }),
      ...(dto.telefono !== undefined && { telefono: dto.telefono }),
      ...(dto.fuente !== undefined && { fuente: dto.fuente }),
      ...(dto.producto_interes !== undefined && {
        producto_interes: dto.producto_interes,
      }),
      ...(dto.presupuesto !== undefined && {
        presupuesto: dto.presupuesto,
      }),
    };
    if (Object.keys(data).length === 0) {
      return this.findOne(id);
    }
    try {
      const lead = await this.prisma.lead.update({
        where: { id },
        data,
      });
      return this.toResponse(lead);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ya existe un lead con este email');
      }
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async stats() {
    const baseWhere: Prisma.LeadWhereInput = { deletedAt: null };

    const [total, byFuente, avgRow, sevenDaysAgo] = await Promise.all([
      this.prisma.lead.count({ where: baseWhere }),
      this.prisma.lead.groupBy({
        by: ['fuente'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.prisma.lead.aggregate({
        where: { ...baseWhere, presupuesto: { not: null } },
        _avg: { presupuesto: true },
      }),
      Promise.resolve(
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          d.setHours(0, 0, 0, 0);
          return d;
        })(),
      ),
    ]);

    const leadsUltimos7Dias = await this.prisma.lead.count({
      where: {
        ...baseWhere,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const porFuente: Record<string, number> = {};
    for (const row of byFuente) {
      porFuente[row.fuente] = row._count._all;
    }

    return {
      total,
      porFuente,
      promedioPresupuestoUsd:
        avgRow._avg.presupuesto !== null
          ? Number(avgRow._avg.presupuesto)
          : null,
      leadsUltimos7Dias,
    };
  }

  /** Leads para el resumen IA (mismos filtros que listado, sin paginar) */
  async findManyForSummary(filter: LeadsFilter): Promise<LeadResponse[]> {
    const where = this.buildWhereClause(filter);
    const items = await this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return items.map((l) => this.toResponse(l));
  }
}
