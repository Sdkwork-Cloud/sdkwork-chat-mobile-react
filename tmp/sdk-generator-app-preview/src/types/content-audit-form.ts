/** 综合内容审核请求 */
export interface ContentAuditForm {
  /** 内容ID */
  contentId: string;
  /** 文本内容 */
  textContent?: string;
  /** 图片URL列表 */
  imageUrls?: string[];
  /** 视频URL */
  videoUrl?: string;
  /** 音频URL */
  audioUrl?: string;
  /** 内容类型 */
  contentType?: 'post' | 'comment' | 'profile' | 'message';
  /** 场景类型 */
  scene?: string;
  /** 检测类型 */
  checkTypes?: string[];
  /** 元数据 */
  metadata?: Record<string, unknown>;
  /** 用户ID */
  userId?: string;
}
