/** 申请退款请求 */
export interface RefundApplyForm {
  /** 订单ID */
  orderId?: string;
  /** 退款金额 */
  refundAmount?: string;
  /** 退款原因 */
  refundReason?: string;
  /** 原因 */
  reason?: string;
  /** 退款类型 */
  refundType?: string;
  /** 凭证图片 */
  proofImage?: string;
}
