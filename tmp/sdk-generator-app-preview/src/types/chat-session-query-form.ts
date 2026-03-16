/** 查询聊天会话请求 */
export interface ChatSessionQueryForm {
  /** 会话ID */
  sessionId?: number;
  /** 会话名称 */
  name?: string;
  /** 会话类型 */
  type?: string;
  /** 分页页码 */
  page?: number;
  /** 分页大小 */
  size?: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortDirection?: string;
  /** 是否包含消息数 */
  includeMessageCount?: boolean;
}
