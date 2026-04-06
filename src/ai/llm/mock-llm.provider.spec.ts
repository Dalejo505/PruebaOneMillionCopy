import { FuenteLead } from '@prisma/client';
import { MockLlmProvider } from './mock-llm.provider';

describe('MockLlmProvider', () => {
  const provider = new MockLlmProvider();

  it('devuelve mensaje cuando no hay leads', async () => {
    const text = await provider.executiveSummary([]);
    expect(text).toContain('No hay leads');
    expect(text).toContain('MockLlmProvider');
  });

  it('incluye fuente principal y recomendaciones con datos', async () => {
    const text = await provider.executiveSummary([
      {
        id: '1',
        nombre: 'A',
        email: 'a@x.com',
        telefono: null,
        fuente: FuenteLead.instagram,
        producto_interes: null,
        presupuesto: 100,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        nombre: 'B',
        email: 'b@x.com',
        telefono: null,
        fuente: FuenteLead.instagram,
        producto_interes: null,
        presupuesto: 200,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    expect(text).toContain('instagram');
    expect(text).toContain('Recomendaciones');
  });
});
