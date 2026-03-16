/** 支付状态响应 */
export interface PaymentStatusVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 支付订单号 */
  paymentOrderId?: string;
  /** 商户订单号 */
  merchantOrderId?: string;
  /** 支付状态 */
  status?: string;
  /** 状态名称 */
  statusName?: string;
  /** 支付金额 */
  amount?: string;
  /** 支付时间 */
  payTime?: number;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付ID */
  paymentId?: number;
  /** 支付流水号 */
  paymentSn?: string;
  /** 订单ID */
  orderId?: number;
  /** 支付提供商 */
  paymentProvider?: string;
  /** 交易ID */
  transactionId?: string;
  /** 商户订单号 */
  outTradeNo?: string;
  /** 支付成功时间 */
  successTime?: string;
}
