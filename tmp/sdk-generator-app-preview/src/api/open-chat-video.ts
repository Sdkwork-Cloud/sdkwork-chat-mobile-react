import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageVideoVO } from '../types';


export class OpenChatVideoApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** List short videos */
  async list(params?: QueryParams): Promise<PlusApiResultPageVideoVO> {
    return this.client.get<PlusApiResultPageVideoVO>(appApiPath(`/openchat/videos`), params);
  }
}

export function createOpenChatVideoApi(client: HttpClient): OpenChatVideoApi {
  return new OpenChatVideoApi(client);
}
