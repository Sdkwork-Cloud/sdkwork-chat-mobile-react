/** 购物车统计响应 */
export interface CartStatisticsVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 购物车ID */
  cartId?: string;
  /** 商品种类数 */
  itemCount?: number;
  /** 商品总数量 */
  totalQuantity?: number;
  /** 商品总价格 */
  totalPrice?: number;
  /** 选中商品种类数 */
  selectedItemCount?: number;
  /** 选中商品总数量 */
  selectedQuantity?: number;
  /** 选中商品总价格 */
  selectedPrice?: number;
}
