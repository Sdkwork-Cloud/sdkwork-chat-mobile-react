/** 音乐混音请求 */
export interface MusicRemixForm {
  /** 音乐URL */
  musicUrl: string;
  /** 风格 */
  style: string;
  /** 模型 */
  model?: string;
}
