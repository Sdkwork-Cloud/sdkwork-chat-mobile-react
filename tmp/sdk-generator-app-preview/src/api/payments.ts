import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { PaymentCallbackRequest, PaymentCallbackResponse, PaymentCreateForm, PaymentReconcileForm, PlusApiResultListPaymentMethodVO, PlusApiResultListPaymentStatusVO, PlusApiResultPagePaymentStatusVO, PlusApiResultPaymentStatisticsVO, PlusApiResultPaymentStatusVO, PlusApiResultPaymentVO, PlusApiResultVoid } from '../types';


export class PaymentsApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 创建支付 */
  async createPayment(body: PaymentCreateForm): Promise<PlusApiResultPaymentVO> {
    return this.client.post<PlusApiResultPaymentVO>(appApiPath(`/payments`), body);
  }

/** 关闭支付 */
  async closePayment(paymentId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/payments/${paymentId}/close`));
  }

/** 补单/对账 */
  async reconcilePayment(body: PaymentReconcileForm): Promise<PlusApiResultPaymentStatusVO> {
    return this.client.post<PlusApiResultPaymentStatusVO>(appApiPath(`/payments/reconcile`), body);
  }

/** 通用支付回调 */
  async paymentCallback(provider: string | number, body: PaymentCallbackRequest): Promise<PaymentCallbackResponse> {
    return this.client.post<PaymentCallbackResponse>(appApiPath(`/payments/callback/${provider}`), body);
  }

/** 微信支付回调 */
  async wechatPayCallback(body: string): Promise<string> {
    return this.client.post<string>(appApiPath(`/payments/callback/wechat`), body);
  }

/** 支付宝回调 */
  async alipayCallback(params?: QueryParams): Promise<string> {
    return this.client.post<string>(appApiPath(`/payments/callback/alipay`), undefined, params);
  }

/** 查询支付详情 */
  async getPaymentDetail(paymentId: string | number): Promise<PlusApiResultPaymentStatusVO> {
    return this.client.get<PlusApiResultPaymentStatusVO>(appApiPath(`/payments/${paymentId}`));
  }

/** 查询支付状态 */
  async getPaymentStatus(paymentId: string | number): Promise<PlusApiResultPaymentStatusVO> {
    return this.client.get<PlusApiResultPaymentStatusVO>(appApiPath(`/payments/${paymentId}/status`));
  }

/** 获取支付统计 */
  async getPaymentStatistics(): Promise<PlusApiResultPaymentStatisticsVO> {
    return this.client.get<PlusApiResultPaymentStatisticsVO>(appApiPath(`/payments/statistics`));
  }

/** 获取支付记录 */
  async listPaymentRecords(params?: QueryParams): Promise<PlusApiResultPagePaymentStatusVO> {
    return this.client.get<PlusApiResultPagePaymentStatusVO>(appApiPath(`/payments/records`), params);
  }

/** 根据商户订单号查询支付状态 */
  async getPaymentStatusByOutTradeNo(outTradeNo: string | number): Promise<PlusApiResultPaymentStatusVO> {
    return this.client.get<PlusApiResultPaymentStatusVO>(appApiPath(`/payments/outTradeNo/${outTradeNo}/status`));
  }

/** 获取订单的支付记录 */
  async listOrder(orderId: string | number): Promise<PlusApiResultListPaymentStatusVO> {
    return this.client.get<PlusApiResultListPaymentStatusVO>(appApiPath(`/payments/order/${orderId}`));
  }

/** 获取支付方式 */
  async listPaymentMethods(params?: QueryParams): Promise<PlusApiResultListPaymentMethodVO> {
    return this.client.get<PlusApiResultListPaymentMethodVO>(appApiPath(`/payments/methods`), params);
  }
}

export function createPaymentsApi(client: HttpClient): PaymentsApi {
  return new PaymentsApi(client);
}
