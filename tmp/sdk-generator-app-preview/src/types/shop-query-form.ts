/** 店铺查询请求 */
export interface ShopQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 关键词 */
  keyword?: string;
  /** 状态: ACTIVE-营业中, INACTIVE-已关闭 */
  status?: string;
}
