import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { InstallRequest, PlusApiResultListMapStringObject, PlusApiResultMapStringObject, PlusApiResultVoid, UpdateCredentialsRequest } from '../types';


export class ToolApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Update tool credentials */
  async updateCredentials(toolId: string | number, body?: UpdateCredentialsRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.put<PlusApiResultMapStringObject>(appApiPath(`/tools/my/${toolId}/credentials`), body);
  }

/** List my tools */
  async listMine(): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/tools/my`));
  }

/** Install tool */
  async install(body?: InstallRequest): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/tools/my`), body);
  }

/** Test tool */
  async test(toolId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.post<PlusApiResultMapStringObject>(appApiPath(`/tools/market/${toolId}/test`));
  }

/** List tool market */
  async listMarket(params?: QueryParams): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/tools/market`), params);
  }

/** Get tool market item */
  async getMarketItem(toolId: string | number): Promise<PlusApiResultMapStringObject> {
    return this.client.get<PlusApiResultMapStringObject>(appApiPath(`/tools/market/${toolId}`));
  }

/** List tool categories */
  async listCategories(): Promise<PlusApiResultListMapStringObject> {
    return this.client.get<PlusApiResultListMapStringObject>(appApiPath(`/tools/categories`));
  }

/** Uninstall tool */
  async uninstall(toolId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/tools/my/${toolId}`));
  }
}

export function createToolApi(client: HttpClient): ToolApi {
  return new ToolApi(client);
}
