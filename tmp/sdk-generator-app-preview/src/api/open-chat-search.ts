import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { OpenChatSearchForm, PlusApiResultPageSearchItemVO } from '../types';


export class OpenChatSearchApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Unified search query */
  async query(body: OpenChatSearchForm): Promise<PlusApiResultPageSearchItemVO> {
    return this.client.post<PlusApiResultPageSearchItemVO>(appApiPath(`/openchat/search/query`), body);
  }
}

export function createOpenChatSearchApi(client: HttpClient): OpenChatSearchApi {
  return new OpenChatSearchApi(client);
}
