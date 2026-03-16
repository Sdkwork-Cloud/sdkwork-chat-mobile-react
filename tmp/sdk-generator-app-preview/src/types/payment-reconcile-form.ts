/** 支付补单请求 */
export interface PaymentReconcileForm {
  /** 订单ID，与outTradeNo二选一 */
  orderId?: string;
  /** 支付商户单号，与orderId二选一 */
  outTradeNo?: string;
  /** 补单类型: ORDER_ID / OUT_TRADE_NO */
  reconcileType: string;
}
