import { Injectable } from '@nestjs/common';
import { LeadResponse } from '../../leads/leads.service';
import { LlmPort } from './llm.port';

/** Resumen local cuando no hay API de modelo externa. */
@Injectable()
export class MockLlmProvider implements LlmPort {
  async executiveSummary(leads: LeadResponse[]): Promise<string> {
    const n = leads.length;
    if (n === 0) {
      return ['## Resumen ejecutivo', '', 'No hay leads que coincidan con el filtro.'].join(
        '\n',
      );
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
      '## Resumen ejecutivo',
      '',
      `### Análisis general`,
      `Se analizaron **${n}** lead(s).`,
      avg !== null
        ? `Presupuesto medio (solo leads con dato): **USD ${avg.toFixed(2)}**.`
        : 'Ningún lead del conjunto tiene presupuesto informado.',
      '',
      `### Fuente principal`,
      `**${main[0]}** concentra más registros (**${main[1]}**).`,
      '',
      `### Recomendaciones`,
      '- Reforzar el canal dominante.',
      '- Unificar la captura de presupuesto para poder proyectar.',
      '- Priorizar seguimiento en leads sin producto de interés.',
    ].join('\n');
  }
}
