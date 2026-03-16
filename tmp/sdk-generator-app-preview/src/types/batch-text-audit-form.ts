import type { TextItem } from './text-item';

/** 批量文本审核请求 */
export interface BatchTextAuditForm {
  /** 待审核文本列表 */
  items: TextItem[];
  /** 检测类型列表 */
  checkTypes?: string[];
  /** 场景类型 */
  scene?: string;
}
