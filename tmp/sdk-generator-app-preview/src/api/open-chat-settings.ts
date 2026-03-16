import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { OpenChatSettingsUpdateForm, PlusApiResultSettingsVO } from '../types';


export class OpenChatSettingsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Get user setting profile */
  async get(): Promise<PlusApiResultSettingsVO> {
    return this.client.get<PlusApiResultSettingsVO>(appApiPath(`/openchat/settings`));
  }

/** Update user settings */
  async update(body: OpenChatSettingsUpdateForm): Promise<PlusApiResultSettingsVO> {
    return this.client.put<PlusApiResultSettingsVO>(appApiPath(`/openchat/settings`), body);
  }
}

export function createOpenChatSettingsApi(client: HttpClient): OpenChatSettingsApi {
  return new OpenChatSettingsApi(client);
}
