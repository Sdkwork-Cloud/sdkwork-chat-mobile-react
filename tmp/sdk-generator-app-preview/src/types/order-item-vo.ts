/** 订单商品项 */
export interface OrderItemVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 订单项ID */
  id?: string;
  /** 订单ID */
  orderId?: string;
  /** 分类ID */
  categoryId?: string;
  /** 产品类型 */
  productType?: string;
  /** 商品ID */
  productId?: string;
  /** SKU ID */
  skuId?: string;
  /** 商品名称 */
  productName?: string;
  /** 商品图片 */
  productImage?: string;
  /** 数量 */
  quantity?: number;
  /** 单价 */
  unitPrice?: string;
  /** 总金额 */
  totalAmount?: string;
  /** 优惠金额 */
  discountAmount?: string;
  /** 实付金额 */
  paidAmount?: string;
  /** 已退款金额 */
  refundedAmount?: string;
  /** SKU规格 */
  skuSpec?: string;
  /** 货币类型 */
  currency?: string;
  /** 退款状态 */
  refundStatus?: string;
  /** 评价状态 */
  reviewStatus?: string;
  /** 支付渠道 */
  paymentProvider?: string;
  /** 支付产品类型 */
  paymentProductType?: string;
  /** 过期时间 */
  expireTime?: string;
}
