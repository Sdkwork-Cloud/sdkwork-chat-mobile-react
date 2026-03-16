/** 创建支付请求 */
export interface PaymentCreateForm {
  /** 订单ID */
  orderId: string;
  /** 业务类型 */
  businessType?: string;
  /** 业务订单号 */
  businessOrderId?: string;
  /** 支付金额 */
  amount?: string;
  /** 支付方式 */
  paymentMethod: string;
  /** 支付场景 */
  paymentScene?: string;
  /** 客户端IP */
  clientIp?: string;
  /** 支付提供商 */
  paymentProvider?: string;
  /** 产品类型 */
  productType?: string;
}
