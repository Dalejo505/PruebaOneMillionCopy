import { Inject, Injectable } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { SummaryFilterDto } from './dto/summary-filter.dto';
import { LLM_PORT, LlmPort } from './llm/llm.port';

@Injectable()
export class AiSummaryService {
  constructor(
    private readonly leadsService: LeadsService,
    @Inject(LLM_PORT) private readonly llm: LlmPort,
  ) {}

  async summarize(filter: SummaryFilterDto): Promise<{ resumen: string }> {
    const leads = await this.leadsService.findManyForSummary({
      fuente: filter.fuente,
      fechaDesde: filter.fechaDesde,
      fechaHasta: filter.fechaHasta,
    });
    const resumen = await this.llm.executiveSummary(leads);
    return { resumen };
  }
}
