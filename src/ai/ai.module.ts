import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LeadsModule } from '../leads/leads.module';
import { AiSummaryController } from './ai-summary.controller';
import { AiSummaryService } from './ai-summary.service';
import { LLM_PORT } from './llm/llm.port';
import { MockLlmProvider } from './llm/mock-llm.provider';
import { OpenAiLlmProvider } from './llm/openai-llm.provider';

@Module({
  imports: [ConfigModule, LeadsModule],
  controllers: [AiSummaryController],
  providers: [
    AiSummaryService,
    MockLlmProvider,
    OpenAiLlmProvider,
    {
      provide: LLM_PORT,
      inject: [ConfigService, MockLlmProvider, OpenAiLlmProvider],
      useFactory: (
        config: ConfigService,
        mock: MockLlmProvider,
        openai: OpenAiLlmProvider,
      ) => {
        const useMock = config.get<string>('USE_MOCK_AI') === 'true';
        const key = config.get<string>('OPENAI_API_KEY');
        if (useMock || !key?.trim()) {
          return mock;
        }
        return openai;
      },
    },
  ],
})
export class AiModule {}
