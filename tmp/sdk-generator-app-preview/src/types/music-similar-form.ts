/** 生成相似音乐请求 */
export interface MusicSimilarForm {
  /** 参考音乐URL */
  referenceUrl: string;
  /** 时长(秒) */
  duration?: number;
  /** 模型 */
  model?: string;
}
