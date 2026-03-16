/** 积分商品查询请求 */
export interface PointsGoodsQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 商品分类 */
  category?: string;
  /** 价格范围: min */
  minPoints?: number;
  /** 价格范围: max */
  maxPoints?: number;
  /** 是否可兑换 */
  exchangeable?: boolean;
  size?: number;
  page?: number;
}
