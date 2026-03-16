/** 语音转文字审核请求 */
export interface AudioAsrAuditForm {
  /** 音频URL */
  audioUrl: string;
  /** 内容ID */
  contentId?: string;
  /** 语言类型 */
  language?: string;
  /** 检测类型 */
  checkTypes?: string[];
  /** 是否返回时间戳 */
  withTimestamp?: boolean;
}
