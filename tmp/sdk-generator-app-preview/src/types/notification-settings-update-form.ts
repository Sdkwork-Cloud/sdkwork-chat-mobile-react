/** 通知设置更新表单 */
export interface NotificationSettingsUpdateForm {
  /** 是否启用推送通知 */
  enablePush?: boolean;
  /** 是否启用邮件通知 */
  enableEmail?: boolean;
  /** 是否启用短信通知 */
  enableSms?: boolean;
  /** 是否启用应用内通知 */
  enableInApp?: boolean;
  /** 免打扰开始时间 */
  quietHoursStart?: string;
  /** 免打扰结束时间 */
  quietHoursEnd?: string;
  /** 通知声音 */
  notificationSound?: string;
  /** 是否振动 */
  vibrationEnabled?: boolean;
}
