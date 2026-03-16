/** 更新分享请求 */
export interface ShareUpdateForm {
  /** 分享ID */
  shareId?: string;
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
  /** 状态 */
  status?: string;
}
