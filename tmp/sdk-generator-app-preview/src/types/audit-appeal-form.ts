/** 审核申诉请求 */
export interface AuditAppealForm {
  /** 申诉原因 */
  reason: string;
  /** 补充说明 */
  description?: string;
  /** 证明材料URL */
  evidenceUrl?: string;
  /** 联系邮箱 */
  contactEmail?: string;
  /** 期望处理方式 */
  expectedAction?: 're_review' | 'whitelist' | 'other';
}
