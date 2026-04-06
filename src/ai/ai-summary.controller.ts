import { Body, Controller, DefaultValuePipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiSummaryService } from './ai-summary.service';
import { SummaryFilterDto } from './dto/summary-filter.dto';

@ApiTags('ai')
@Controller('leads/ai')
export class AiSummaryController {
  constructor(private readonly aiSummaryService: AiSummaryService) {}

  @Post('summary')
  @ApiOperation({
    summary: 'Resumen ejecutivo',
    description: 'Filtros opcionales; el texto depende de OpenAI o del proveedor local.',
  })
  async summary(
    @Body(new DefaultValuePipe({})) body: SummaryFilterDto,
  ) {
    return this.aiSummaryService.summarize(body);
  }
}
