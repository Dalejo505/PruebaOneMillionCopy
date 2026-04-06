import { FuenteLead, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rows: Array<{
    nombre: string;
    email: string;
    telefono?: string;
    fuente: FuenteLead;
    producto_interes?: string;
    presupuesto?: number;
    createdAt: Date;
  }> = [
    {
      nombre: 'Ana García',
      email: 'ana.garcia@example.com',
      telefono: '+573001112233',
      fuente: 'instagram',
      producto_interes: 'Curso de reels',
      presupuesto: 120,
      createdAt: new Date('2026-04-05T10:00:00Z'),
    },
    {
      nombre: 'Luis Pérez',
      email: 'luis.perez@example.com',
      fuente: 'facebook',
      producto_interes: 'Plantillas Canva',
      presupuesto: 45.5,
      createdAt: new Date('2026-04-04T15:30:00Z'),
    },
    {
      nombre: 'María López',
      email: 'maria.lopez@example.com',
      fuente: 'landing_page',
      producto_interes: 'Ebook PDF',
      presupuesto: 0,
      createdAt: new Date('2026-04-03T09:00:00Z'),
    },
    {
      nombre: 'Carlos Ruiz',
      email: 'carlos.ruiz@example.com',
      fuente: 'referido',
      presupuesto: 200,
      createdAt: new Date('2026-04-02T12:00:00Z'),
    },
    {
      nombre: 'Elena Martín',
      email: 'elena.martin@example.com',
      telefono: '+34600111222',
      fuente: 'instagram',
      producto_interes: 'Mentoría 1:1',
      presupuesto: 500,
      createdAt: new Date('2026-03-28T18:00:00Z'),
    },
    {
      nombre: 'Jorge Sánchez',
      email: 'jorge.sanchez@example.com',
      fuente: 'otro',
      producto_interes: 'Pack branding',
      createdAt: new Date('2026-03-20T11:00:00Z'),
    },
    {
      nombre: 'Patricia Gómez',
      email: 'patricia.gomez@example.com',
      fuente: 'facebook',
      presupuesto: 80,
      createdAt: new Date('2026-04-05T20:00:00Z'),
    },
    {
      nombre: 'Diego Herrera',
      email: 'diego.herrera@example.com',
      fuente: 'landing_page',
      producto_interes: 'Suscripción newsletter',
      presupuesto: 15,
      createdAt: new Date('2026-04-01T08:00:00Z'),
    },
    {
      nombre: 'Sofía Navarro',
      email: 'sofia.navarro@example.com',
      fuente: 'instagram',
      presupuesto: 250,
      createdAt: new Date('2026-03-15T14:00:00Z'),
    },
    {
      nombre: 'Miguel Torres',
      email: 'miguel.torres@example.com',
      fuente: 'referido',
      producto_interes: 'Curso avanzado',
      presupuesto: 300,
      createdAt: new Date('2026-04-06T07:45:00Z'),
    },
    {
      nombre: 'Laura Vega',
      email: 'laura.vega@example.com',
      fuente: 'facebook',
      createdAt: new Date('2026-02-10T10:00:00Z'),
    },
    {
      nombre: 'Roberto Díaz',
      email: 'roberto.diaz@example.com',
      fuente: 'otro',
      presupuesto: 99.99,
      createdAt: new Date('2026-04-06T13:20:00Z'),
    },
  ];

  for (const r of rows) {
    await prisma.lead.upsert({
      where: { email: r.email },
      create: {
        nombre: r.nombre,
        email: r.email,
        telefono: r.telefono,
        fuente: r.fuente,
        producto_interes: r.producto_interes,
        presupuesto: r.presupuesto,
        createdAt: r.createdAt,
      },
      update: {},
    });
  }

  console.log(`Seed: ${rows.length} leads listos.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
