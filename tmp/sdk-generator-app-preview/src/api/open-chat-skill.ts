import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageSkillVO } from '../types';


export class OpenChatSkillApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Skill market list */
  async market(params?: QueryParams): Promise<PlusApiResultPageSkillVO> {
    return this.client.get<PlusApiResultPageSkillVO>(appApiPath(`/openchat/skills/market`), params);
  }
}

export function createOpenChatSkillApi(client: HttpClient): OpenChatSkillApi {
  return new OpenChatSkillApi(client);
}
