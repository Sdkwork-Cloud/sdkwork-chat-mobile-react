/** 订单统计响应 */
export interface OrderStatisticsVO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 总订单数 */
  totalOrders?: number;
  /** 待支付订单数 */
  pendingPayment?: number;
  /** 待发货订单数 */
  pendingShipment?: number;
  /** 待收货订单数 */
  pendingReceipt?: number;
  /** 已完成订单数 */
  completed?: number;
  /** 总交易金额 */
  totalAmount?: string;
}
