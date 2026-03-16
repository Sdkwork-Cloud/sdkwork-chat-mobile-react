/** 页面访问追踪请求 */
export interface PageViewTrackForm {
  /** 页面URL */
  pageUrl: string;
  /** 页面标题 */
  pageTitle?: string;
  /** 来源URL */
  referrer?: string;
  /** 访问时间 */
  timestamp?: string;
  /** 设备ID */
  deviceId?: string;
  /** 用户ID */
  userId?: string;
  /** 页面属性 */
  properties?: Record<string, unknown>;
  /** 会话ID */
  sessionId?: string;
  /** 访问时长（秒） */
  duration?: number;
}
