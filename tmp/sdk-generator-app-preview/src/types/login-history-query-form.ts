/** 登录历史查询请求 */
export interface LoginHistoryQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 登录方式 */
  loginType?: string;
  /** 设备类型 */
  deviceType?: string;
  /** 登录状态 */
  status?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  size?: number;
  page?: number;
}
