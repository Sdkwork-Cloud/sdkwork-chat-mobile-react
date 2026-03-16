import type { TextAuditVO } from './text-audit-vo';

/** 文本审核项 */
export interface TextAuditItem {
  /** 文本ID */
  id?: string;
  /** 审核结果 */
  auditResult?: TextAuditVO;
}
