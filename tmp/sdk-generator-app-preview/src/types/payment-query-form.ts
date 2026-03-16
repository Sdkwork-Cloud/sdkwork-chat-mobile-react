/** 查询支付请求 */
export interface PaymentQueryForm {
  /** 支付订单号 */
  paymentOrderId?: string;
  /** 商户订单号 */
  merchantOrderId?: string;
  /** 查询类型 */
  queryType?: string;
  /** 状态 */
  status?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
}
