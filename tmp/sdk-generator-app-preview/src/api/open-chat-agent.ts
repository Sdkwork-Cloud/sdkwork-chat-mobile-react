import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { OpenChatAgentCreateForm, PlusApiResultAgentVO, PlusApiResultPageAgentVO } from '../types';


export class OpenChatAgentApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** List agents */
  async list(params?: QueryParams): Promise<PlusApiResultPageAgentVO> {
    return this.client.get<PlusApiResultPageAgentVO>(appApiPath(`/openchat/agents`), params);
  }

/** Create agent */
  async create(body: OpenChatAgentCreateForm): Promise<PlusApiResultAgentVO> {
    return this.client.post<PlusApiResultAgentVO>(appApiPath(`/openchat/agents`), body);
  }

/** Get agent detail */
  async detail(agentId: string | number): Promise<PlusApiResultAgentVO> {
    return this.client.get<PlusApiResultAgentVO>(appApiPath(`/openchat/agents/${agentId}`));
  }
}

export function createOpenChatAgentApi(client: HttpClient): OpenChatAgentApi {
  return new OpenChatAgentApi(client);
}
