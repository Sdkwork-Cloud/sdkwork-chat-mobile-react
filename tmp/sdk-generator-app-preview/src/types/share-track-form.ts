/** 分享追踪请求 */
export interface ShareTrackForm {
  /** 分享ID */
  shareId?: string;
  /** 追踪类型 */
  trackType?: string;
  /** 用户代理 */
  userAgent?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 设备信息 */
  deviceInfo?: string;
}
