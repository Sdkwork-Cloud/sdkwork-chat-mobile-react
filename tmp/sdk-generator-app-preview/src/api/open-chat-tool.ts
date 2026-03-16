import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageToolVO } from '../types';


export class OpenChatToolApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Tool market list */
  async market(params?: QueryParams): Promise<PlusApiResultPageToolVO> {
    return this.client.get<PlusApiResultPageToolVO>(appApiPath(`/openchat/tools/market`), params);
  }
}

export function createOpenChatToolApi(client: HttpClient): OpenChatToolApi {
  return new OpenChatToolApi(client);
}
