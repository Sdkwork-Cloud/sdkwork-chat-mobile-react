/** 订单支付请求 */
export interface OrderPayForm {
  /** 订单ID */
  orderId?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付金额 */
  amount?: string;
  /** 支付密码 */
  paymentPassword?: string;
  /** 客户端IP */
  clientIp?: string;
}
