export interface BrowseHistoryAddForm {
  /** 浏览类型 */
  type: string;
  /** 目标ID */
  targetId: string;
  /** 目标名称 */
  targetName?: string;
  /** 目标描述 */
  targetDescription?: string;
  /** 目标图标 */
  targetIcon?: string;
  /** 浏览时长(秒) */
  duration?: number;
  /** 浏览来源 */
  source?: string;
}
