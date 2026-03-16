/** 发送消息请求 */
export interface SendMessageForm {
  /** 接收者ID */
  recipientId?: string;
  /** 消息内容 */
  content?: string;
  /** 消息类型 */
  messageType?: string;
  /** 会话ID */
  conversationId?: string;
  /** 附件URL */
  attachmentUrl?: string;
}
