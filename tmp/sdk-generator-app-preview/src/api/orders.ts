import { appApiPath } from './paths';
import type { HttpClient } from '../http/client';
import type { QueryParams } from '../types/common';
import type { OrderCancelForm, OrderCreateForm, OrderPayForm, PlusApiResultOrderDetailVO, PlusApiResultOrderPaymentSuccessVO, PlusApiResultOrderStatisticsVO, PlusApiResultOrderStatusVO, PlusApiResultOrderVO, PlusApiResultPageOrderVO, PlusApiResultPaymentParamsVO, PlusApiResultVoid, RefundApplyForm } from '../types';


export class OrdersApi {
  private client: HttpClient;
  
  constructor(client: HttpClient) { 
    this.client = client; 
  }

/** 获取订单列表 */
  async listOrders(params?: QueryParams): Promise<PlusApiResultPageOrderVO> {
    return this.client.get<PlusApiResultPageOrderVO>(appApiPath(`/orders`), params);
  }

/** 创建订单 */
  async createOrder(body: OrderCreateForm): Promise<PlusApiResultOrderVO> {
    return this.client.post<PlusApiResultOrderVO>(appApiPath(`/orders`), body);
  }

/** 申请退款 */
  async applyRefund(orderId: string | number, body: RefundApplyForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/orders/${orderId}/refund`), body);
  }

/** 订单支付 */
  async payOrder(orderId: string | number, body: OrderPayForm): Promise<PlusApiResultPaymentParamsVO> {
    return this.client.post<PlusApiResultPaymentParamsVO>(appApiPath(`/orders/${orderId}/pay`), body);
  }

/** 确认收货 */
  async confirmReceipt(orderId: string | number): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/orders/${orderId}/confirm`));
  }

/** 取消订单 */
  async cancelOrder(orderId: string | number, body: OrderCancelForm): Promise<PlusApiResultVoid> {
    return this.client.post<PlusApiResultVoid>(appApiPath(`/orders/${orderId}/cancel`), body);
  }

/** 获取订单详情 */
  async getOrderDetail(orderId: string | number): Promise<PlusApiResultOrderDetailVO> {
    return this.client.get<PlusApiResultOrderDetailVO>(appApiPath(`/orders/${orderId}`));
  }

/** 删除订单 */
  async deleteOrder(orderId: string | number): Promise<PlusApiResultVoid> {
    return this.client.delete<PlusApiResultVoid>(appApiPath(`/orders/${orderId}`));
  }

/** 获取订单状态 */
  async getOrderStatus(orderId: string | number): Promise<PlusApiResultOrderStatusVO> {
    return this.client.get<PlusApiResultOrderStatusVO>(appApiPath(`/orders/${orderId}/status`));
  }

/** 查询订单是否支付成功 */
  async getOrderPaymentSuccess(orderId: string | number): Promise<PlusApiResultOrderPaymentSuccessVO> {
    return this.client.get<PlusApiResultOrderPaymentSuccessVO>(appApiPath(`/orders/${orderId}/payment-success`));
  }

/** 获取订单统计 */
  async getOrderStatistics(): Promise<PlusApiResultOrderStatisticsVO> {
    return this.client.get<PlusApiResultOrderStatisticsVO>(appApiPath(`/orders/statistics`));
  }
}

export function createOrdersApi(client: HttpClient): OrdersApi {
  return new OrdersApi(client);
}
