import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { InvoiceCancelForm, InvoiceCreateForm, InvoiceUpdateForm, PlusApiResultInvoiceDetailVO, PlusApiResultInvoiceStatisticsVO, PlusApiResultInvoiceVO, PlusApiResultListInvoiceItemVO, PlusApiResultPageInvoiceVO, PlusApiResultVoid } from '../types';


export class InvoiceApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取发票详情 */
  async getInvoice(invoiceId: string | number): Promise<PlusApiResultInvoiceDetailVO> {
    return this.client.get<PlusApiResultInvoiceDetailVO>(appApiPath(`/invoice/${invoiceId}`));
  }

/** 更新发票 */
  async updateInvoice(invoiceId: string | number, body: InvoiceUpdateForm): Promise<PlusApiResultInvoiceVO> {
    return this.client.put<PlusApiResultInvoiceVO>(appApiPath(`/invoice/${invoiceId}`), body);
  }

/** 创建发票 */
  async createInvoice(body: InvoiceCreateForm): Promise<PlusApiResultInvoiceVO> {
    return this.client.post<PlusApiResultInvoiceVO>(appApiPath(`/invoice`), body);
  }

/** 提交发票 */
  async submit(invoiceId: string | number): Promise<PlusApiResultInvoiceVO> {
    return this.client.post<PlusApiResultInvoiceVO>(appApiPath(`/invoice/${invoiceId}/submit`));
  }

/** 作废发票 */
  async cancel(invoiceId: string | number, body: InvoiceCancelForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/invoice/${invoiceId}/cancel`), body);
  }

/** 获取发票明细 */
  async getInvoiceItems(invoiceId: string | number): Promise<PlusApiResultListInvoiceItemVO> {
    return this.client.get<PlusApiResultListInvoiceItemVO>(appApiPath(`/invoice/${invoiceId}/items`));
  }

/** 获取发票统计 */
  async getInvoiceStatistics(): Promise<PlusApiResultInvoiceStatisticsVO> {
    return this.client.get<PlusApiResultInvoiceStatisticsVO>(appApiPath(`/invoice/statistics`));
  }

/** 搜索发票 */
  async searchInvoices(params?: QueryParams): Promise<PlusApiResultPageInvoiceVO> {
    return this.client.get<PlusApiResultPageInvoiceVO>(appApiPath(`/invoice/search`), params);
  }

/** 获取我的发票 */
  async getMyInvoices(params?: QueryParams): Promise<PlusApiResultPageInvoiceVO> {
    return this.client.get<PlusApiResultPageInvoiceVO>(appApiPath(`/invoice/my`), params);
  }
}

export function createInvoiceApi(client: HttpClient): InvoiceApi {
  return new InvoiceApi(client);
}
