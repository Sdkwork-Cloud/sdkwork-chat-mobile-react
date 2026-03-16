/** 分享访问请求 */
export interface ShareVisitForm {
  /** 分享ID */
  shareId?: string;
  /** 访问类型 */
  visitType?: string;
  /** 用户代理 */
  userAgent?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 设备信息 */
  deviceInfo?: string;
}
