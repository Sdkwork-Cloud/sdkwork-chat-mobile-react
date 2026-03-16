import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageAppVO } from '../types';


export class OpenChatAppstoreApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** App store app list */
  async apps(params?: QueryParams): Promise<PlusApiResultPageAppVO> {
    return this.client.get<PlusApiResultPageAppVO>(appApiPath(`/openchat/appstore/apps`), params);
  }
}

export function createOpenChatAppstoreApi(client: HttpClient): OpenChatAppstoreApi {
  return new OpenChatAppstoreApi(client);
}
