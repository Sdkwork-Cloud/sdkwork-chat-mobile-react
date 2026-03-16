/** 图片审核请求 */
export interface ImageAuditForm {
  /** 图片URL */
  imageUrl: string;
  /** 图片Base64数据 */
  imageBase64?: string;
  /** 内容ID */
  contentId?: string;
  /** 内容类型 */
  contentType?: 'avatar' | 'post_image' | 'comment_image';
  /** 检测类型 */
  checkTypes?: string[];
  /** 场景类型 */
  scene?: string;
  /** 是否异步检测 */
  async?: boolean;
}
