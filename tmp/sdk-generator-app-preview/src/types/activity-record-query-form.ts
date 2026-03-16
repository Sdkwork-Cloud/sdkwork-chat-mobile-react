/** 活动参与记录查询请求 */
export interface ActivityRecordQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 活动ID */
  activityId?: string;
  /** 记录类型: join/check-in/lottery */
  recordType?: string;
  size?: number;
  page?: number;
}
