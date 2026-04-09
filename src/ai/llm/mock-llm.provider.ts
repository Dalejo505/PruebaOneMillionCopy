import { Injectable } from '@nestjs/common';
import { LeadResponse } from '../../leads/leads.service';
import { LlmChatHistoryItem, LlmPort } from './llm.port';

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

  async assistantChat(input: {
    leads: LeadResponse[];
    userMessage: string;
    history: LlmChatHistoryItem[];
  }): Promise<string> {
    const { leads, userMessage } = input;
    if (leads.length === 0) {
      return [
        'No hay leads que coincidan con los filtros enviados desde el cliente.',
        'No puedo extraer métricas hasta que exista al menos un registro en ese segmento.',
      ].join('\n\n');
    }
    const summary = await this.executiveSummary(leads);
    return [
      `Tengo **${leads.length}** lead(s) en el segmento filtrado.`,
      '',
      '### Contexto automático (mock del servidor)',
      summary,
      '',
      `### Sobre tu mensaje`,
      `«${userMessage.trim().slice(0, 500)}${userMessage.length > 500 ? '…' : ''}»`,
      '',
      '_Este backend usa el proveedor **mock** (`USE_MOCK_AI=true` o sin `OPENAI_API_KEY`). Con OpenAI activo, la respuesta será conversacional y adaptada a tu pregunta._',
    ].join('\n');
  }
}
