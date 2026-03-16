/** 订单响应 */
export interface OrderVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 订单ID */
  orderId?: string;
  /** 订单编号 */
  orderSn?: string;
  /** 订单类型 */
  orderType?: string;
  /** 订单标题 */
  subject?: string;
  /** 商品图片 */
  productImage?: string;
  /** 商品数量 */
  quantity?: number;
  /** 订单总金额 */
  totalAmount?: string;
  /** 实际支付金额 */
  paidAmount?: string;
  /** 积分支付金额 */
  paidPointsAmount?: string;
  /** 优惠金额 */
  discountAmount?: string;
  /** 运费金额 */
  shippingAmount?: string;
  /** 订单状态 */
  status?: string;
  /** 订单状态名称 */
  statusName?: string;
  /** 退款状态 */
  refundStatus?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付渠道 */
  paymentProvider?: string;
  /** 支付时间 */
  payTime?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 备注 */
  remark?: string;
}
