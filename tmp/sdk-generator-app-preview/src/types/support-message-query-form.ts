/** 支持消息查询表单 */
export interface SupportMessageQueryForm {
  /** 会话ID */
  sessionId?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
}
