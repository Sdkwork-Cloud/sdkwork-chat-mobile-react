/** 视频风格转换请求 */
export interface VideoStyleTransferForm {
  /** 视频URL */
  videoUrl: string;
  /** 风格 */
  style: string;
  /** 模型 */
  model?: string;
}
