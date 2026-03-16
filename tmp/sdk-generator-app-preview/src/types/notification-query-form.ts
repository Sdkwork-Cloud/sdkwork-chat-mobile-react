/** 通知查询表单 */
export interface NotificationQueryForm {
  /** 通知类型 */
  type?: string;
  /** 是否已读 */
  read?: boolean;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortDirection?: string;
}
