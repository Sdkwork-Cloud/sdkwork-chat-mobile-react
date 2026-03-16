/** 视频审核请求 */
export interface VideoAuditForm {
  /** 视频URL */
  videoUrl: string;
  /** 内容ID */
  contentId?: string;
  /** 内容标题 */
  title?: string;
  /** 内容描述 */
  description?: string;
  /** 内容类型 */
  contentType?: 'user_video' | 'live' | 'short_video';
  /** 检测类型 */
  checkTypes?: string[];
  /** 回调地址 */
  callbackUrl?: string;
  /** 视频时长(秒) */
  duration?: number;
}
