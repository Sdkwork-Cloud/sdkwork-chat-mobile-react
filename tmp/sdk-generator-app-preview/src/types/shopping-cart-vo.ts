import type { CartGroupVO } from './cart-group-vo';

/** 购物车响应 */
export interface ShoppingCartVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 购物车ID */
  cartId?: string;
  /** 购物车UUID */
  uuid?: string;
  /** 购物车名称 */
  name?: string;
  /** 购物车描述 */
  description?: string;
  /** 所有者类型 */
  owner?: string;
  /** 所有者ID */
  ownerId?: number;
  /** 购物车状态 */
  status?: string;
  /** 购物车分组列表 */
  groups?: CartGroupVO[];
  /** 商品总数量 */
  totalQuantity?: number;
  /** 商品总价格 */
  totalPrice?: number;
  /** 选中商品总数量 */
  selectedQuantity?: number;
  /** 选中商品总价格 */
  selectedPrice?: number;
}
