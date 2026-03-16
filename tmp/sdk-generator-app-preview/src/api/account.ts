import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CashRechargeForm, CashTransferForm, CashWithdrawForm, PlusApiResultBigDecimal, PlusApiResultCashAccountInfoVO, PlusApiResultCashRechargeVO, PlusApiResultCashTransferVO, PlusApiResultCashWithdrawVO, PlusApiResultPageHistoryVO, PlusApiResultPointsAccountInfoVO, PlusApiResultPointsExchangeVO, PlusApiResultPointsTransferVO, PointsExchangeForm, PointsTransferForm } from '../types';


export class AccountApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 积分转账 */
  async transfer(body: PointsTransferForm): Promise<PlusApiResultPointsTransferVO> {
    return this.client.post<PlusApiResultPointsTransferVO>(appApiPath(`/account/points/transfer`), body);
  }

/** 扣除Token */
  async deductToken(params?: QueryParams): Promise<PlusApiResultPointsAccountInfoVO> {
    return this.client.post<PlusApiResultPointsAccountInfoVO>(appApiPath(`/account/points/token/deduct`), undefined, params);
  }

/** 积分兑换 */
  async exchange(body: PointsExchangeForm): Promise<PlusApiResultPointsExchangeVO> {
    return this.client.post<PlusApiResultPointsExchangeVO>(appApiPath(`/account/points/exchange`), body);
  }

/** 提现 */
  async withdraw(body: CashWithdrawForm): Promise<PlusApiResultCashWithdrawVO> {
    return this.client.post<PlusApiResultCashWithdrawVO>(appApiPath(`/account/cash/withdraw`), body);
  }

/** 转账 */
  async createTransfer(body: CashTransferForm): Promise<PlusApiResultCashTransferVO> {
    return this.client.post<PlusApiResultCashTransferVO>(appApiPath(`/account/cash/transfer`), body);
  }

/** 充值 */
  async recharge(body: CashRechargeForm): Promise<PlusApiResultCashRechargeVO> {
    return this.client.post<PlusApiResultCashRechargeVO>(appApiPath(`/account/cash/recharge`), body);
  }

/** 获取积分账户信息 */
  async getPoints(): Promise<PlusApiResultPointsAccountInfoVO> {
    return this.client.get<PlusApiResultPointsAccountInfoVO>(appApiPath(`/account/points`));
  }

/** 获取Token账户信息 */
  async getToken(): Promise<PlusApiResultPointsAccountInfoVO> {
    return this.client.get<PlusApiResultPointsAccountInfoVO>(appApiPath(`/account/points/token`));
  }

/** 获取交易历史 */
  async getHistory(params?: QueryParams): Promise<PlusApiResultPageHistoryVO> {
    return this.client.get<PlusApiResultPageHistoryVO>(appApiPath(`/account/points/history`), params);
  }

/** 获取积分兑换现金比例 */
  async getPointsToCashRate(): Promise<PlusApiResultBigDecimal> {
    return this.client.get<PlusApiResultBigDecimal>(appApiPath(`/account/points/exchange-rate`));
  }

/** 获取现金账户信息 */
  async getCash(): Promise<PlusApiResultCashAccountInfoVO> {
    return this.client.get<PlusApiResultCashAccountInfoVO>(appApiPath(`/account/cash`));
  }

/** 获取交易历史 */
  async getHistoryCash(params?: QueryParams): Promise<PlusApiResultPageHistoryVO> {
    return this.client.get<PlusApiResultPageHistoryVO>(appApiPath(`/account/cash/history`), params);
  }
}

export function createAccountApi(client: HttpClient): AccountApi {
  return new AccountApi(client);
}
