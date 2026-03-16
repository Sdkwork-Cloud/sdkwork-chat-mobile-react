/** 添加购物车项请求 */
export interface AddCartItemForm {
  /** SKU ID */
  skuId: number;
  /** 商品ID */
  productId: number;
  /** 商品数量 */
  quantity: number;
  /** 购物车分组UUID */
  cartGroupUuid?: string;
}
