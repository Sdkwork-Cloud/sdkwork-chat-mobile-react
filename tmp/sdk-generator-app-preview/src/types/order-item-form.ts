/** 订单商品项 */
export interface OrderItemForm {
  /** 商品ID */
  productId?: string;
  /** SKU ID */
  skuId?: string;
  /** 数量 */
  quantity?: number;
  /** 单价 */
  price?: string;
  /** 商品名称 */
  productName?: string;
  /** 内容类型，如PRODUCT、VIP_PACKAGE、IM_GROUP、EVENTS */
  contentType?: string;
  /** 内容ID */
  contentId?: string;
}
