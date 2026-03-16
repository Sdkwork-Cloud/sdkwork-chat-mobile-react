/** 取消订单请求 */
export interface OrderCancelForm {
  /** 订单ID */
  orderId?: string;
  /** 取消原因 */
  cancelReason?: string;
  /** 原因 */
  reason?: string;
  /** 取消类型 */
  cancelType?: string;
}
