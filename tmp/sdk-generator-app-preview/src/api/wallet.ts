import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PlusApiResultHistoryVO, PlusApiResultListWalletAssetAccountVO, PlusApiResultPageHistoryVO, PlusApiResultWalletOperationResultVO, PlusApiResultWalletOperationStatusVO, PlusApiResultWalletOverviewVO, WalletExchangeForm, WalletTopupForm, WalletTransferForm, WalletWithdrawalForm } from '../types';


export class WalletApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 钱包提现 */
  async withdraw(body: WalletWithdrawalForm): Promise<PlusApiResultWalletOperationResultVO> {
    return this.client.post<PlusApiResultWalletOperationResultVO>(appApiPath(`/wallet/withdrawals`), body);
  }

/** 钱包转账 */
  async transfer(body: WalletTransferForm): Promise<PlusApiResultWalletOperationResultVO> {
    return this.client.post<PlusApiResultWalletOperationResultVO>(appApiPath(`/wallet/transfers`), body);
  }

/** 钱包充值 */
  async topup(body: WalletTopupForm): Promise<PlusApiResultWalletOperationResultVO> {
    return this.client.post<PlusApiResultWalletOperationResultVO>(appApiPath(`/wallet/topups`), body);
  }

/** 钱包兑换 */
  async exchange(body: WalletExchangeForm): Promise<PlusApiResultWalletOperationResultVO> {
    return this.client.post<PlusApiResultWalletOperationResultVO>(appApiPath(`/wallet/exchanges`), body);
  }

/** 钱包总览 */
  async getOverview(): Promise<PlusApiResultWalletOverviewVO> {
    return this.client.get<PlusApiResultWalletOverviewVO>(appApiPath(`/wallet`));
  }

/** 钱包流水分页 */
  async listTransactions(params?: QueryParams): Promise<PlusApiResultPageHistoryVO> {
    return this.client.get<PlusApiResultPageHistoryVO>(appApiPath(`/wallet/transactions`), params);
  }

/** 交易详情 */
  async getTransaction(transactionId: string | number): Promise<PlusApiResultHistoryVO> {
    return this.client.get<PlusApiResultHistoryVO>(appApiPath(`/wallet/transactions/${transactionId}`));
  }

/** 按请求号查询操作状态 */
  async getOperationStatus(requestNo: string | number, params?: QueryParams): Promise<PlusApiResultWalletOperationStatusVO> {
    return this.client.get<PlusApiResultWalletOperationStatusVO>(appApiPath(`/wallet/operations/${requestNo}`), params);
  }

/** 资产账户列表 */
  async listAccounts(): Promise<PlusApiResultListWalletAssetAccountVO> {
    return this.client.get<PlusApiResultListWalletAssetAccountVO>(appApiPath(`/wallet/accounts`));
  }
}

export function createWalletApi(client: HttpClient): WalletApi {
  return new WalletApi(client);
}
