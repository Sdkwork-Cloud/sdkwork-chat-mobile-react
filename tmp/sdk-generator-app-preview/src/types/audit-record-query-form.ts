/** 审核记录查询请求 */
export interface AuditRecordQueryForm {
  /** 页码 */
  pageNum?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 排序字段 */
  sortField?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 内容类型 */
  contentType?: string;
  /** 审核结果 */
  result?: 'pass' | 'reject' | 'review' | 'suspect';
  /** 风险等级 */
  riskLevel?: 'low' | 'medium' | 'high';
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 检测类型 */
  checkTypes?: string[];
  /** 内容关键词 */
  keyword?: string;
  size?: number;
  page?: number;
}
