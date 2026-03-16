/** 公告查询Form */
export interface AnnouncementQueryForm {
  /** 公告类型 */
  type?: string;
  /** 公告状态 */
  status?: string;
  /** 每页大小 */
  pageSize?: number;
  /** 页码 */
  pageNum?: number;
}
