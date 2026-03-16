import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageNotificationVO } from '../types';


export class OpenChatNotificationApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Notification page query */
  async page(params?: QueryParams): Promise<PlusApiResultPageNotificationVO> {
    return this.client.get<PlusApiResultPageNotificationVO>(appApiPath(`/openchat/notifications/page`), params);
  }
}

export function createOpenChatNotificationApi(client: HttpClient): OpenChatNotificationApi {
  return new OpenChatNotificationApi(client);
}
