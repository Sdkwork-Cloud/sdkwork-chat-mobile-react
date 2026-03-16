import type { PageAgentVO } from './page-agent-vo';
import type { PlusApiResultBase } from './plus-api-result-base';

export type PlusApiResultPageAgentVO = PlusApiResultBase & Record<string, unknown>;
