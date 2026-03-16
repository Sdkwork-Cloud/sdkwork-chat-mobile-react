import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageMomentVO } from '../types';


export class OpenChatSocialApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Moments list */
  async moments(params?: QueryParams): Promise<PlusApiResultPageMomentVO> {
    return this.client.get<PlusApiResultPageMomentVO>(appApiPath(`/openchat/social/moments`), params);
  }
}

export function createOpenChatSocialApi(client: HttpClient): OpenChatSocialApi {
  return new OpenChatSocialApi(client);
}
