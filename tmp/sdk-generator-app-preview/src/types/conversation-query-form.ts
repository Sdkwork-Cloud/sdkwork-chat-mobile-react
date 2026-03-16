/** 查询会话列表请求 */
export interface ConversationQueryForm {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 会话类型 */
  conversationType?: string;
  /** 是否显示未读 */
  showUnread?: boolean;
  /** 关键词 */
  keyword?: string;
}
