import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultPageWalletTransactionVO, PlusApiResultWalletSummaryVO } from '../types';


export class OpenChatWalletApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** Wallet summary */
  async summary(): Promise<PlusApiResultWalletSummaryVO> {
    return this.client.get<PlusApiResultWalletSummaryVO>(appApiPath(`/openchat/wallet/summary`));
  }

/** Wallet transactions */
  async transactions(params?: QueryParams): Promise<PlusApiResultPageWalletTransactionVO> {
    return this.client.get<PlusApiResultPageWalletTransactionVO>(appApiPath(`/openchat/wallet/transactions`), params);
  }
}

export function createOpenChatWalletApi(client: HttpClient): OpenChatWalletApi {
  return new OpenChatWalletApi(client);
}
