/** 更新安全设置请求 */
export interface SecuritySettingsUpdateForm {
  /** 是否启用两步验证 */
  twoFactorEnabled?: boolean;
  /** 是否启用生物识别 */
  biometricEnabled?: boolean;
  /** 是否启用自动锁定 */
  autoLockEnabled?: boolean;
  /** 自动锁定时间（分钟） */
  autoLockMinutes?: number;
  /** 是否启用登录通知 */
  loginNotificationsEnabled?: boolean;
  /** 是否启用IP限制 */
  ipRestrictionEnabled?: boolean;
  /** 允许的IP列表 */
  allowedIps?: string[];
  /** 是否启用密码强度检查 */
  passwordStrengthCheckEnabled?: boolean;
  /** 密码过期时间（天） */
  passwordExpiryDays?: number;
}
