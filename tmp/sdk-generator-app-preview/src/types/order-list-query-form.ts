/** 查询订单列表请求 */
export interface OrderListQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 订单状态 */
  status?: string;
  /** 订单类型 */
  orderType?: string;
  /** 关键词 */
  keyword?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}
