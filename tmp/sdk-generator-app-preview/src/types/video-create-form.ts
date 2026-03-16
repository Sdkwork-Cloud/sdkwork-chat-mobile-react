/** 创建视频表单 */
export interface VideoCreateForm {
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 视频URL */
  contentUrl: string;
  /** 格式 */
  format?: string;
  /** 时长(秒) */
  duration?: number;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 分类ID */
  categoryId?: number;
}
