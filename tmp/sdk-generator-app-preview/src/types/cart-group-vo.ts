import type { CartItemVO } from './cart-item-vo';

/** 购物车分组响应 */
export interface CartGroupVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 分组UUID */
  uuid?: string;
  /** 分组名称 */
  name?: string;
  /** 分组商品列表 */
  items?: CartItemVO[];
  /** 分组商品总数量 */
  totalQuantity?: number;
  /** 分组商品总价格 */
  totalPrice?: number;
}
