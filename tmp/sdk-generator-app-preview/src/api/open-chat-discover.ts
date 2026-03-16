import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultCursorFeedVO } from '../types';


export class OpenChatDiscoverApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Discover feed */
  async feed(params?: QueryParams): Promise<PlusApiResultCursorFeedVO> {
    return this.client.get<PlusApiResultCursorFeedVO>(appApiPath(`/openchat/discover/feed`), params);
  }
}

export function createOpenChatDiscoverApi(client: HttpClient): OpenChatDiscoverApi {
  return new OpenChatDiscoverApi(client);
}
