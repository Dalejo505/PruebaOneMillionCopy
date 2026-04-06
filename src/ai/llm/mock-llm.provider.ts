import { Injectable } from '@nestjs/common';
import { LeadResponse } from '../../leads/leads.service';
import { LlmPort } from './llm.port';

/**
 * Mock sin costo: replica la forma del resumen esperado.
 * Activar con USE_MOCK_AI=true o sin OPENAI_API_KEY.
 */
@Injectable()
export class MockLlmProvider implements LlmPort {
  async executiveSummary(leads: LeadResponse[]): Promise<string> {
    const n = leads.length;
    if (n === 0) {
      return [
        '## Resumen ejecutivo (mock)',
        '',
        'No hay leads que coincidan con el filtro aplicado.',
        '',
        '_Generado por MockLlmProvider — sustituir por proveedor real en producción._',
      ].join('\n');
    }

    const byFuente = new Map<string, number>();
    for (const l of leads) {
      byFuente.set(l.fuente, (byFuente.get(l.fuente) ?? 0) + 1);
    }
    const main = [...byFuente.entries()].sort((a, b) => b[1] - a[1])[0];
    const budgets = leads
      .map((l) => l.presupuesto)
      .filter((p): p is number => p != null);
    const avg =
      budgets.length > 0
        ? budgets.reduce((a, b) => a + b, 0) / budgets.length
        : null;

    return [
      '## Resumen ejecutivo (mock)',
      '',
      `### Análisis general`,
      `Se analizaron **${n}** lead(s).`,
      avg !== null
        ? `Presupuesto medio declarado (muestra con dato): **USD ${avg.toFixed(2)}**.`
        : 'Ningún lead en el conjunto filtrado incluye presupuesto.',
      '',
      `### Fuente principal`,
      `**${main[0]}** concentra la mayor cantidad de registros (**${main[1]}**).`,
      '',
      `### Recomendaciones`,
      '- Reforzar creatividades y presupuesto en el canal dominante.',
      '- Homogeneizar captura de presupuesto para mejorar el forecast.',
      '- Revisar leads sin producto de interés para calificar más rápido.',
      '',
      '_Generado por MockLlmProvider — listo para intercambiar por OpenAI u otro LLM._',
    ].join('\n');
  }
}
