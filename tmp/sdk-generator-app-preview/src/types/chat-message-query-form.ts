/** 查询聊天消息请求 */
export interface ChatMessageQueryForm {
  /** 会话ID */
  sessionId?: number;
  /** 消息ID */
  messageId?: number;
  /** 分页页码 */
  page?: number;
  /** 分页大小 */
  size?: number;
  /** 排序方向 */
  sort?: string;
}
