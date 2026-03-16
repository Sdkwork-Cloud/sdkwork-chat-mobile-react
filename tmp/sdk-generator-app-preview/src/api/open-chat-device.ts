import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultListDeviceVO } from '../types';


export class OpenChatDeviceApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Device list */
  async list(): Promise<PlusApiResultListDeviceVO> {
    return this.client.get<PlusApiResultListDeviceVO>(appApiPath(`/openchat/devices`));
  }
}

export function createOpenChatDeviceApi(client: HttpClient): OpenChatDeviceApi {
  return new OpenChatDeviceApi(client);
}
