/** 账号风险检测请求 */
export interface AccountRiskCheckForm {
  /** 用户ID */
  userId?: string;
  /** 设备ID */
  deviceId?: string;
  /** IP地址 */
  ipAddress?: string;
  /** 检测场景 */
  scene?: 'login' | 'register' | 'payment' | 'post';
  /** 地理位置 */
  location?: string;
}
