/** 支持消息请求表单 */
export interface SupportMessageRequest {
  /** 会话ID */
  sessionId?: string;
  /** 消息内容 */
  content: string;
  /** 附件URL */
  attachmentUrl?: string;
}
