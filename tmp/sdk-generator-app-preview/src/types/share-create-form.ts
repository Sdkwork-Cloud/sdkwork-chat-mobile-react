/** 创建分享请求 */
export interface ShareCreateForm {
  /** 分享类型 */
  shareType?: string;
  /** 分享内容ID */
  contentId?: string;
  /** 分享标题 */
  title?: string;
  /** 分享描述 */
  description?: string;
  /** 分享图片 */
  imageUrl?: string;
  /** 过期时间（秒） */
  expireSeconds?: number;
  /** 是否需要密码 */
  passwordRequired?: boolean;
  /** 分享密码 */
  password?: string;
  /** 分享渠道 */
  channel?: string;
}
