/** 查询分享访客请求 */
export interface ShareVisitorQueryForm {
  /** 分享ID */
  shareId?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}
