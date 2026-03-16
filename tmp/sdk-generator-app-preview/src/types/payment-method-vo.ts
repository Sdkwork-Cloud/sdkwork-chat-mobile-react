import type { PaymentProductTypeVO } from './payment-product-type-vo';

/** 支付方式响应 */
export interface PaymentMethodVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 支付方式编码 */
  code?: string;
  /** 支付方式ID */
  methodId?: string;
  /** 支付方式名称 */
  methodName?: string;
  /** 支付方式图标 */
  methodIcon?: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 排序 */
  sort?: number;
  /** 图标 */
  icon?: string;
  /** 是否可用 */
  available?: boolean;
  /** 产品类型列表 */
  productTypes?: PaymentProductTypeVO[];
}
