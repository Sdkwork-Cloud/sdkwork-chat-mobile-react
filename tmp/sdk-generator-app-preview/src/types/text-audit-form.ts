/** 文本审核请求 */
export interface TextAuditForm {
  /** 待审核文本内容 */
  content: string;
  /** 内容ID */
  contentId?: string;
  /** 内容类型 */
  contentType?: 'comment' | 'post' | 'nickname' | 'bio' | 'chat';
  /** 场景类型 */
  scene?: 'community' | 'chat' | 'profile' | 'live';
  /** 用户ID */
  userId?: string;
  /** 检测类型列表 */
  checkTypes?: string[];
  /** 是否异步检测 */
  async?: boolean;
}
