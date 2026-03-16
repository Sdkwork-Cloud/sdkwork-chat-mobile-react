/** 音频审核请求 */
export interface AudioAuditForm {
  /** 音频URL */
  audioUrl: string;
  /** 音频格式 */
  format?: 'mp3' | 'wav' | 'aac' | 'm4a';
  /** 内容ID */
  contentId?: string;
  /** 音频时长(秒) */
  duration?: number;
  /** 检测类型 */
  checkTypes?: string[];
  /** 采样率 */
  sampleRate?: number;
}
