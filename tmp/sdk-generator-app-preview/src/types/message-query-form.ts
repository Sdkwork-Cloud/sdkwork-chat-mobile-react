/** 查询消息列表请求 */
export interface MessageQueryForm {
  /** 会话ID */
  conversationId?: string;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  size?: number;
  /** 消息类型 */
  messageType?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
}
