/** 通知类型设置表单 */
export interface NotificationTypeSettingsForm {
  /** 通知类型 */
  type: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 推送方式 */
  pushMethod?: string;
  /** 是否需要提醒 */
  needReminder?: boolean;
}
