/** 查询分享请求 */
export interface ShareQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 分享类型 */
  shareType?: string;
  /** 状态 */
  status?: string;
  /** 关键词 */
  keyword?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}
