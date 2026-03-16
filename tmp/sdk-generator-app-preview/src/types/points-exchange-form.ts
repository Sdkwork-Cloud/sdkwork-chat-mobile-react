/** 积分兑换请求 */
export interface PointsExchangeForm {
  /** 兑换数量 */
  quantity: number;
  /** 收货地址ID(实物商品) */
  addressId?: string;
  /** 备注 */
  remark?: string;
}
