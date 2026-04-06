import { LeadResponse } from '../../leads/leads.service';

export const LLM_PORT = Symbol('LLM_PORT');

export interface LlmPort {
  executiveSummary(leads: LeadResponse[]): Promise<string>;
}
