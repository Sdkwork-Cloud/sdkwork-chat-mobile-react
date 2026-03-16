import type { AgentVO } from './agent-vo';
import type { PlusApiResultBase } from './plus-api-result-base';

export type PlusApiResultAgentVO = PlusApiResultBase & Record<string, unknown>;
