/** 事件追踪请求 */
export interface EventTrackForm {
  /** 事件名称 */
  eventName: string;
  /** 事件类型 */
  eventType?: string;
  /** 事件发生时间 */
  timestamp?: string;
  /** 设备ID */
  deviceId?: string;
  /** 用户ID */
  userId?: string;
  /** 事件属性 */
  properties?: Record<string, unknown>;
  /** 会话ID */
  sessionId?: string;
  /** 页面URL */
  pageUrl?: string;
  /** 来源URL */
  referrer?: string;
}
