/** 音乐延长请求 */
export interface MusicExtendForm {
  /** 音乐URL */
  musicUrl: string;
  /** 延长时长(秒) */
  extendDuration: number;
  /** 模型 */
  model?: string;
  /** 风格 */
  style?: string;
}
