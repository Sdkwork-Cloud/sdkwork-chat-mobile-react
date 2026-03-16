/** 用户优惠券列表查询请求 */
export interface UserCouponListForm {
  /** 状态: UNUSED-未使用, USED-已使用, EXPIRED-已过期 */
  status?: string;
  /** 优惠券类型 */
  type?: string;
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
}
