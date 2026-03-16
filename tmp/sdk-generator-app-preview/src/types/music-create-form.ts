/** 创建音乐表单 */
export interface MusicCreateForm {
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 音乐URL */
  contentUrl: string;
  /** 格式 */
  format?: string;
  /** 时长(秒) */
  duration?: number;
  /** 艺术家 */
  artist?: string;
  /** 流派 */
  genre?: string;
}
