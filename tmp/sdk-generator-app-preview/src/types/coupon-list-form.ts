/** 优惠券列表查询请求 */
export interface CouponListForm {
  /** 优惠券类型: DISCOUNT-折扣券, CASH-代金券, GIFT-礼品券, POINTS_EXCHANGE-积分兑换券 */
  type?: string;
  /** 状态: ACTIVE/UNUSED-可领, INACTIVE-不可用, USED/EXPIRED-历史状态 */
  status?: string;
  /** 关键词 */
  keyword?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
}
