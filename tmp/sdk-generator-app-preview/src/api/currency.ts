import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { CurrencyConvertForm, CurrencyCreateForm, ExchangeRateCreateForm, PlusApiResultCurrencyConvertVO, PlusApiResultCurrencyVO, PlusApiResultExchangeRateVO, PlusApiResultListCurrencyTypeVO, PlusApiResultListCurrencyVO, PlusApiResultListExchangeRateVO, PlusApiResultPageCurrencyVO } from '../types';


export class CurrencyApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 创建货币 */
  async createCurrency(body: CurrencyCreateForm): Promise<PlusApiResultCurrencyVO> {
    return this.client.post<PlusApiResultCurrencyVO>(appApiPath(`/currency`), body);
  }

/** 禁用货币 */
  async deactivate(currencyId: string | number): Promise<PlusApiResultCurrencyVO> {
    return this.client.post<PlusApiResultCurrencyVO>(appApiPath(`/currency/${currencyId}/deactivate`));
  }

/** 启用货币 */
  async activate(currencyId: string | number): Promise<PlusApiResultCurrencyVO> {
    return this.client.post<PlusApiResultCurrencyVO>(appApiPath(`/currency/${currencyId}/activate`));
  }

/** 创建汇率 */
  async createExchangeRate(body: ExchangeRateCreateForm): Promise<PlusApiResultExchangeRateVO> {
    return this.client.post<PlusApiResultExchangeRateVO>(appApiPath(`/currency/rate`), body);
  }

/** 货币兑换计算 */
  async convert(body: CurrencyConvertForm): Promise<PlusApiResultCurrencyConvertVO> {
    return this.client.post<PlusApiResultCurrencyConvertVO>(appApiPath(`/currency/convert`), body);
  }

/** 获取货币详情 */
  async getCurrency(currencyId: string | number): Promise<PlusApiResultCurrencyVO> {
    return this.client.get<PlusApiResultCurrencyVO>(appApiPath(`/currency/${currencyId}`));
  }

/** 获取货币类型列表 */
  async getCurrencyTypes(): Promise<PlusApiResultListCurrencyTypeVO> {
    return this.client.get<PlusApiResultListCurrencyTypeVO>(appApiPath(`/currency/types`));
  }

/** 获取最新汇率 */
  async getLatestRate(params?: QueryParams): Promise<PlusApiResultExchangeRateVO> {
    return this.client.get<PlusApiResultExchangeRateVO>(appApiPath(`/currency/rate/latest`), params);
  }

/** 获取汇率历史 */
  async getRateHistory(params?: QueryParams): Promise<PlusApiResultListExchangeRateVO> {
    return this.client.get<PlusApiResultListExchangeRateVO>(appApiPath(`/currency/rate/history`), params);
  }

/** 获取货币列表 */
  async getCurrencyList(params?: QueryParams): Promise<PlusApiResultPageCurrencyVO> {
    return this.client.get<PlusApiResultPageCurrencyVO>(appApiPath(`/currency/list`), params);
  }

/** 根据代码获取货币 */
  async getCurrencyByCode(code: string | number): Promise<PlusApiResultCurrencyVO> {
    return this.client.get<PlusApiResultCurrencyVO>(appApiPath(`/currency/code/${code}`));
  }

/** 获取启用的货币 */
  async getActiveCurrencies(): Promise<PlusApiResultListCurrencyVO> {
    return this.client.get<PlusApiResultListCurrencyVO>(appApiPath(`/currency/active`));
  }
}

export function createCurrencyApi(client: HttpClient): CurrencyApi {
  return new CurrencyApi(client);
}
