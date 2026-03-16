import type { CouponInfoVO } from './coupon-info-vo';
import type { OrderAddressVO } from './order-address-vo';
import type { OrderItemVO } from './order-item-vo';

/** 订单详情响应 */
export interface OrderDetailVO {
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
  /** 订单类型名称 */
  orderTypeName?: string;
  /** 订单标题 */
  subject?: string;
  /** 商品ID */
  productId?: string;
  /** 商品图片 */
  productImage?: string;
  /** 商品数量 */
  quantity?: number;
  /** 商品金额 */
  productAmount?: string;
  /** 运费金额 */
  shippingAmount?: string;
  /** 优惠金额 */
  discountAmount?: string;
  /** 税费金额 */
  taxAmount?: string;
  /** 订单总金额 */
  totalAmount?: string;
  /** 实际支付金额 */
  paidAmount?: string;
  /** 积分支付金额 */
  paidPointsAmount?: string;
  /** 已退款金额 */
  refundedAmount?: string;
  /** 订单状态 */
  status?: string;
  /** 订单状态名称 */
  statusName?: string;
  /** 退款状态 */
  refundStatus?: string;
  /** 退款状态名称 */
  refundStatusName?: string;
  /** 支付方式 */
  paymentMethod?: string;
  /** 支付渠道 */
  paymentProvider?: string;
  /** 交易流水号 */
  transactionId?: string;
  /** 商户订单号 */
  outTradeNo?: string;
  /** 货币类型 */
  currency?: string;
  /** 支付时间 */
  payTime?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 完成时间 */
  completeTime?: string;
  /** 取消时间 */
  cancelTime?: string;
  /** 备注 */
  remark?: string;
  /** 商户备注 */
  merchantRemark?: string;
  /** 来源渠道 */
  sourceChannel?: string;
  /** 用户ID */
  userId?: number;
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 收货人姓名 */
  receiverName?: string;
  /** 收货人电话 */
  receiverPhone?: string;
  /** 收货地址 */
  receiverAddress?: string;
  /** 物流公司 */
  logisticsCompany?: string;
  /** 物流单号 */
  logisticsNo?: string;
  /** 发货时间 */
  deliverTime?: string;
  /** 优惠券信息 */
  couponInfo?: CouponInfoVO;
  /** 订单项列表 */
  items?: OrderItemVO[];
  /** 收货地址 */
  address?: OrderAddressVO;
}
