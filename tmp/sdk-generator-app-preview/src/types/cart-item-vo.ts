/** 购物车商品项响应 */
export interface CartItemVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 购物车项ID */
  itemId?: string;
  /** 购物车项UUID */
  uuid?: string;
  /** 购物车ID */
  cartId?: string;
  /** 购物车分组UUID */
  cartGroupUuid?: string;
  /** 商品ID */
  productId?: string;
  /** SKU ID */
  skuId?: string;
  /** SKU名称 */
  skuName?: string;
  /** SKU编码 */
  skuCode?: string;
  /** SKU主图 */
  skuImage?: string;
  /** SKU价格 */
  skuPrice?: number;
  /** 商品数量 */
  quantity?: number;
  /** 加入购物车时的价格 */
  price?: number;
  /** 商品总价 */
  totalPrice?: number;
  /** 是否选中 */
  selected?: boolean;
}
