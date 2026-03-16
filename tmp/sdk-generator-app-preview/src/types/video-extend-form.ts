/** 视频延长请求 */
export interface VideoExtendForm {
  /** 视频URL */
  videoUrl: string;
  /** 延长时长(秒) */
  extendDuration: number;
  /** 模型 */
  model?: string;
  /** 风格 */
  style?: string;
}
