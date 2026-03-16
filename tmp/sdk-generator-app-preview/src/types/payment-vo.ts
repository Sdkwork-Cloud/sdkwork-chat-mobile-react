/** 支付响应 */
export interface PaymentVO {
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
  /** 支付金额 */
  amount?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付链接 */
  paymentUrl?: string;
  /** 二维码 */
  qrCode?: string;
  /** 支付ID */
  paymentId?: number;
  /** 支付流水号 */
  paymentSn?: string;
  /** 订单ID */
  orderId?: number;
  /** 订单标题 */
  subject?: string;
  /** 支付提供商 */
  paymentProvider?: string;
  /** 支付提供商名称 */
  paymentProviderName?: string;
  /** 产品类型 */
  productType?: string;
  /** 产品类型名称 */
  productTypeName?: string;
  /** 状态名称 */
  statusName?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 是否需要查询 */
  needQuery?: boolean;
  /** 查询间隔 */
  queryInterval?: number;
  /** 备注 */
  remark?: string;
  /** 支付参数 */
  paymentParams?: Record<string, unknown>;
  /** 交易ID */
  transactionId?: string;
  /** 商户订单号 */
  outTradeNo?: string;
  /** 支付成功时间 */
  successTime?: string;
}
