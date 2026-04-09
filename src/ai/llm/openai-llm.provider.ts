import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadResponse } from '../../leads/leads.service';
import { LlmChatHistoryItem, LlmPort } from './llm.port';

@Injectable()
export class OpenAiLlmProvider implements LlmPort {
  private readonly logger = new Logger(OpenAiLlmProvider.name);

  constructor(private readonly config: ConfigService) {}

  async executiveSummary(leads: LeadResponse[]): Promise<string> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY no configurada',
      );
    }

    const payload = leads.map((l) => ({
      nombre: l.nombre,
      email: l.email,
      fuente: l.fuente,
      producto_interes: l.producto_interes,
      presupuesto: l.presupuesto,
      creado: l.createdAt.toISOString(),
    }));

    const system = `Eres un analista de marketing. Devuelve un resumen ejecutivo en español con secciones claras:
## Análisis general
## Fuente principal
## Recomendaciones
Sé conciso y accionable. Usa markdown ligero (negritas con **).`;

    const user = `Datos de leads (JSON):\n${JSON.stringify(payload, null, 2)}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      await res.text().catch(() => undefined);
      this.logger.warn(`OpenAI error HTTP ${res.status} (cuerpo omitido en logs)`);
      throw new ServiceUnavailableException(
        'No se pudo obtener respuesta del modelo',
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ServiceUnavailableException('Respuesta del modelo vacía');
    }
    return text;
  }

  async assistantChat(input: {
    leads: LeadResponse[];
    userMessage: string;
    history: LlmChatHistoryItem[];
  }): Promise<string> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY no configurada',
      );
    }

    const { leads, userMessage, history } = input;
    const payload = leads.map((l) => ({
      nombre: l.nombre,
      email: l.email,
      fuente: l.fuente,
      producto_interes: l.producto_interes,
      presupuesto: l.presupuesto,
      creado: l.createdAt.toISOString(),
    }));

    const system = `Eres un analista de marketing. Responde en español de forma clara y accionable.
Los datos del segmento filtrado (JSON) son:
${JSON.stringify(payload, null, 2)}

Usa markdown ligero si ayuda. Si el usuario pregunta algo que no se puede inferir de los datos, dilo sin inventar cifras.`;

    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: system },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini',
        messages,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      await res.text().catch(() => undefined);
      this.logger.warn(`OpenAI error HTTP ${res.status} (cuerpo omitido en logs)`);
      throw new ServiceUnavailableException(
        'No se pudo obtener respuesta del modelo',
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new ServiceUnavailableException('Respuesta del modelo vacía');
    }
    return text;
  }
}
