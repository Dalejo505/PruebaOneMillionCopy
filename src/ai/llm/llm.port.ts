import { LeadResponse } from '../../leads/leads.service';

export const LLM_PORT = Symbol('LLM_PORT');

export interface LlmChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmPort {
  executiveSummary(leads: LeadResponse[]): Promise<string>;
  assistantChat(input: {
    leads: LeadResponse[];
    userMessage: string;
    history: LlmChatHistoryItem[];
  }): Promise<string>;
}
